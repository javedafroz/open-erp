-- Migration: Fix recursive trigger issue and update computed fields logic
-- Created: 2024-01-02
-- Description: Fix infinite recursion in account trigger and optimize computed field updates

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS update_account_hierarchy ON crm.accounts;

-- Drop the old function
DROP FUNCTION IF EXISTS crm.update_account_computed_fields();

-- Create a safer version of the trigger function that avoids recursion
CREATE OR REPLACE FUNCTION crm.update_account_computed_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip if we're already in a trigger to prevent recursion
    IF current_setting('local.in_account_trigger', true) = 'true' THEN
        RETURN NEW;
    END IF;
    
    -- Set flag to prevent recursion
    PERFORM set_config('local.in_account_trigger', 'true', true);
    
    -- Only update computed fields if parent_account_id changed
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.parent_account_id IS DISTINCT FROM NEW.parent_account_id) THEN
        
        -- Update the current record's is_parent_account flag in memory (not in DB to avoid recursion)
        NEW.is_parent_account = EXISTS (
            SELECT 1 FROM crm.accounts 
            WHERE parent_account_id = NEW.id
        );
        
        -- Update parent account's child count (if parent changed)
        IF NEW.parent_account_id IS NOT NULL THEN
            UPDATE crm.accounts 
            SET child_accounts_count = (
                SELECT COUNT(*) 
                FROM crm.accounts 
                WHERE parent_account_id = NEW.parent_account_id
            )
            WHERE id = NEW.parent_account_id;
        END IF;
        
        -- Update old parent's child count (for updates where parent changed)
        IF TG_OP = 'UPDATE' AND OLD.parent_account_id IS NOT NULL 
           AND OLD.parent_account_id != NEW.parent_account_id THEN
            UPDATE crm.accounts 
            SET child_accounts_count = (
                SELECT COUNT(*) 
                FROM crm.accounts 
                WHERE parent_account_id = OLD.parent_account_id
            )
            WHERE id = OLD.parent_account_id;
        END IF;
        
    END IF;
    
    -- Reset the flag
    PERFORM set_config('local.in_account_trigger', 'false', true);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger with the fixed function
CREATE TRIGGER update_account_hierarchy
    BEFORE INSERT OR UPDATE ON crm.accounts
    FOR EACH ROW EXECUTE FUNCTION crm.update_account_computed_fields();

-- Create a separate function to batch update all computed fields (for maintenance)
CREATE OR REPLACE FUNCTION crm.refresh_account_computed_fields()
RETURNS VOID AS $$
BEGIN
    -- Update all is_parent_account flags
    UPDATE crm.accounts 
    SET is_parent_account = (
        SELECT EXISTS (
            SELECT 1 FROM crm.accounts child 
            WHERE child.parent_account_id = crm.accounts.id
        )
    );
    
    -- Update all child_accounts_count
    UPDATE crm.accounts 
    SET child_accounts_count = (
        SELECT COUNT(*) 
        FROM crm.accounts child 
        WHERE child.parent_account_id = crm.accounts.id
    );
    
    -- Update contacts_count
    UPDATE crm.accounts 
    SET contacts_count = (
        SELECT COUNT(*) 
        FROM crm.contacts 
        WHERE account_id = crm.accounts.id
    );
    
    -- Update opportunities_count and total_opportunity_value (only if opportunities table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'opportunities') THEN
        UPDATE crm.accounts 
        SET 
            opportunities_count = COALESCE(opp_stats.count, 0),
            total_opportunity_value = COALESCE(opp_stats.total_value, 0)
        FROM (
            SELECT 
                account_id,
                COUNT(*) as count,
                SUM(amount) as total_value
            FROM crm.opportunities
            GROUP BY account_id
        ) opp_stats
        WHERE crm.accounts.id = opp_stats.account_id;
        
        -- Set zero values for accounts with no opportunities
        UPDATE crm.accounts 
        SET 
            opportunities_count = 0,
            total_opportunity_value = 0
        WHERE id NOT IN (SELECT DISTINCT account_id FROM crm.opportunities WHERE account_id IS NOT NULL);
    ELSE
        -- Set default values if opportunities table doesn't exist yet
        UPDATE crm.accounts 
        SET 
            opportunities_count = 0,
            total_opportunity_value = 0;
    END IF;
    
END;
$$ language 'plpgsql';

-- Run the refresh function once to fix any existing data
SELECT crm.refresh_account_computed_fields();

-- Migration: Create CRM Schema and Initial Tables
-- Created: 2024-01-01
-- Description: Initialize CRM schema with leads, accounts, contacts, and opportunities tables

-- Create CRM schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS crm;

-- Set search path to include CRM schema
SET search_path TO crm, public;

-- Create enum types
CREATE TYPE crm.lead_status AS ENUM (
    'new',
    'qualified', 
    'contacted',
    'converted',
    'lost'
);

CREATE TYPE crm.account_type AS ENUM (
    'prospect',
    'customer',
    'partner',
    'competitor',
    'other'
);

CREATE TYPE crm.opportunity_stage AS ENUM (
    'prospecting',
    'qualification',
    'needs_analysis', 
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
);

-- Create leads table
CREATE TABLE IF NOT EXISTS crm.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    company VARCHAR(255),
    job_title VARCHAR(100),
    status crm.lead_status DEFAULT 'new',
    source VARCHAR(100) NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    assigned_to_id UUID,
    converted_account_id UUID,
    converted_contact_id UUID,
    converted_opportunity_id UUID,
    converted_at TIMESTAMP WITH TIME ZONE,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB,
    full_name VARCHAR(201) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    is_converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    CONSTRAINT unique_email_per_org UNIQUE (email, organization_id)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS crm.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type crm.account_type DEFAULT 'prospect',
    industry VARCHAR(100),
    website VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    billing_address JSONB,
    shipping_address JSONB,
    description TEXT,
    revenue DECIMAL(15,2) CHECK (revenue >= 0),
    employee_count INTEGER CHECK (employee_count >= 1),
    parent_account_id UUID,
    owner_id UUID NOT NULL,
    tags TEXT[],
    custom_fields JSONB,
    
    -- Computed fields
    is_parent_account BOOLEAN DEFAULT FALSE,
    child_accounts_count INTEGER DEFAULT 0,
    contacts_count INTEGER DEFAULT 0,
    opportunities_count INTEGER DEFAULT 0,
    total_opportunity_value DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    CONSTRAINT unique_account_name_per_org UNIQUE (name, organization_id),
    CONSTRAINT fk_parent_account FOREIGN KEY (parent_account_id) REFERENCES crm.accounts(id) ON DELETE SET NULL
);

-- Create contacts table  
CREATE TABLE IF NOT EXISTS crm.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    mobile_number VARCHAR(20),
    job_title VARCHAR(100),
    department VARCHAR(100),
    account_id UUID,
    reporting_to_id UUID,
    is_primary BOOLEAN DEFAULT FALSE,
    do_not_call BOOLEAN DEFAULT FALSE,
    do_not_email BOOLEAN DEFAULT FALSE,
    birthday DATE,
    address JSONB,
    social_media JSONB,
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB,
    
    -- Computed fields
    full_name VARCHAR(201) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    opportunities_count INTEGER DEFAULT 0,
    total_opportunity_value DECIMAL(15,2) DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_email_sent_at TIMESTAMP WITH TIME ZONE,
    last_call_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    CONSTRAINT unique_contact_email_per_org UNIQUE (email, organization_id),
    CONSTRAINT fk_contact_account FOREIGN KEY (account_id) REFERENCES crm.accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_contact_reporting_to FOREIGN KEY (reporting_to_id) REFERENCES crm.contacts(id) ON DELETE SET NULL
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS crm.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    account_id UUID NOT NULL,
    contact_id UUID,
    owner_id UUID NOT NULL,
    stage crm.opportunity_stage DEFAULT 'prospecting',
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE NOT NULL,
    actual_close_date DATE,
    source VARCHAR(100) NOT NULL,
    competitor_ids TEXT[],
    products_services JSONB,
    next_step TEXT,
    reason_lost TEXT,
    tags TEXT[],
    custom_fields JSONB,
    team_members JSONB,
    
    -- Computed fields
    weighted_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount * (probability / 100.0)) STORED,
    days_in_stage INTEGER,
    total_sales_cycle_days INTEGER,
    is_won BOOLEAN GENERATED ALWAYS AS (stage = 'closed_won') STORED,
    is_lost BOOLEAN GENERATED ALWAYS AS (stage = 'closed_lost') STORED,
    is_closed BOOLEAN GENERATED ALWAYS AS (stage IN ('closed_won', 'closed_lost')) STORED,
    is_overdue BOOLEAN GENERATED ALWAYS AS (expected_close_date < CURRENT_DATE AND stage NOT IN ('closed_won', 'closed_lost')) STORED,
    last_stage_change_at TIMESTAMP WITH TIME ZONE,
    previous_stage VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    CONSTRAINT fk_opportunity_account FOREIGN KEY (account_id) REFERENCES crm.accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_opportunity_contact FOREIGN KEY (contact_id) REFERENCES crm.contacts(id) ON DELETE SET NULL
);

-- Create indexes for better query performance

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON crm.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON crm.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_id ON crm.leads(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON crm.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_score ON crm.leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_source ON crm.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_is_converted ON crm.leads(is_converted);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON crm.leads USING GIN(tags);

-- Accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_name ON crm.accounts(name);
CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON crm.accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON crm.accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_owner_id ON crm.accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON crm.accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_industry ON crm.accounts(industry);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_account_id ON crm.accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_tags ON crm.accounts USING GIN(tags);

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON crm.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON crm.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON crm.contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON crm.contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON crm.contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON crm.contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_contacts_reporting_to_id ON crm.contacts(reporting_to_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON crm.contacts USING GIN(tags);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_name ON crm.opportunities(name);
CREATE INDEX IF NOT EXISTS idx_opportunities_organization_id ON crm.opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_account_id ON crm.opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON crm.opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON crm.opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON crm.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_expected_close_date ON crm.opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON crm.opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_amount ON crm.opportunities(amount);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_closed ON crm.opportunities(is_closed);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_overdue ON crm.opportunities(is_overdue);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON crm.opportunities USING GIN(tags);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION crm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON crm.leads 
    FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON crm.accounts 
    FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON crm.contacts 
    FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON crm.opportunities 
    FOR EACH ROW EXECUTE FUNCTION crm.update_updated_at_column();

-- Note: Account computed fields trigger will be created in migration 002-fix-triggers.sql
-- to avoid recursion issues during initial data population

-- Sample data will be inserted via the application or separate seed scripts

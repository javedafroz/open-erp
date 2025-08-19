import { Repository, FindOptionsWhere, FindManyOptions, Between, Like, In } from 'typeorm';
import { createLogger, validatePaginationParams, createPaginationResult } from '@erp/utils';
import { LeadStatus } from '@erp/shared';
import { 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  ConvertLeadRequest,
  LeadAnalytics,
  PaginationParams,
  PaginatedResponse 
} from '@erp/types';
import { Lead } from '../models/lead.entity';
import { Account } from '../models/account.entity';
import { Contact } from '../models/contact.entity';
import { Opportunity } from '../models/opportunity.entity';
import { DatabaseService } from '../config/database';

export interface LeadFilter {
  status?: LeadStatus[];
  assignedToId?: string[];
  source?: string[];
  scoreRange?: { min: number; max: number };
  dateRange?: { startDate: Date; endDate: Date };
  tags?: string[];
  companyName?: string;
  city?: string;
  isConverted?: boolean;
}

export interface LeadSearchOptions extends PaginationParams {
  search?: string;
  filters?: LeadFilter;
  organizationId: string;
}

export class LeadService {
  private leadRepository: Repository<Lead> | null = null;
  private accountRepository: Repository<Account> | null = null;
  private contactRepository: Repository<Contact> | null = null;
  private opportunityRepository: Repository<Opportunity> | null = null;
  private logger = createLogger('LeadService');

  constructor() {
    // Initialize repositories lazily when database is available
  }

  private getRepositories() {
    if (!this.getRepositories().leadRepository) {
      const dataSource = DatabaseService.getInstance().getDataSource();
      this.getRepositories().leadRepository = dataSource.getRepository(Lead);
      this.getRepositories().accountRepository = dataSource.getRepository(Account);
      this.getRepositories().contactRepository = dataSource.getRepository(Contact);
      this.getRepositories().opportunityRepository = dataSource.getRepository(Opportunity);
    }
    return {
      leadRepository: this.getRepositories().leadRepository!,
      accountRepository: this.getRepositories().accountRepository!,
      contactRepository: this.getRepositories().contactRepository!,
      opportunityRepository: this.getRepositories().opportunityRepository!,
    };
  }

  async createLead(data: CreateLeadRequest, createdById: string, organizationId: string): Promise<Lead> {
    try {
      const { leadRepository } = this.getRepositories();
      
      // Check for duplicate email
      const existingLead = await leadRepository.findOne({
        where: { email: data.email, organizationId }
      });

      if (existingLead) {
        throw new Error('Lead with this email already exists');
      }

      const lead = leadRepository.create({
        ...data,
        createdById,
        organizationId,
        status: LeadStatus.NEW,
      });

      const savedLead = await leadRepository.save(lead);
      
      this.logger.info('Lead created successfully', { 
        leadId: savedLead.id, 
        email: savedLead.email,
        createdById 
      });

      return savedLead;
    } catch (error) {
      this.logger.error('Failed to create lead', { error, data });
      throw error;
    }
  }

  async updateLead(id: string, data: UpdateLeadRequest, organizationId: string): Promise<Lead> {
    try {
      const lead = await this.getRepositories().leadRepository.findOne({
        where: { id, organizationId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Check for duplicate email if email is being updated
      if (data.email && data.email !== lead.email) {
        const existingLead = await this.getRepositories().leadRepository.findOne({
          where: { email: data.email, organizationId }
        });

        if (existingLead) {
          throw new Error('Lead with this email already exists');
        }
      }

      Object.assign(lead, data);
      const updatedLead = await this.getRepositories().leadRepository.save(lead);

      this.logger.info('Lead updated successfully', { 
        leadId: updatedLead.id,
        changes: data 
      });

      return updatedLead;
    } catch (error) {
      this.logger.error('Failed to update lead', { error, leadId: id });
      throw error;
    }
  }

  async getLeadById(id: string, organizationId: string): Promise<Lead | null> {
    try {
      return await this.getRepositories().leadRepository.findOne({
        where: { id, organizationId },
        cache: 30000, // 30 seconds cache
      });
    } catch (error) {
      this.logger.error('Failed to get lead by ID', { error, leadId: id });
      throw error;
    }
  }

  async getLeadsByIds(ids: string[], organizationId: string): Promise<Lead[]> {
    try {
      if (ids.length === 0) return [];

      return await this.getRepositories().leadRepository.find({
        where: { id: In(ids), organizationId },
        cache: 30000,
      });
    } catch (error) {
      this.logger.error('Failed to get leads by IDs', { error, leadIds: ids });
      throw error;
    }
  }

  async searchLeads(options: LeadSearchOptions): Promise<PaginatedResponse<Lead>> {
    try {
      const { page, limit, offset } = validatePaginationParams(options);
      const { search, filters, organizationId } = options;

      let queryBuilder = this.getRepositories().leadRepository
        .createQueryBuilder('lead')
        .where('lead.organizationId = :organizationId', { organizationId });

      // Apply search
      if (search) {
        queryBuilder = queryBuilder.andWhere(
          '(lead.firstName ILIKE :search OR lead.lastName ILIKE :search OR lead.email ILIKE :search OR lead.company ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          queryBuilder = queryBuilder.andWhere('lead.status IN (:...status)', { 
            status: filters.status 
          });
        }

        if (filters.assignedToId && filters.assignedToId.length > 0) {
          queryBuilder = queryBuilder.andWhere('lead.assignedToId IN (:...assignedToId)', { 
            assignedToId: filters.assignedToId 
          });
        }

        if (filters.source && filters.source.length > 0) {
          queryBuilder = queryBuilder.andWhere('lead.source IN (:...source)', { 
            source: filters.source 
          });
        }

        if (filters.scoreRange) {
          queryBuilder = queryBuilder.andWhere(
            'lead.score BETWEEN :minScore AND :maxScore',
            { minScore: filters.scoreRange.min, maxScore: filters.scoreRange.max }
          );
        }

        if (filters.dateRange) {
          queryBuilder = queryBuilder.andWhere(
            'lead.createdAt BETWEEN :startDate AND :endDate',
            { startDate: filters.dateRange.startDate, endDate: filters.dateRange.endDate }
          );
        }

        if (filters.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.andWhere(
            'lead.tags && :tags',
            { tags: filters.tags }
          );
        }

        if (filters.companyName) {
          queryBuilder = queryBuilder.andWhere(
            'lead.company ILIKE :companyName',
            { companyName: `%${filters.companyName}%` }
          );
        }

        if (filters.isConverted !== undefined) {
          queryBuilder = queryBuilder.andWhere(
            'lead.isConverted = :isConverted',
            { isConverted: filters.isConverted }
          );
        }
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination and sorting
      const leads = await queryBuilder
        .orderBy('lead.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return createPaginationResult(leads, total, page, limit);
    } catch (error) {
      this.logger.error('Failed to search leads', { error, options });
      throw error;
    }
  }

  async deleteLead(id: string, organizationId: string): Promise<void> {
    try {
      const lead = await this.getRepositories().leadRepository.findOne({
        where: { id, organizationId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Check if lead is converted - may want to prevent deletion
      if (lead.isConverted) {
        throw new Error('Cannot delete converted lead');
      }

      await this.getRepositories().leadRepository.remove(lead);

      this.logger.info('Lead deleted successfully', { leadId: id });
    } catch (error) {
      this.logger.error('Failed to delete lead', { error, leadId: id });
      throw error;
    }
  }

  async convertLead(
    id: string, 
    conversionData: ConvertLeadRequest, 
    convertedById: string, 
    organizationId: string
  ): Promise<{
    account?: Account;
    contact?: Contact;
    opportunity?: Opportunity;
    lead: Lead;
  }> {
    const queryRunner = DatabaseService.getInstance().getDataSource().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lead = await queryRunner.manager.findOne(Lead, {
        where: { id, organizationId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      if (lead.isConverted) {
        throw new Error('Lead is already converted');
      }

      if (lead.status !== LeadStatus.QUALIFIED) {
        throw new Error('Lead must be qualified before conversion');
      }

      let account: Account | undefined;
      let contact: Contact | undefined;
      let opportunity: Opportunity | undefined;

      // Create Account if requested
      if (conversionData.createAccount && conversionData.accountName) {
        account = queryRunner.manager.create(Account, {
          name: conversionData.accountName,
          type: 'prospect',
          email: lead.email,
          phoneNumber: lead.phoneNumber,
          description: `Converted from lead: ${lead.firstName} ${lead.lastName}`,
          ownerId: lead.assignedToId || convertedById,
          createdById: convertedById,
          organizationId,
        });
        account = await queryRunner.manager.save(account);
      }

      // Create Contact if requested
      if (conversionData.createContact) {
        contact = queryRunner.manager.create(Contact, {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phoneNumber: lead.phoneNumber,
          jobTitle: lead.jobTitle,
          accountId: account?.id,
          isPrimary: true,
          notes: lead.notes,
          tags: lead.tags,
          customFields: lead.customFields,
          createdById: convertedById,
          organizationId,
        });
        contact = await queryRunner.manager.save(contact);
      }

      // Create Opportunity if requested
      if (conversionData.createOpportunity && conversionData.opportunityName) {
        if (!account) {
          throw new Error('Cannot create opportunity without an account');
        }

        opportunity = queryRunner.manager.create(Opportunity, {
          name: conversionData.opportunityName,
          description: `Converted from lead: ${lead.firstName} ${lead.lastName}`,
          accountId: account.id,
          contactId: contact?.id,
          ownerId: lead.assignedToId || convertedById,
          stage: conversionData.opportunityStage || 'prospecting',
          amount: conversionData.opportunityAmount || 0,
          currency: 'USD',
          probability: 25, // Default for new opportunities
          expectedCloseDate: conversionData.expectedCloseDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          source: lead.source,
          tags: lead.tags,
          customFields: lead.customFields,
          createdById: convertedById,
          organizationId,
        });
        opportunity = await queryRunner.manager.save(opportunity);
      }

      // Update lead with conversion information
      lead.status = LeadStatus.CONVERTED;
      lead.convertedAt = new Date();
      lead.convertedAccountId = account?.id;
      lead.convertedContactId = contact?.id;
      lead.convertedOpportunityId = opportunity?.id;
      lead.isConverted = true;

      const convertedLead = await queryRunner.manager.save(lead);

      await queryRunner.commitTransaction();

      this.logger.info('Lead converted successfully', {
        leadId: id,
        accountId: account?.id,
        contactId: contact?.id,
        opportunityId: opportunity?.id,
        convertedById,
      });

      return {
        lead: convertedLead,
        account,
        contact,
        opportunity,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to convert lead', { error, leadId: id });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateLeadScore(id: string, score: number, organizationId: string): Promise<Lead> {
    try {
      if (score < 0 || score > 100) {
        throw new Error('Score must be between 0 and 100');
      }

      const lead = await this.getRepositories().leadRepository.findOne({
        where: { id, organizationId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      lead.score = score;
      const updatedLead = await this.getRepositories().leadRepository.save(lead);

      this.logger.info('Lead score updated', { leadId: id, score });

      return updatedLead;
    } catch (error) {
      this.logger.error('Failed to update lead score', { error, leadId: id, score });
      throw error;
    }
  }

  async assignLead(id: string, assignedToId: string, organizationId: string): Promise<Lead> {
    try {
      const lead = await this.getRepositories().leadRepository.findOne({
        where: { id, organizationId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      lead.assignedToId = assignedToId;
      const updatedLead = await this.getRepositories().leadRepository.save(lead);

      this.logger.info('Lead assigned', { leadId: id, assignedToId });

      return updatedLead;
    } catch (error) {
      this.logger.error('Failed to assign lead', { error, leadId: id, assignedToId });
      throw error;
    }
  }

  async bulkAssignLeads(leadIds: string[], assignedToId: string, organizationId: string): Promise<void> {
    try {
      await this.getRepositories().leadRepository.update(
        { id: In(leadIds), organizationId },
        { assignedToId }
      );

      this.logger.info('Bulk lead assignment completed', { 
        leadIds, 
        assignedToId, 
        count: leadIds.length 
      });
    } catch (error) {
      this.logger.error('Failed to bulk assign leads', { error, leadIds, assignedToId });
      throw error;
    }
  }

  async bulkUpdateLeadStatus(leadIds: string[], status: LeadStatus, organizationId: string): Promise<void> {
    try {
      await this.getRepositories().leadRepository.update(
        { id: In(leadIds), organizationId },
        { status }
      );

      this.logger.info('Bulk lead status update completed', { 
        leadIds, 
        status, 
        count: leadIds.length 
      });
    } catch (error) {
      this.logger.error('Failed to bulk update lead status', { error, leadIds, status });
      throw error;
    }
  }

  async getLeadAnalytics(organizationId: string, dateRange?: { startDate: Date; endDate: Date }): Promise<LeadAnalytics> {
    try {
      let baseQuery = this.getRepositories().leadRepository.createQueryBuilder('lead')
        .where('lead.organizationId = :organizationId', { organizationId });

      if (dateRange) {
        baseQuery = baseQuery.andWhere(
          'lead.createdAt BETWEEN :startDate AND :endDate',
          { startDate: dateRange.startDate, endDate: dateRange.endDate }
        );
      }

      // Get total counts
      const totalLeads = await baseQuery.getCount();

      const newLeadsQuery = baseQuery.clone().andWhere('lead.createdAt >= :weekAgo', {
        weekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });
      const newLeads = await newLeadsQuery.getCount();

      const convertedLeads = await baseQuery.clone()
        .andWhere('lead.isConverted = :isConverted', { isConverted: true })
        .getCount();

      // Leads by status
      const leadsByStatus = await baseQuery.clone()
        .select('lead.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('lead.status')
        .getRawMany();

      const statusMap = leadsByStatus.reduce((acc, item) => {
        acc[item.status as LeadStatus] = parseInt(item.count);
        return acc;
      }, {} as Record<LeadStatus, number>);

      // Leads by source
      const leadsBySource = await baseQuery.clone()
        .select('lead.source', 'source')
        .addSelect('COUNT(*)', 'count')
        .groupBy('lead.source')
        .getRawMany();

      const sourceMap = leadsBySource.reduce((acc, item) => {
        acc[item.source] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>);

      // Average score
      const scoreResult = await baseQuery.clone()
        .select('AVG(lead.score)', 'averageScore')
        .getRawOne();

      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Top performing sources
      const topPerformingSources = await Promise.all(
        Object.keys(sourceMap).map(async (source) => {
          const sourceTotal = sourceMap[source];
          const sourceConverted = await baseQuery.clone()
            .andWhere('lead.source = :source', { source })
            .andWhere('lead.isConverted = :isConverted', { isConverted: true })
            .getCount();

          return {
            source,
            count: sourceTotal,
            conversionRate: sourceTotal > 0 ? (sourceConverted / sourceTotal) * 100 : 0,
          };
        })
      );

      return {
        totalLeads,
        newLeads,
        convertedLeads,
        conversionRate,
        leadsByStatus: statusMap,
        leadsBySource: sourceMap,
        averageScore: parseFloat(scoreResult?.averageScore || '0'),
        topPerformingSources: topPerformingSources.sort((a, b) => b.conversionRate - a.conversionRate),
      };
    } catch (error) {
      this.logger.error('Failed to get lead analytics', { error, organizationId });
      throw error;
    }
  }

  async getLeadsByAssignee(assignedToId: string, organizationId: string): Promise<Lead[]> {
    try {
      return await this.getRepositories().leadRepository.find({
        where: { assignedToId, organizationId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get leads by assignee', { error, assignedToId });
      throw error;
    }
  }

  async getRecentLeads(organizationId: string, limit: number = 10): Promise<Lead[]> {
    try {
      return await this.getRepositories().leadRepository.find({
        where: { organizationId },
        order: { createdAt: 'DESC' },
        take: limit,
        cache: 30000,
      });
    } catch (error) {
      this.logger.error('Failed to get recent leads', { error, organizationId });
      throw error;
    }
  }

  async getLeadSources(organizationId: string): Promise<string[]> {
    try {
      const sources = await this.getRepositories().leadRepository
        .createQueryBuilder('lead')
        .select('DISTINCT lead.source', 'source')
        .where('lead.organizationId = :organizationId', { organizationId })
        .getRawMany();

      return sources.map(item => item.source).filter(Boolean);
    } catch (error) {
      this.logger.error('Failed to get lead sources', { error, organizationId });
      throw error;
    }
  }
}

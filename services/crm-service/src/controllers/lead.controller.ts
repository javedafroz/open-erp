import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
import { IsString, IsOptional, IsEmail, IsEnum, IsNumber, IsArray, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LeadStatus } from '@erp/shared';
import { createLogger } from '@erp/utils';
import { LeadService } from '../services/lead.service';

// DTOs for request validation
export class CreateLeadDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  customFields?: Record<string, any>;
}

export class ConvertLeadDto {
  @IsBoolean()
  createAccount: boolean;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsBoolean()
  createContact: boolean;

  @IsBoolean()
  createOpportunity: boolean;

  @IsOptional()
  @IsString()
  opportunityName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  opportunityAmount?: number;

  @IsOptional()
  @IsEnum(['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation'])
  opportunityStage?: string;

  @IsOptional()
  @Type(() => Date)
  expectedCloseDate?: Date;
}

export class LeadSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Filters
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsEnum(LeadStatus, { each: true })
  status?: LeadStatus[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsUUID(undefined, { each: true })
  assignedToId?: string[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  source?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreMin?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  scoreMax?: number;

  @IsOptional()
  @Type(() => Date)
  dateStart?: Date;

  @IsOptional()
  @Type(() => Date)
  dateEnd?: Date;

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isConverted?: boolean;
}

export class BulkAssignDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  leadIds: string[];

  @IsUUID()
  assignedToId: string;
}

export class BulkStatusUpdateDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  leadIds: string[];

  @IsEnum(LeadStatus)
  status: LeadStatus;
}

export class LeadController {
  private leadService: LeadService;
  private logger = createLogger('LeadController');

  constructor() {
    this.leadService = new LeadService();
  }

  /**
   * POST /api/v1/crm/leads
   * Create a new lead
   */
  createLead = async (
    request: FastifyRequest<{ Body: CreateLeadDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const lead = await this.leadService.createLead(
        request.body,
        request.user.userId,
        request.user.organizationId
      );

      await reply.status(201).send({
        success: true,
        data: lead,
        message: 'Lead created successfully',
      });

      this.logger.info('Lead created', { leadId: lead.id, userId: request.user.userId });
    } catch (error: any) {
      this.logger.error('Failed to create lead', { error: error.message, body: request.body });
      await reply.status(400).send({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * PUT /api/v1/crm/leads/:id
   * Update a lead
   */
  updateLead = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateLeadDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const lead = await this.leadService.updateLead(
        request.params.id,
        request.body,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        data: lead,
        message: 'Lead updated successfully',
      });

      this.logger.info('Lead updated', { leadId: lead.id, userId: request.user.userId });
    } catch (error: any) {
      this.logger.error('Failed to update lead', { 
        error: error.message, 
        leadId: request.params.id 
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;
      await reply.status(statusCode).send({
        success: false,
        error: statusCode === 404 ? 'Not Found' : 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/v1/crm/leads/:id
   * Get a lead by ID
   */
  getLeadById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const lead = await this.leadService.getLeadById(
        request.params.id,
        request.user.organizationId
      );

      if (!lead) {
        await reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Lead not found',
        });
        return;
      }

      await reply.status(200).send({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      this.logger.error('Failed to get lead', { 
        error: error.message, 
        leadId: request.params.id 
      });
      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve lead',
      });
    }
  };

  /**
   * GET /api/v1/crm/leads
   * Search and list leads
   */
  searchLeads = async (
    request: FastifyRequest<{ Querystring: LeadSearchDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const options = {
        ...request.query,
        organizationId: request.user.organizationId,
        filters: {
          status: request.query.status,
          assignedToId: request.query.assignedToId,
          source: request.query.source,
          scoreRange: (request.query.scoreMin !== undefined || request.query.scoreMax !== undefined) ? {
            min: request.query.scoreMin || 0,
            max: request.query.scoreMax || 100,
          } : undefined,
          dateRange: (request.query.dateStart || request.query.dateEnd) ? {
            startDate: request.query.dateStart || new Date(0),
            endDate: request.query.dateEnd || new Date(),
          } : undefined,
          tags: request.query.tags,
          companyName: request.query.company,
          isConverted: request.query.isConverted,
        },
      };

      const result = await this.leadService.searchLeads(options);

      await reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      this.logger.error('Failed to search leads', { error: error.message });
      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search leads',
      });
    }
  };

  /**
   * DELETE /api/v1/crm/leads/:id
   * Delete a lead
   */
  deleteLead = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      await this.leadService.deleteLead(
        request.params.id,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        message: 'Lead deleted successfully',
      });

      this.logger.info('Lead deleted', { leadId: request.params.id, userId: request.user.userId });
    } catch (error: any) {
      this.logger.error('Failed to delete lead', { 
        error: error.message, 
        leadId: request.params.id 
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;
      await reply.status(statusCode).send({
        success: false,
        error: statusCode === 404 ? 'Not Found' : 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/v1/crm/leads/:id/convert
   * Convert a lead to account/contact/opportunity
   */
  convertLead = async (
    request: FastifyRequest<{ Params: { id: string }; Body: ConvertLeadDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const result = await this.leadService.convertLead(
        request.params.id,
        request.body,
        request.user.userId,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        data: result,
        message: 'Lead converted successfully',
      });

      this.logger.info('Lead converted', { 
        leadId: request.params.id, 
        userId: request.user.userId,
        accountId: result.account?.id,
        contactId: result.contact?.id,
        opportunityId: result.opportunity?.id,
      });
    } catch (error: any) {
      this.logger.error('Failed to convert lead', { 
        error: error.message, 
        leadId: request.params.id 
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;
      await reply.status(statusCode).send({
        success: false,
        error: statusCode === 404 ? 'Not Found' : 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * PUT /api/v1/crm/leads/:id/assign
   * Assign a lead to a user
   */
  assignLead = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { assignedToId: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const lead = await this.leadService.assignLead(
        request.params.id,
        request.body.assignedToId,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        data: lead,
        message: 'Lead assigned successfully',
      });

      this.logger.info('Lead assigned', { 
        leadId: request.params.id, 
        assignedToId: request.body.assignedToId,
        userId: request.user.userId 
      });
    } catch (error: any) {
      this.logger.error('Failed to assign lead', { 
        error: error.message, 
        leadId: request.params.id 
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;
      await reply.status(statusCode).send({
        success: false,
        error: statusCode === 404 ? 'Not Found' : 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/v1/crm/leads/bulk-assign
   * Bulk assign leads to a user
   */
  bulkAssignLeads = async (
    request: FastifyRequest<{ Body: BulkAssignDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      await this.leadService.bulkAssignLeads(
        request.body.leadIds,
        request.body.assignedToId,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        message: `${request.body.leadIds.length} leads assigned successfully`,
      });

      this.logger.info('Bulk lead assignment completed', { 
        leadCount: request.body.leadIds.length,
        assignedToId: request.body.assignedToId,
        userId: request.user.userId 
      });
    } catch (error: any) {
      this.logger.error('Failed to bulk assign leads', { error: error.message });
      await reply.status(400).send({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/v1/crm/leads/bulk-status
   * Bulk update lead status
   */
  bulkUpdateStatus = async (
    request: FastifyRequest<{ Body: BulkStatusUpdateDto }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      await this.leadService.bulkUpdateLeadStatus(
        request.body.leadIds,
        request.body.status,
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        message: `${request.body.leadIds.length} leads status updated successfully`,
      });

      this.logger.info('Bulk lead status update completed', { 
        leadCount: request.body.leadIds.length,
        status: request.body.status,
        userId: request.user.userId 
      });
    } catch (error: any) {
      this.logger.error('Failed to bulk update lead status', { error: error.message });
      await reply.status(400).send({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/v1/crm/leads/analytics
   * Get lead analytics
   */
  getLeadAnalytics = async (
    request: FastifyRequest<{ 
      Querystring: { 
        dateStart?: string; 
        dateEnd?: string; 
      } 
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const dateRange = (request.query.dateStart || request.query.dateEnd) ? {
        startDate: request.query.dateStart ? new Date(request.query.dateStart) : new Date(0),
        endDate: request.query.dateEnd ? new Date(request.query.dateEnd) : new Date(),
      } : undefined;

      const analytics = await this.leadService.getLeadAnalytics(
        request.user.organizationId,
        dateRange
      );

      await reply.status(200).send({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      this.logger.error('Failed to get lead analytics', { error: error.message });
      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve lead analytics',
      });
    }
  };

  /**
   * GET /api/v1/crm/leads/sources
   * Get all lead sources
   */
  getLeadSources = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (!request.user) {
        await reply.status(401).send({ 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const sources = await this.leadService.getLeadSources(
        request.user.organizationId
      );

      await reply.status(200).send({
        success: true,
        data: sources,
      });
    } catch (error: any) {
      this.logger.error('Failed to get lead sources', { error: error.message });
      await reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve lead sources',
      });
    }
  };

  // Schema definitions for Swagger documentation
  getCreateLeadSchema(): RouteShorthandOptions {
    return {
      schema: {
        description: 'Create a new lead',
        tags: ['Leads'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'source'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phoneNumber: { type: 'string' },
            company: { type: 'string' },
            jobTitle: { type: 'string' },
            source: { type: 'string' },
            assignedToId: { type: 'string', format: 'uuid' },
            tags: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            customFields: { type: 'object' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    };
  }
}

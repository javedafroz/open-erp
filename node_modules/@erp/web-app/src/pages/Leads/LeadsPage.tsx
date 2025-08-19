import React from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useLeads, useLeadManagement } from '../../hooks/useLeads';
import { InlineLoader } from '../../components/LoadingSpinner';
import { LeadStatus } from '@erp/shared';

// Status badge component
const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const getStatusStyle = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case LeadStatus.QUALIFIED:
        return 'bg-yellow-100 text-yellow-800';
      case LeadStatus.CONTACTED:
        return 'bg-purple-100 text-purple-800';
      case LeadStatus.CONVERTED:
        return 'bg-green-100 text-green-800';
      case LeadStatus.LOST:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusStyle(status)
      )}
    >
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

// Lead score component
const LeadScore: React.FC<{ score?: number }> = ({ score }) => {
  if (!score) return <span className="text-gray-400">-</span>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-yellow-600 font-medium';
    if (score >= 40) return 'text-orange-600 font-medium';
    return 'text-red-600 font-medium';
  };

  return (
    <span className={clsx('text-sm', getScoreColor(score))}>
      {score}/100
    </span>
  );
};

// Leads table component
interface LeadsTableProps {
  leads: any[];
  isLoading: boolean;
  selectedLeads: string[];
  onSelectLead: (leadId: string) => void;
  onSelectAllLeads: () => void;
  onEditLead: (lead: any) => void;
  onDeleteLead: (leadId: string) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  selectedLeads,
  onSelectLead,
  onSelectAllLeads,
  onEditLead,
  onDeleteLead,
}) => {
  if (isLoading) {
    return <InlineLoader message="Loading leads..." />;
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No leads found</div>
        <p className="text-gray-500">Create your first lead to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={selectedLeads.length === leads.length && leads.length > 0}
                onChange={onSelectAllLeads}
              />
            </th>
            <th
              scope="col"
              className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Company
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Score
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Source
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Created
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={selectedLeads.includes(lead.id)}
                  onChange={() => onSelectLead(lead.id)}
                />
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-gray-500">{lead.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {lead.company || '-'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <StatusBadge status={lead.status} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <LeadScore score={lead.score} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {lead.source}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  onClick={() => onEditLead(lead)}
                  className="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteLead(lead.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const LeadsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<LeadStatus[]>([]);
  const [selectedLeads, setSelectedLeads] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  // const [editingLead, setEditingLead] = React.useState<any>(null);

  const { data: leadsResponse, isLoading } = useLeads({
    search: searchQuery,
    status: statusFilter.length > 0 ? statusFilter : undefined,
    page: currentPage,
    limit: 20,
  });

  const leadManagement = useLeadManagement();

  const leads = (leadsResponse?.data || []) as any[];
  const pagination = leadsResponse?.pagination;

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAllLeads = () => {
    setSelectedLeads(
      selectedLeads.length === leads.length 
        ? [] 
        : leads.map((lead: any) => lead.id)
    );
  };

  const handleEditLead = (lead: any) => {
    // setEditingLead(lead);
    console.log('Edit lead:', lead); // TODO: Implement edit functionality
    // TODO: Open edit modal/drawer
    console.log('Edit lead:', lead);
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      leadManagement.delete(leadId);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) return;

    switch (action) {
      case 'assign':
        // TODO: Show assign modal
        console.log('Bulk assign:', selectedLeads);
        break;
      case 'status':
        // TODO: Show status update modal
        console.log('Bulk status update:', selectedLeads);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
          // TODO: Implement bulk delete
          console.log('Bulk delete:', selectedLeads);
        }
        break;
    }
  };

  const statusOptions = Object.values(LeadStatus);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your sales leads and track their progress through your pipeline.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              // TODO: Navigate to create lead
              console.log('Create new lead');
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
              placeholder="Search leads..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'btn btn-outline',
                showFilters && 'bg-primary-50 text-primary-700 border-primary-300'
              )}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>

            <button className="btn btn-outline">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  multiple
                  value={statusFilter}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as LeadStatus[];
                    setStatusFilter(values);
                  }}
                  className="form-select"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* TODO: Add more filters (source, assigned user, date range, etc.) */}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-primary-700 font-medium">
                {selectedLeads.length} lead{selectedLeads.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkAction('assign')}
                className="text-sm text-primary-700 hover:text-primary-900 font-medium"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction('status')}
                className="text-sm text-primary-700 hover:text-primary-900 font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-sm text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAllLeads={handleSelectAllLeads}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex items-center justify-between bg-white px-6 py-3 border border-gray-300 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="btn btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
              className="btn btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;

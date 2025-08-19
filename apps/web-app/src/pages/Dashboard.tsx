import React from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useLeadAnalytics } from '../hooks/useLeads';
import { InlineLoader } from '../components/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
}) => {
  const CardWrapper = href ? 'a' : 'div';
  const cardProps = href ? { href } : {};

  return (
    <CardWrapper
      {...cardProps}
      className={clsx(
        'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 to-card shadow-lg border border-border/50',
        'hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm',
        href && 'cursor-pointer'
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent-100/30 to-primary-100/30 rounded-full translate-y-4 -translate-x-4 group-hover:scale-110 transition-transform duration-300" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <dt className="text-sm font-medium text-muted-foreground mb-2">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-3xl font-bold text-card-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {change !== undefined && (
                <div
                  className={clsx(
                    'ml-3 flex items-center text-sm font-semibold px-2 py-1 rounded-full',
                    changeType === 'increase' 
                      ? 'text-success-700 bg-gradient-to-r from-success-100 to-success-200' 
                      : 'text-danger-700 bg-gradient-to-r from-danger-100 to-danger-200'
                  )}
                >
                  {changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </div>
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-0.5 shadow-lg">
              <div className="h-full w-full rounded-xl bg-background/90 flex items-center justify-center group-hover:bg-background transition-colors duration-300">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
        {href && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'lead' | 'account' | 'contact' | 'opportunity';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

const RecentActivity: React.FC<{ activities: RecentActivityItem[] }> = ({ activities }) => {
  const getTypeIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'lead':
        return UserGroupIcon;
      case 'account':
        return BuildingOfficeIcon;
      case 'contact':
        return UserGroupIcon;
      case 'opportunity':
        return CurrencyDollarIcon;
      default:
        return ChartBarIcon;
    }
  };

  const getTypeColor = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'lead':
        return 'bg-blue-100 text-blue-600';
      case 'account':
        return 'bg-green-100 text-green-600';
      case 'contact':
        return 'bg-purple-100 text-purple-600';
      case 'opportunity':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getTypeIcon(activity.type);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={clsx(
                            getTypeColor(activity.type),
                            'h-8 w-8 rounded-full flex items-center justify-center'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                          {activity.user && (
                            <p className="text-xs text-gray-400">
                              by {activity.user}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: leadAnalytics = { data: {} as any }, isLoading: isLoadingAnalytics } = useLeadAnalytics();

  // Mock recent activities - in real app, this would come from API
  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'lead',
      title: 'New lead created',
      description: 'John Doe from Acme Corp',
      timestamp: '2 hours ago',
      user: 'Jane Smith',
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Opportunity updated',
      description: 'Software Deal - moved to Proposal stage',
      timestamp: '4 hours ago',
      user: 'Mike Johnson',
    },
    {
      id: '3',
      type: 'account',
      title: 'Account created',
      description: 'TechCorp Inc. added as new customer',
      timestamp: '6 hours ago',
      user: 'Sarah Wilson',
    },
    {
      id: '4',
      type: 'contact',
      title: 'Contact updated',
      description: 'Updated contact information for Lisa Brown',
      timestamp: '8 hours ago',
      user: 'Tom Davis',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome section */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-accent-200/20 to-primary-200/20 rounded-full blur-2xl" />
        
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {getGreeting()}, {user?.firstName || user?.username}! 👋
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Here's what's happening with your ERP system today.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoadingAnalytics ? (
          <div className="col-span-full">
            <InlineLoader message="Loading analytics..." />
          </div>
        ) : (
          <>
            <StatCard
              title="Total Leads"
              value={leadAnalytics?.data?.totalLeads || 0}
              change={12}
              changeType="increase"
              icon={UserGroupIcon}
              href="/crm/leads"
            />
            <StatCard
              title="New Leads (7d)"
              value={leadAnalytics?.data?.newLeads || 0}
              change={8}
              changeType="increase"
              icon={ArrowTrendingUpIcon}
              href="/crm/leads?filter=new"
            />
            <StatCard
              title="Conversion Rate"
              value={`${(leadAnalytics?.data?.conversionRate || 0).toFixed(1)}%`}
              change={2.5}
              changeType="increase"
              icon={ChartBarIcon}
              href="/analytics"
            />
            <StatCard
              title="Converted Leads"
              value={leadAnalytics?.data?.convertedLeads || 0}
              change={15}
              changeType="increase"
              icon={CurrencyDollarIcon}
              href="/crm/leads?filter=converted"
            />
          </>
        )}
      </div>

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline Chart Placeholder */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Lead Pipeline</h3>
            <p className="text-sm text-gray-500">Overview of leads by status</p>
          </div>
          
          {isLoadingAnalytics ? (
            <InlineLoader message="Loading pipeline..." />
          ) : (
            <div className="space-y-4">
              {leadAnalytics?.data?.leadsByStatus && Object.entries(leadAnalytics.data?.leadsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {status.replace('_', ' ')}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ 
                          width: `${((count as number) / (leadAnalytics.data?.totalLeads || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 text-right">
                    {count as number}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/crm/leads/new"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Add Lead</p>
              <p className="text-xs text-gray-500">Create new lead</p>
            </div>
          </a>
          
          <a
            href="/crm/accounts/new"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Add Account</p>
              <p className="text-xs text-gray-500">Create new account</p>
            </div>
          </a>
          
          <a
            href="/crm/contacts/new"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Add Contact</p>
              <p className="text-xs text-gray-500">Create new contact</p>
            </div>
          </a>
          
          <a
            href="/crm/opportunities/new"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Add Opportunity</p>
              <p className="text-xs text-gray-500">Create new opportunity</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

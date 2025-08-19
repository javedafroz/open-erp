import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
  badge?: string | number;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: 'CRM',
    href: '/crm',
    icon: UserGroupIcon,
    children: [
      { name: 'Leads', href: '/crm/leads', icon: UserGroupIcon },
      { name: 'Accounts', href: '/crm/accounts', icon: BuildingOfficeIcon },
      { name: 'Contacts', href: '/crm/contacts', icon: PhoneIcon },
      { name: 'Opportunities', href: '/crm/opportunities', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ChartBarIcon,
    children: [
      { name: 'Products', href: '/sales/products', icon: DocumentTextIcon },
      { name: 'Quotes', href: '/sales/quotes', icon: DocumentTextIcon },
      { name: 'Orders', href: '/sales/orders', icon: DocumentTextIcon },
      { name: 'Invoices', href: '/sales/invoices', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Service',
    href: '/service',
    icon: CogIcon,
    children: [
      { name: 'Cases', href: '/service/cases', icon: DocumentTextIcon },
      { name: 'Knowledge Base', href: '/service/knowledge', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Marketing',
    href: '/marketing',
    icon: ChartBarIcon,
    children: [
      { name: 'Campaigns', href: '/marketing/campaigns', icon: ChartBarIcon },
      { name: 'Email Templates', href: '/marketing/templates', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    roles: ['admin', 'manager'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    roles: ['admin'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasAnyRole } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Auto-expand based on current route
  React.useEffect(() => {
    const currentPath = location.pathname;
    const parentItem = navigation.find(item => 
      item.children?.some(child => currentPath.startsWith(child.href))
    );
    if (parentItem && !expandedItems.includes(parentItem.name)) {
      setExpandedItems(prev => [...prev, parentItem.name]);
    }
  }, [location.pathname, expandedItems]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const filterNavigationByRole = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      if (item.roles && item.roles.length > 0) {
        return hasAnyRole(item.roles);
      }
      return true;
    }).map(item => ({
      ...item,
      children: item.children ? filterNavigationByRole(item.children) : undefined,
    }));
  };

  const filteredNavigation = filterNavigationByRole(navigation);

  const isItemActive = (item: NavigationItem) => {
    if (item.href === '/' && location.pathname === '/') return true;
    if (item.href !== '/' && location.pathname.startsWith(item.href)) return true;
    return false;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <li key={item.name}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={clsx(
                'group flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-3 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                  {item.badge}
                </span>
              )}
              <ChevronRightIcon
                className={clsx(
                  'ml-2 h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-90' : 'rotate-0'
                )}
              />
            </button>
            {isExpanded && (
              <ul className="mt-1 space-y-1 pl-9">
                {item.children?.map((child) => renderNavigationItem(child, level + 1))}
              </ul>
            )}
          </div>
        ) : (
          <NavLink
            to={item.href}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={clsx(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-3 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                {item.badge}
              </span>
            )}
          </NavLink>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-gray-900">
              ERP System
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => renderNavigationItem(item))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search
    console.log('Search:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 xl:w-96 pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
                          transition-all duration-200 placeholder:text-muted-foreground
                          hover:bg-background/80 hover:border-primary/30"
                placeholder="Search leads, accounts, contacts..."
              />
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-muted-foreground hover:text-accent-foreground 
                     hover:bg-accent transition-all duration-200 hover:scale-105"
          >
            <BellIcon className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-gradient-to-r from-danger-400 to-danger-500 shadow-lg shadow-danger-500/30 animate-pulse"></span>
          </button>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 rounded-xl p-2 text-sm hover:bg-accent transition-all duration-200 hover:scale-105">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 p-0.5">
                  <div className="h-full w-full rounded-full bg-background/90 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </Menu.Button>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-xl bg-card/95 backdrop-blur-md py-2 shadow-xl ring-1 ring-border focus:outline-none">
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 p-0.5">
                      <div className="h-full w-full rounded-full bg-background/90 flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    {user?.roles && user.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                     bg-gradient-to-r from-primary-100 to-secondary-100 
                                     text-primary-700 border border-primary-200/50"
                          >
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{user.roles.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        // TODO: Navigate to profile
                        console.log('Navigate to profile');
                      }}
                      className={clsx(
                        'flex w-full px-4 py-2 text-left text-sm text-card-foreground rounded-lg mx-2 transition-all duration-200',
                        active ? 'bg-accent/80 text-accent-foreground transform scale-[1.02]' : 'hover:bg-accent/50'
                      )}
                    >
                      <UserCircleIcon className="mr-3 h-4 w-4 text-primary-500" />
                      Your Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        // TODO: Navigate to settings
                        console.log('Navigate to settings');
                      }}
                      className={clsx(
                        'flex w-full px-4 py-2 text-left text-sm text-card-foreground rounded-lg mx-2 transition-all duration-200',
                        active ? 'bg-accent/80 text-accent-foreground transform scale-[1.02]' : 'hover:bg-accent/50'
                      )}
                    >
                      <CogIcon className="mr-3 h-4 w-4 text-primary-500" />
                      Settings
                    </button>
                  )}
                </Menu.Item>

                <div className="mx-2 my-1 border-t border-border"></div>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={clsx(
                        'flex w-full px-4 py-2 text-left text-sm rounded-lg mx-2 transition-all duration-200',
                        active 
                          ? 'bg-destructive/10 text-destructive transform scale-[1.02]' 
                          : 'text-destructive/80 hover:bg-destructive/5 hover:text-destructive'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;

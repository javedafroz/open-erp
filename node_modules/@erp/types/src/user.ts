import { UserRole, UserStatus } from '@erp/shared';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  profilePicture?: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  department?: string;
  jobTitle?: string;
  manager?: string;
  skills?: string[];
  preferences?: UserPreferences;
  socialLinks?: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: string[];
  defaultView: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  address?: Address;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  workingHours: WorkingHours;
  features: FeatureFlags;
}

export interface WorkingHours {
  start: string;
  end: string;
  workingDays: number[]; // 0-6, Sunday = 0
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
}

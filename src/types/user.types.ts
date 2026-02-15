// ============================================
// USER SYSTEM - TYPE DEFINITIONS
// File: src/types/user.types.ts
// ============================================

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  ADMIN = 'admin',
  SALES_MANAGER = 'sales_manager',
  SALES_ENGINEER = 'sales_engineer',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// ============================================
// CORE INTERFACES
// ============================================

/**
 * User Interface
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  
  // Role & Permissions
  role: UserRole | 'admin' | 'sales_manager' | 'sales_engineer' | 'viewer';
  permissions?: Permission[];
  
  // Contact Information
  phone?: string;
  mobile?: string;
  
  // Profile
  avatar_url?: string;
  bio?: string;
  department?: string;
  job_title?: string;
  
  // Settings
  timezone?: string;
  language?: string;
  notification_preferences?: NotificationPreferences;
  
  // Status
  is_active: boolean;
  status: UserStatus | string;
  email_verified: boolean;
  
  // Activity
  last_login?: string;
  last_activity?: string;
  login_count?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  deleted_at?: string;
}

/**
 * Permission
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  actions: PermissionAction[];
  description?: string;
}

/**
 * Permission Action
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  EXPORT = 'export',
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  email: {
    quotation_created: boolean;
    quotation_approved: boolean;
    quotation_rejected: boolean;
    client_added: boolean;
    system_alerts: boolean;
  };
  push: {
    quotation_created: boolean;
    quotation_approved: boolean;
    quotation_rejected: boolean;
  };
  in_app: {
    all: boolean;
  };
}

/**
 * User Profile
 */
export interface UserProfile extends User {
  statistics?: UserStatistics;
  recent_activity?: UserActivity[];
}

/**
 * User Statistics
 */
export interface UserStatistics {
  total_quotations: number;
  approved_quotations: number;
  total_value: number;
  approved_value: number;
  conversion_rate: number;
  average_quotation_value: number;
  clients_managed: number;
  period: {
    from: string;
    to: string;
  };
}

/**
 * User Activity
 */
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Register Data
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  agree_to_terms: boolean;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset
 */
export interface PasswordReset {
  token: string;
  password: string;
  password_confirmation: string;
}

/**
 * Change Password
 */
export interface ChangePassword {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Auth Session
 */
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// ============================================
// DTOs
// ============================================

/**
 * Create User DTO
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  full_name: string;
  role: UserRole | string;
  phone?: string;
  department?: string;
  job_title?: string;
  is_active?: boolean;
}

/**
 * Update User DTO
 */
export interface UpdateUserDTO {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  mobile?: string;
  avatar_url?: string;
  bio?: string;
  department?: string;
  job_title?: string;
  timezone?: string;
  language?: string;
  is_active?: boolean;
  status?: UserStatus | string;
}

/**
 * Update User Role DTO
 */
export interface UpdateUserRoleDTO {
  role: UserRole | string;
  permissions?: string[];
}

/**
 * Update Profile DTO
 */
export interface UpdateProfileDTO {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: NotificationPreferences;
}

// ============================================
// FILTERS & SEARCH
// ============================================

/**
 * User Filters
 */
export interface UserFilters {
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  is_active?: boolean;
  department?: string;
  search_query?: string;
  created_from?: string;
  created_to?: string;
  include_deleted?: boolean;
}

/**
 * User Sort Options
 */
export interface UserSortOptions {
  field: 'full_name' | 'email' | 'created_at' | 'last_login';
  direction: 'asc' | 'desc';
}

// ============================================
// TEAM & COLLABORATION
// ============================================

/**
 * Team
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

/**
 * Team Member
 */
export interface TeamMember {
  user_id: string;
  user: User;
  role: 'manager' | 'member';
  joined_at: string;
}

// ============================================
// CONSTANTS
// ============================================

export const USER_DEFAULTS = {
  is_active: true,
  status: UserStatus.ACTIVE,
  email_verified: false,
  role: UserRole.VIEWER,
  timezone: 'Africa/Lagos',
  language: 'en',
} as const;

export const ROLE_LABELS: Record<UserRole | string, string> = {
  admin: 'Administrator',
  sales_manager: 'Sales Manager',
  sales_engineer: 'Sales Engineer',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole | string, string> = {
  admin: 'Full system access with all permissions',
  sales_manager: 'Can create, edit, approve quotations and manage team',
  sales_engineer: 'Can create and edit quotations',
  viewer: 'Read-only access to quotations and reports',
};

export const STATUS_LABELS: Record<UserStatus | string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending: 'Pending Verification',
};

export const STATUS_COLORS: Record<UserStatus | string, string> = {
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
  pending: 'yellow',
};

/**
 * Role Permissions Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole | string, string[]> = {
  admin: [
    'quotations.create',
    'quotations.read',
    'quotations.update',
    'quotations.delete',
    'quotations.approve',
    'quotations.export',
    'clients.create',
    'clients.read',
    'clients.update',
    'clients.delete',
    'components.create',
    'components.read',
    'components.update',
    'components.delete',
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'settings.update',
    'reports.view',
  ],
  sales_manager: [
    'quotations.create',
    'quotations.read',
    'quotations.update',
    'quotations.approve',
    'quotations.export',
    'clients.create',
    'clients.read',
    'clients.update',
    'components.read',
    'users.read',
    'reports.view',
  ],
  sales_engineer: [
    'quotations.create',
    'quotations.read',
    'quotations.update',
    'quotations.export',
    'clients.read',
    'components.read',
  ],
  viewer: [
    'quotations.read',
    'clients.read',
    'components.read',
    'reports.view',
  ],
};

/**
 * Default Notification Preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    quotation_created: true,
    quotation_approved: true,
    quotation_rejected: true,
    client_added: false,
    system_alerts: true,
  },
  push: {
    quotation_created: true,
    quotation_approved: true,
    quotation_rejected: true,
  },
  in_app: {
    all: true,
  },
};

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user is sales manager
 */
export function isSalesManager(user: User): boolean {
  return user.role === UserRole.SALES_MANAGER;
}

/**
 * Check if user can approve quotations
 */
export function canApproveQuotations(user: User): boolean {
  return isAdmin(user) || isSalesManager(user);
}

/**
 * Check if user can create quotations
 */
export function canCreateQuotations(user: User): boolean {
  return user.role !== UserRole.VIEWER;
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

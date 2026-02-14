// ============================================
// CLIENT SYSTEM - TYPE DEFINITIONS (ALIGNED WITH DATABASE)
// File: src/types/client.types.ts
// Based on actual Supabase schema
// ============================================

import { ClientRow, UserRow, QuoteRow } from './database.types';

// ============================================
// CORE INTERFACES (Based on Database Schema)
// ============================================

/**
 * Client Interface
 * Maps to database 'clients' table
 */
export interface Client extends ClientRow {}

/**
 * Client with Relations
 */
export interface ClientWithRelations extends Client {
  created_by_user?: UserRow;
  quotes?: QuoteRow[];
  statistics?: ClientStatistics;
}

// ============================================
// ADDITIONAL CLIENT DATA
// ============================================

/**
 * Client Contact (Additional contacts beyond main contact_person)
 */
export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

/**
 * Client Interaction/Activity
 */
export interface ClientInteraction {
  id: string;
  client_id: string;
  type: 'call' | 'email' | 'meeting' | 'quote' | 'visit' | 'other';
  subject: string;
  description?: string;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  performed_by: string;
  performed_at: string;
}

// ============================================
// DTOs
// ============================================

/**
 * Create Client DTO
 */
export interface CreateClientDTO {
  name: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

/**
 * Update Client DTO
 */
export interface UpdateClientDTO {
  name?: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

/**
 * Import Client from Excel
 */
export interface ImportClientDTO {
  name: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

// ============================================
// FILTERS & SEARCH
// ============================================

/**
 * Client Filters
 */
export interface ClientFilters {
  search_query?: string;
  created_by?: string;
  has_quotes?: boolean;
  created_from?: string;
  created_to?: string;
}

/**
 * Client Sort Options
 */
export interface ClientSortOptions {
  field: 'name' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Client Statistics
 */
export interface ClientStatistics {
  total_quotes: number;
  approved_quotes: number;
  draft_quotes: number;
  total_value: number;
  approved_value: number;
  average_quote_value: number;
  first_quote_date?: string;
  last_quote_date?: string;
  days_since_last_quote?: number;
}

/**
 * Client Performance Report
 */
export interface ClientPerformanceReport {
  period: {
    from: string;
    to: string;
  };
  top_clients_by_value: Array<{
    client: Client;
    total_value: number;
    quote_count: number;
  }>;
  top_clients_by_volume: Array<{
    client: Client;
    quote_count: number;
    total_value: number;
  }>;
  new_clients_count: number;
  active_clients_count: number;
}

// ============================================
// CLIENT ENGAGEMENT
// ============================================

/**
 * Client Engagement Level
 */
export enum ClientEngagementLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INACTIVE = 'inactive',
}

/**
 * Client Engagement Metrics
 */
export interface ClientEngagementMetrics {
  client_id: string;
  engagement_level: ClientEngagementLevel;
  quote_frequency: number; // quotes per month
  response_rate: number; // % of quotes approved
  average_response_time_days: number;
  last_contact_date: string;
  recommended_next_action: string;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Excel Import Template Headers
 */
export const CLIENT_EXCEL_HEADERS = [
  'Client Name',
  'Address',
  'Contact Person',
  'Email',
  'Phone',
] as const;

/**
 * Client field mappings for Excel import
 */
export const CLIENT_FIELD_MAPPINGS = {
  'Client Name': 'name',
  'Name': 'name',
  'Company Name': 'name',
  'Address': 'address',
  'Contact Person': 'contact_person',
  'Contact': 'contact_person',
  'Attention': 'contact_person',
  'Email': 'email',
  'E-mail': 'email',
  'Phone': 'phone',
  'Phone Number': 'phone',
  'Tel': 'phone',
} as const;

/**
 * Engagement Level Colors (for UI)
 */
export const ENGAGEMENT_LEVEL_COLORS: Record<ClientEngagementLevel, string> = {
  high: 'green',
  medium: 'yellow',
  low: 'orange',
  inactive: 'gray',
};

/**
 * Engagement Level Labels
 */
export const ENGAGEMENT_LEVEL_LABELS: Record<ClientEngagementLevel, string> = {
  high: 'Highly Engaged',
  medium: 'Moderately Engaged',
  low: 'Low Engagement',
  inactive: 'Inactive',
};

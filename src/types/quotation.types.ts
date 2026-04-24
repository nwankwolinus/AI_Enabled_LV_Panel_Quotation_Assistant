// ============================================
// QUOTATION SYSTEM - TYPE DEFINITIONS (ALIGNED WITH DATABASE)
// File: src/types/quotation.types.ts
// Based on actual Supabase schema
// ============================================

import { QuoteRow, QuoteItemRow, ClientRow, ComponentRow, UserRow } from './database.types';
import { calculatePanel, type BusbarCalculation, type CableCalculation, type MainBusbarCalculation } from '@/lib/calculations/panelCalculator';
import { Json } from './database.types';

// ============================================
// ENUMS
// ============================================

export enum QuotationStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
}

// ============================================
// CORE INTERFACES (Based on Database Schema)
// ============================================

/**
 * Quote (Main Quotation) Interface
 * Maps to database 'quotes' table
 */
export interface Quote extends QuoteRow {
  version?: number;
  include_images?: boolean;
  include_warranty?: boolean;
  include_specs?: boolean;
  warranty_period?: string;
}

/**
 * Quote Item Interface
 * Maps to database 'quote_items' table
 * Note: This is a complex structure with many specific fields for LV Panel components
 */
export type PanelType = 
  | 'isolator'
  | 'changeover'
  | 'lv_panel'
  | 'synch_panel'
  | 'custom';

export interface QuoteItem extends QuoteItemRow {
  panel_type: PanelType | null; // ✅ FIXED
  id: string;
  panel_name: string;
  busbar_amperage: string | null;
  incomers: Array<{
    component_id: string;
    quantity: number;
    price: number;
    amperage?: number;
    poles?: number
  }>;
  outgoings: Array<{
    component_id: string;
    quantity: number;
    price: number;
    amperage?: number;
    poles?: number
  }>;
  accessories: Array<{
    component_id: string;
    quantity: number;
    price: number
  }>;
  enclosure_dimensions: string;
  enclosure_height: number; // in mm
  enclosure_width: number; // in mm
  enclosure_depth: number; // in mm
  enclosure_price: number;
  // NEW: Busbar sections
  main_busbar: BusbarCalculation | null;
  link_busbars: BusbarCalculation[];
  // NEW: Cable section
  cables: CableCalculation[];
  subtotal: number;
}

/**
 * Quote with all related data
 */
export interface QuoteWithRelations extends Quote {
  client?: ClientRow;
  items: QuoteItemWithComponent[];
  created_by_user: UserRow;
}

/**
 * Quote Item with Component details
 */
export interface QuoteItemWithComponent extends QuoteItem {
  // Component details for incomers, outgoings, accessories, etc.
  component_details?: ComponentDetails;
}

// ============================================
// COMPONENT DETAILS STRUCTURES
// ============================================

/**
 * Structure for component arrays (incomers, outgoings, accessories, etc.)
 * These are stored as JSON in the database
 */
export interface ComponentDetail {
  component_id?: string;
  quantity: number;
  description?: string;
  specification?: string;
  manufacturer?: string;
  model?: string;
  price?: number;
  total?: number;
}

/**
 * Incomer/Outgoing specific details
 */
export interface BreakerDetail extends ComponentDetail {
  amperage?: string;
  poles?: string;
  type?: string;
  category?: string;
}

/**
 * Digital Meter details
 */
export interface DigitalMeterDetail extends ComponentDetail {
  type?: string;
  features?: string[];
}

/**
 * Cable details
 */
export interface CableDetail extends ComponentDetail {
  size?: string;
  length?: number;
  type?: string;
}

/**
 * Capacitor Bank details
 */
export interface CapacitorBankDetail extends ComponentDetail {
  kvar: string;
  stages?: number;
}

/**
 * All component details in a quote item
 */
export interface ComponentDetails {
  incomers?: BreakerDetail[];
  outgoings?: BreakerDetail[];
  digital_meter?: DigitalMeterDetail;
  accessories?: ComponentDetail[];
  cables?: CableDetail[];
  bolts?: ComponentDetail[];
  capacitor_bank_25kvar?: CapacitorBankDetail;
  capacitor_bank_60kvar?: CapacitorBankDetail;
  surge_arrester?: ComponentDetail;
  power_factor_controller_12stage?: ComponentDetail;
  comap_amf_9?: ComponentDetail;
  comap_amf_16?: ComponentDetail;
  comap_intelligent_200?: ComponentDetail;
  contactor_battery_charger?: ComponentDetail;
  others?: ComponentDetail[];
}

// ============================================
// PRICING & CALCULATIONS
// ============================================

/**
 * Pricing Breakdown for a Quote
 */
export interface QuotePricingBreakdown {
  total: number;
  vat: number;
  grand_total: number;
  items: QuoteItemPricing[];
}

/**
 * Item Pricing Breakdown
 */
export interface QuoteItemPricing {
  item_id: string;
  panel_name: string;
  subtotal: number;
  components: {
    main_busbar: number;
    link_busbar: number;
    cables: number;
    enclosure: number;
    components_total: number;
  };
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * Create Quote DTO
 */
export interface CreateQuoteDTO {
  client_id?: string;
  client_name: string;
  client_address?: string;
  attention?: string;
  project_name: string;
  payment_terms?: string;
  validity_period?: string;
  execution_period?: string;
  notes?: string;
  items: CreateQuoteItemDTO[];
}

export type BusbarRating =
  | '400A'
  | '630A'
  | '800A'
  | '1000A'
  | '1600A'
  | '2000A'
  | '2500A'
  | '3200A'
  | '4000A'
  | '5000A'
  | '6300A';

/**
 * Create Quote Item DTO
 */
export interface CreateQuoteItemDTO {
  item_number: number;
  panel_name: string;

  panel_type?: PanelType;
  
  // Busbar details
  busbar_type?: BusbarRating;
  busbar_specification?: string;
  busbar_amperage?: string;
  busbar_price?: number;
  busbar_link_type?: string;
  busbar_link_specification?: string;
  busbar_quantity_meters?: number;
  cable_size?: string;
  busbar_price_per_meter?: number;
  busbar_link_quantity_meters?: number;
  busbar_link_price_per_meter?: number;
  cable_quantity_meters?: number;
  cable_price_per_meter?: number;

  
  // Enclosure
  enclosure_dimensions?: string;
  enclosure_price?: number;
  
  // Components (stored as JSON)
  incomers?: Json;
  outgoings?: Json;
  digital_meter?: Json;
  accessories?: Json;
  cables?: Json;
  bolts?: Json;
  capacitor_bank_25kvar?: Json;
  capacitor_bank_60kvar?: Json;
  surge_arrester?: Json;
  power_factor_controller_12stage?: Json;
  comap_amf_9?: Json;
  comap_amf_16?: Json;
  comap_intelligent_200?: Json;
  contactor_battery_charger?: Json;
  others?: Json;
  
  notes?: string;
}

/**
 * Update Quote DTO
 */
export interface UpdateQuoteDTO {
  client_name?: string;
  client_address?: string;
  attention?: string;
  project_name?: string;
  status?: string;
  payment_terms?: string;
  validity_period?: string;
  execution_period?: string;
  notes?: string;
  total?: number;
  vat?: number;
  grand_total?: number;
  sent_at?: string;
  approved_at?: string;
}

/**
 * Update Quote Item DTO
 */
export interface UpdateQuoteItemDTO extends Partial<CreateQuoteItemDTO> {
  subtotal?: number;
}

// ============================================
// FILTERS & SEARCH
// ============================================

/**
 * Quote Filters
 */
export interface QuoteFilters {
  status?: QuotationStatus | QuotationStatus[] | string;
  client_id?: string;
  client_name?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  min_total?: number;
  max_total?: number;
  search_query?: string;
  quote_number?: string;
}

/**
 * Quote Sort Options
 */
export interface QuoteSortOptions {
  field: 'created_at' | 'updated_at' | 'quote_number' | 'grand_total' | 'status' | 'project_name';
  direction: 'asc' | 'desc';
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ============================================
// EXPORT & REPORTING
// ============================================

/**
 * PDF Export Options
 */
export interface PDFExportOptions {
  format: 'standard' | 'minimal' | 'detailed';
  include_specifications: boolean;
  include_images: boolean;
  include_logo: boolean;
  watermark?: string;
  custom_header?: string;
  custom_footer?: string;
}

/**
 * Excel Export Options
 */
export interface ExcelExportOptions {
  format: 'summary' | 'detailed' | 'financial';
  include_pricing_breakdown: boolean;
  include_component_specs: boolean;
  group_by_panel: boolean;
  sheet_names?: {
    summary?: string;
    items?: string;
    pricing?: string;
  };
}

/**
 * Email Quote Options
 */
export interface EmailQuoteOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  message?: string;
  attach_pdf: boolean;
  pdf_options?: PDFExportOptions;
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

/**
 * Quote Statistics
 */
export interface QuoteStatistics {
  total_quotes: number;
  by_status: Record<string, number>;
  total_value: number;
  average_value: number;
  approval_rate: number;
  period: {
    from: string;
    to: string;
  };
}

/**
 * Sales Report
 */
export interface SalesReport {
  period: {
    from: string;
    to: string;
  };
  total_quotes: number;
  approved_quotes: number;
  total_value: number;
  approved_value: number;
  approval_rate: number;
  top_clients: Array<{
    client_name: string;
    quote_count: number;
    total_value: number;
  }>;
  by_sales_person: Array<{
    user: UserRow;
    quote_count: number;
    approved_count: number;
    total_value: number;
  }>;
}

// ============================================
// QUOTE VERSIONING & REVISIONS
// ============================================

/**
 * Quote Revision
 */
export interface QuoteRevision {
  quote_id: string;
  revision_number: number;
  changes: Record<string, any>;
  created_by: string;
  created_at: string;
  comment?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Deep Partial - Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * API Response Wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    request_id?: string;
  };
}

/**
 * Form State
 */
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Select Option (for dropdowns)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if quote is editable
 */
export function isQuoteEditable(quote: Quote): boolean {
  return quote.status === QuotationStatus.DRAFT || quote.status === 'draft';
}

/**
 * Check if quote is approved
 */
export function isQuoteApproved(quote: Quote): boolean {
  return quote.status === QuotationStatus.APPROVED || quote.status === 'approved';
}

/**
 * Check if quote is sent
 */
export function isQuoteSent(quote: Quote): boolean {
  return quote.sent_at !== null;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Default Values
 */
export const QUOTE_DEFAULTS = {
  status: QuotationStatus.DRAFT,
  payment_terms: '50% upfront, 50% on delivery',
  validity_period: '30 days',
  execution_period: '4-6 weeks',
  vat_rate: 0.075, // 7.5%
  revision_number: 1,
} as const;

/**
 * Status Colors (for UI)
 */
export const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  sent: 'blue',
};

/**
 * Status Labels
 */
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  sent: 'Sent to Client',
};

/**
 * Panel Component Categories
 */
export const PANEL_COMPONENT_CATEGORIES = {
  BUSBAR: 'Busbar',
  ENCLOSURE: 'Enclosure',
  INCOMER: 'Incomer',
  OUTGOING: 'Outgoing',
  METER: 'Digital Meter',
  ACCESSORIES: 'Accessories',
  CABLES: 'Cables',
  BOLTS: 'Bolts',
  CAPACITOR_BANK: 'Capacitor Bank',
  SURGE_ARRESTER: 'Surge Arrester',
  POWER_FACTOR_CONTROLLER: 'Power Factor Controller',
  COMAP: 'COMAP Control',
  CONTACTOR: 'Contactor/Battery Charger',
  OTHERS: 'Others',
} as const;

/**
 * Quote Number Format
 * Example: PPL/2024/001
 */
export const QUOTE_NUMBER_FORMAT = {
  prefix: 'PPL',
  separator: '/',
  yearFormat: 'YYYY',
  sequenceLength: 3,
} as const;

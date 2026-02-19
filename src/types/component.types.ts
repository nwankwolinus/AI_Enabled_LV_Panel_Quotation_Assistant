// ============================================
// COMPONENT SYSTEM - TYPE DEFINITIONS (ALIGNED WITH DATABASE)
// File: src/types/component.types.ts
// Based on actual Supabase schema
// ============================================

import { ComponentRow, UserRow } from './database.types';

// ============================================
// CORE INTERFACES (Based on Database Schema)
// ============================================

/**
 * Component Interface
 * Maps to database 'components' table
 */
export interface Component extends ComponentRow {}

/**
 * Component with Relations
 */
export interface ComponentWithRelations extends Component {
  created_by_user?: UserRow;
}

// ============================================
// ENUMS & CATEGORIES
// ============================================

/**
 * Component Categories (based on LV Panel components)
 */
export enum ComponentCategory {
  // Main Breakers & Distribution
  ACB = 'ACB', // Air Circuit Breaker
  MCCB = 'MCCB', // Molded Case Circuit Breaker
  MCB = 'MCB', // Miniature Circuit Breaker
  RCCB = 'RCCB', // Residual Current Circuit Breaker
  
  // Contactors & Relays
  CONTACTOR = 'Contactor',
  RELAY = 'Relay',
  OVERLOAD_RELAY = 'Overload Relay',
  
  // Metering & Monitoring
  DIGITAL_METER = 'Digital Meter',
  ANALOG_METER = 'Analog Meter',
  CT = 'CT', // Current Transformer
  VT = 'VT', // Voltage Transformer
  
  // Power Quality
  CAPACITOR_BANK = 'Capacitor Bank',
  POWER_FACTOR_CONTROLLER = 'Power Factor Controller',
  SURGE_ARRESTER = 'Surge Arrester',
  
  // Control & Automation
  COMAP = 'COMAP',
  PLC = 'PLC',
  HMI = 'HMI',
  
  // Busbars & Conductors
  BUSBAR = 'Busbar',
  CABLE = 'Cable',
  CABLE_LUG = 'Cable Lug',
  
  // Enclosures & Mounting
  PANEL_ENCLOSURE = 'Panel Enclosure',
  DIN_RAIL = 'DIN Rail',
  
  // Accessories
  INDICATOR_LAMP = 'Indicator Lamp',
  PUSH_BUTTON = 'Push Button',
  SELECTOR_SWITCH = 'Selector Switch',
  TERMINAL_BLOCK = 'Terminal Block',
  WIRE_DUCT = 'Wire Duct',
  LABEL = 'Label',
  BOLT = 'Bolt',
  NUT = 'Nut',
  WASHER = 'Washer',
  
  // Others
  OTHER = 'Other',
}

/**
 * Amperage Ratings (common values)
 */
export const AMPERAGE_RATINGS = [
  '16A', '20A', '25A', '32A', '40A', '50A', '63A', '80A', '100A',
  '125A', '160A', '200A', '250A', '315A', '400A', '500A', '630A',
  '800A', '1000A', '1250A', '1600A', '2000A', '2500A', '3200A', '4000A', '5000A', '6300A',
] as const;

/**
 * Pole Configurations
 */
export const POLE_CONFIGURATIONS = [
  '1P', '2P', '3P', '4P', '1P+N', '3P+N',
] as const;

/**
 * Breaker Types
 */
export const BREAKER_TYPES = [
  'Fixed', 'Withdrawable', 'Plug-in',
] as const;

// ============================================
// DTOs
// ============================================

/**
 * Create Component DTO
 */
export interface CreateComponentDTO {
  item: string; // Component name/description
  manufacturer: string;
  model: string;
  vendor: string;
  price: number;
  currency?: string;
  category?: string;
  type?: string;
  amperage?: string;
  poles?: string;
  specification?: string;
}

/**
 * Update Component DTO
 */
export interface UpdateComponentDTO {
  item?: string;
  manufacturer?: string;
  model?: string;
  vendor?: string;
  price?: number;
  currency?: string;
  category?: string;
  type?: string;
  amperage?: string;
  poles?: string;
  specification?: string;
}

/**
 * Import Component from Excel
 */
export interface ImportComponentDTO {
  item: string;
  manufacturer: string;
  model: string;
  vendor: string;
  price: number;
  currency?: string;
  category?: string;
  type?: string;
  amperage?: string;
  poles?: string;
  specification?: string;
}

// ============================================
// FILTERS & SEARCH
// ============================================

/**
 * Component Filters
 */
export interface ComponentFilters {
  category?: string | string[];
  manufacturer?: string | string[];
  vendor?: string | string[];
  amperage?: string | string[];
  poles?: string | string[];
  type?: string | string[];
  min_price?: number;
  max_price?: number;
  search?: string; // Alias for search_query
  search_query?: string;
  created_by?: string;
}

/**
 * Component Sort Options
 */
export interface ComponentSortOptions {
  field: 'item' | 'manufacturer' | 'price' | 'amperage' | 'created_at';
  direction: 'asc' | 'desc';
}

// ============================================
// COMPONENT SPECIFICATIONS
// ============================================

/**
 * Breaker Specifications
 */
export interface BreakerSpecifications {
  amperage: string;
  poles: string;
  voltage_rating: string;
  breaking_capacity: string;
  type: string;
  mounting: string;
  protection_class?: string;
  certifications?: string[];
}

/**
 * Meter Specifications
 */
export interface MeterSpecifications {
  type: string;
  display: string;
  parameters_measured: string[];
  communication?: string;
  accuracy_class?: string;
}

/**
 * Cable Specifications
 */
export interface CableSpecifications {
  size: string;
  cores: number;
  voltage_grade: string;
  insulation_type: string;
  conductor_material: string;
  armoured?: boolean;
}

/**
 * Capacitor Bank Specifications
 */
export interface CapacitorBankSpecifications {
  kvar: string;
  voltage: string;
  stages: number;
  controller_type?: string;
}

// ============================================
// COMPONENT GROUPING
// ============================================

/**
 * Component Group (for organizing similar components)
 */
export interface ComponentGroup {
  id: string;
  name: string;
  description?: string;
  components: Component[];
}

/**
 * Predefined Component Sets (commonly used together)
 */
export interface ComponentSet {
  id: string;
  name: string;
  description: string;
  components: Array<{
    component_id: string;
    quantity: number;
    is_optional: boolean;
  }>;
}

// ============================================
// PRICING HELPERS
// ============================================

/**
 * Component Price History
 */
export interface ComponentPriceHistory {
  id: string;
  component_id: string;
  old_price: number;
  new_price: number;
  currency: string;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

/**
 * Bulk Pricing Tier
 */
export interface BulkPricingTier {
  component_id: string;
  min_quantity: number;
  max_quantity?: number;
  discount_percent: number;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Component Usage Statistics
 */
export interface ComponentUsageStats {
  component_id: string;
  component: Component;
  total_quotes: number;
  total_quantity_quoted: number;
  total_value: number;
  average_quantity_per_quote: number;
  last_used: string;
}

/**
 * Popular Components Report
 */
export interface PopularComponentsReport {
  period: {
    from: string;
    to: string;
  };
  most_quoted: ComponentUsageStats[];
  highest_value: ComponentUsageStats[];
  by_category: Array<{
    category: string;
    component_count: number;
    total_value: number;
  }>;
}

// ============================================
// CONSTANTS
// ============================================

export const COMPONENT_DEFAULTS = {
  currency: 'NGN',
} as const;

/**
 * Common Manufacturers
 */
export const COMMON_MANUFACTURERS = [
  'Schneider Electric',
  'ABB',
  'Siemens',
  'GE',
  'Eaton',
  'Legrand',
  'Mitsubishi',
  'Fuji Electric',
  'LS Electric',
  'Socomec',
  'CHINT',
  'Other',
] as const;

/**
 * Common Vendors (Nigerian Market)
 */
export const COMMON_VENDORS = [
  'Schneider',
  'ABB',
  'Siemens',
  'Local Distributor',
  'Import',
  'Other',
] as const;

/**
 * Currency Options
 */
export const CURRENCY_OPTIONS = [
  { label: 'Nigerian Naira (₦)', value: 'NGN' },
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'British Pound (£)', value: 'GBP' },
] as const;

/**
 * Excel Import Template Headers
 */
export const COMPONENT_EXCEL_HEADERS = [
  'Item/Description',
  'Manufacturer',
  'Model',
  'Vendor',
  'Price',
  'Currency',
  'Category',
  'Type',
  'Amperage',
  'Poles',
  'Specification',
] as const;

/**
 * Component field mappings for Excel import
 */
export const COMPONENT_FIELD_MAPPINGS = {
  'Item/Description': 'item',
  'Item': 'item',
  'Description': 'item',
  'Manufacturer': 'manufacturer',
  'Model': 'model',
  'Vendor': 'vendor',
  'Price': 'price',
  'Currency': 'currency',
  'Category': 'category',
  'Type': 'type',
  'Amperage': 'amperage',
  'Poles': 'poles',
  'Specification': 'specification',
  'Spec': 'specification',
} as const;
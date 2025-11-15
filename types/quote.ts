export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface QuoteLineItem {
  category: string;
  unitPrice: number;
  quantity: number;
  included: string[];
  excluded: string[];
  assumptions: string[];
  materialSpec?: string;
}

export interface Quote {
  id: string;
  project_id: string;
  vendor_id: string;
  line_items: QuoteLineItem[];
  total_amount: number;
  valid_until?: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface QuoteFormData {
  projectId: string;
  lineItems: QuoteLineItem[];
  totalAmount: number;
  validUntil?: string;
}

export interface QuoteComparison {
  mappingRate: number;
  differences: Array<{
    field: string;
    values: unknown[];
  }>;
  table: Array<{
    category: string;
    [key: string]: unknown;
  }>;
  showDifferencesOnly: boolean;
}

export interface QuoteTemplate {
  id: string;
  line_items: QuoteLineItem[];
  used_at: string;
}


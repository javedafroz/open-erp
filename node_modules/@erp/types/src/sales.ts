import { Address } from './user';

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  subCategory?: string;
  brand?: string;
  type: 'physical' | 'digital' | 'service';
  status: 'active' | 'inactive' | 'discontinued';
  basePrice: number;
  currency: string;
  costPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  inventoryTracked: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'm' | 'ft';
}

export interface Quote {
  id: string;
  number: string;
  name: string;
  accountId: string;
  contactId?: string;
  opportunityId?: string;
  ownerId: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  validUntil: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  terms?: string;
  notes?: string;
  lineItems: QuoteLineItem[];
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  createdById: string;
  organizationId: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  taxRate: number;
}

export interface Order {
  id: string;
  number: string;
  accountId: string;
  contactId?: string;
  quoteId?: string;
  opportunityId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
  shippingAddress?: Address;
  billingAddress?: Address;
  lineItems: OrderLineItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  taxRate: number;
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Invoice {
  id: string;
  number: string;
  orderId?: string;
  accountId: string;
  contactId?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  currency: string;
  paymentTerms?: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  billingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  createdById: string;
  organizationId: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  taxRate: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'paypal' | 'other';
  amount: number;
  currency: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  organizationId: string;
}



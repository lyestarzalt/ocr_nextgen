// Define the available field types (only using types supported by OpenAI)
export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

// Define the schema field structure
export interface SchemaField {
  name: string;
  type: FieldType;
  description?: string;
  examples?: string[];
  required: boolean;
  format?: string; // For string fields
  properties?: SchemaField[]; // For object fields
  items?: SchemaField; // For array fields
}

// Define the OCR results structure
export interface TextLine {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
  polygon: [number, number][];
}

export interface OCRResults {
  text_lines: TextLine[];
  full_text: string;
}

export interface ExtractedData {
  [key: string]: string | number | boolean | any[] | object | null;
}

export interface ProcessResponse {
  ocr_results: OCRResults;
  extracted_data: ExtractedData;
}

// Format options for string fields
export const FORMAT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'address', label: 'Address' }
];

// Templates for common document types
export const SCHEMA_TEMPLATES: Record<string, SchemaField[]> = {
  'invoice': [
    { name: 'invoice_number', type: 'string' as FieldType, description: 'The unique identifier of the invoice, usually located at the top and prefixed with "Invoice #" or "INV-"', required: true },
    { name: 'date', type: 'string' as FieldType, description: 'The invoice date, often in MM/DD/YYYY format near the top', format: 'date', required: true },
    { name: 'due_date', type: 'string' as FieldType, description: 'The date payment is due', format: 'date', required: false },
    { name: 'vendor_name', type: 'string' as FieldType, description: 'The name of the company or person who issued the invoice', required: true },
    { name: 'total_amount', type: 'number' as FieldType, description: 'The total payment amount including taxes and fees', required: true },
    { name: 'subtotal', type: 'number' as FieldType, description: 'The amount before taxes and additional fees', required: false },
    { name: 'tax_amount', type: 'number' as FieldType, description: 'The tax amount, often labeled as Tax, GST, VAT, etc.', required: false },
    { name: 'line_items', type: 'array' as FieldType, description: 'List of products or services in the invoice', required: false,
      items: {
        name: 'item',
        type: 'object' as FieldType,
        required: true,
        properties: [
          { name: 'description', type: 'string' as FieldType, description: 'Description of the product or service', required: true },
          { name: 'quantity', type: 'number' as FieldType, description: 'Number of items', required: true },
          { name: 'unit_price', type: 'number' as FieldType, description: 'Price per unit', required: true },
          { name: 'amount', type: 'number' as FieldType, description: 'Total cost (quantity × unit price)', required: true }
        ]
      }
    }
  ],
  'receipt': [
    { name: 'merchant_name', type: 'string' as FieldType, description: 'The name of the business', required: true },
    { name: 'date', type: 'string' as FieldType, description: 'The date of purchase', format: 'date', required: true },
    { name: 'time', type: 'string' as FieldType, description: 'The time of purchase', required: false },
    { name: 'total', type: 'number' as FieldType, description: 'The total amount paid', required: true },
    { name: 'payment_method', type: 'string' as FieldType, description: 'How the purchase was paid for (credit, cash, etc.)', required: false },
    { name: 'items', type: 'array' as FieldType, description: 'Items purchased', required: false,
      items: {
        name: 'item',
        type: 'object' as FieldType,
        required: true,
        properties: [
          { name: 'name', type: 'string' as FieldType, description: 'Name of the item', required: true },
          { name: 'price', type: 'number' as FieldType, description: 'Price of the item', required: true },
          { name: 'quantity', type: 'number' as FieldType, description: 'Quantity purchased', required: false }
        ]
      }
    }
  ],
  'business_card': [
    { name: 'full_name', type: 'string' as FieldType, description: 'The person\'s full name', required: true },
    { name: 'title', type: 'string' as FieldType, description: 'The person\'s job title', required: false },
    { name: 'company', type: 'string' as FieldType, description: 'Company or organization name', required: false },
    { name: 'email', type: 'string' as FieldType, description: 'Email address', format: 'email', required: false },
    { name: 'phone', type: 'string' as FieldType, description: 'Phone number', format: 'phone', required: false },
    { name: 'address', type: 'string' as FieldType, description: 'Physical address', format: 'address', required: false },
    { name: 'website', type: 'string' as FieldType, description: 'Website URL', required: false }
  ],
  'custom': []
};
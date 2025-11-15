import Ajv from 'ajv';

const ajv = new Ajv();

// 표준 견적 라인아이템 JSON Schema
export const quoteLineItemSchema = {
  type: 'object',
  required: ['category', 'unitPrice', 'quantity'],
  properties: {
    category: {
      type: 'string',
      minLength: 1,
    },
    unitPrice: {
      type: 'number',
      minimum: 0,
    },
    quantity: {
      type: 'number',
      minimum: 0.01,
    },
    included: {
      type: 'array',
      items: { type: 'string' },
    },
    excluded: {
      type: 'array',
      items: { type: 'string' },
    },
    assumptions: {
      type: 'array',
      items: { type: 'string' },
    },
    materialSpec: {
      type: 'string',
    },
  },
};

// 견적 전체 스키마
export const quoteSchema = {
  type: 'object',
  required: ['lineItems', 'totalAmount'],
  properties: {
    lineItems: {
      type: 'array',
      minItems: 1,
      items: quoteLineItemSchema,
    },
    totalAmount: {
      type: 'number',
      minimum: 0,
    },
    validUntil: {
      type: 'string',
      format: 'date-time',
    },
  },
};

// JSON Schema 검증 함수
export function validateQuoteSchema(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const validate = ajv.compile(quoteSchema);
  const valid = validate(data);

  if (!valid && validate.errors) {
    const errors = validate.errors.map(
      (err) => `${err.instancePath} ${err.message}`
    );
    return { valid: false, errors };
  }

  return { valid: true };
}

// 표준 카테고리 목록 (용어사전 매핑용)
export const STANDARD_CATEGORIES = [
  '도배',
  '벽지',
  '페인트',
  '타일',
  '마루',
  '장판',
  '욕실',
  '주방',
  '가구',
  '조명',
  '커튼',
  '기타',
] as const;

export type StandardCategory = (typeof STANDARD_CATEGORIES)[number];


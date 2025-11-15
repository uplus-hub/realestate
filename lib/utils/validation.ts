import { z } from 'zod';

// 이메일 검증
export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다.');

// 비밀번호 검증 (8자 이상)
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.');

// 프로젝트 생성 검증
export const projectSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  spaceTypes: z
    .array(z.string())
    .min(1, '최소 1개 이상의 공간 유형을 선택해주세요.'),
  area: z.object({
    value: z.number().positive('면적은 양수여야 합니다.'),
    unit: z.enum(['평', '㎡']),
  }),
  budget: z.number().positive('예산은 양수여야 합니다.'),
  isRental: z.boolean(),
  rentalChecklist: z
    .object({
      noiseRestriction: z.boolean(),
      drillingRestriction: z.boolean(),
      wallModification: z.boolean(),
      floorModification: z.boolean(),
      otherRestrictions: z.string().optional(),
    })
    .optional(),
  photos: z
    .array(z.string().url())
    .min(3, '최소 3장의 사진이 필요합니다.')
    .max(10, '최대 10장까지 업로드 가능합니다.'),
});

// 견적 검증
export const quoteSchema = z.object({
  projectId: z.string().uuid('올바른 프로젝트 ID가 아닙니다.'),
  lineItems: z
    .array(
      z.object({
        category: z.string().min(1, '카테고리를 입력해주세요.'),
        unitPrice: z.number().positive('단가는 양수여야 합니다.'),
        quantity: z.number().positive('수량은 양수여야 합니다.'),
        included: z.array(z.string()),
        excluded: z.array(z.string()),
        assumptions: z.array(z.string()),
        materialSpec: z.string().optional(),
      })
    )
    .min(1, '최소 1개 이상의 항목이 필요합니다.'),
  totalAmount: z.number().positive('총액은 양수여야 합니다.'),
  validUntil: z.string().datetime().optional(),
});

// 파일 업로드 검증
export const fileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(3, '최소 3장의 사진이 필요합니다.')
    .max(10, '최대 10장까지 업로드 가능합니다.'),
  projectId: z.string().uuid().optional(),
});


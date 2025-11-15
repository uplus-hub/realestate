'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QuoteAutocomplete from './QuoteAutocomplete';
import toast from 'react-hot-toast';
import type { QuoteFormData, QuoteLineItem } from '@/types/quote';

const quoteFormSchema = z.object({
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
  validUntil: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  projectId: string;
  vendorId: string;
  onSubmit: (data: QuoteFormData) => void;
  isLoading?: boolean;
}

export default function QuoteForm({
  projectId,
  vendorId,
  onSubmit,
  isLoading = false,
}: QuoteFormProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      lineItems: [
        {
          category: '',
          unitPrice: 0,
          quantity: 0,
          included: [],
          excluded: [],
          assumptions: [],
          materialSpec: '',
        },
      ],
      totalAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const lineItems = watch('lineItems');
  const totalAmount = watch('totalAmount');

  // 총액 자동 계산
  useEffect(() => {
    const calculatedTotal = lineItems.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0
    );
    setValue('totalAmount', calculatedTotal);
  }, [lineItems, setValue]);

  const handleTemplateSelect = (template: { line_items: QuoteLineItem[] }) => {
    if (template.line_items && template.line_items.length > 0) {
      setValue('lineItems', template.line_items as any);
      toast.success('견적 템플릿이 적용되었습니다.');
      setShowAutocomplete(false);
    }
  };

  const handleFormSubmit = (data: QuoteFormValues) => {
    // 총액 검증
    const calculatedTotal = data.lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    if (Math.abs(calculatedTotal - data.totalAmount) > 100) {
      toast.error('총액이 항목 합계와 일치하지 않습니다.');
      return;
    }

    onSubmit({
      projectId,
      lineItems: data.lineItems,
      totalAmount: data.totalAmount,
      validUntil: data.validUntil,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 자동완성 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAutocomplete(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          과거 견적 불러오기
        </button>
      </div>

      {/* 자동완성 모달 */}
      {showAutocomplete && (
        <QuoteAutocomplete
          vendorId={vendorId}
          category={selectedCategory}
          onSelect={handleTemplateSelect}
          onClose={() => setShowAutocomplete(false)}
        />
      )}

      {/* 라인아이템 목록 */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">항목 {index + 1}</h3>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 *
                </label>
                <input
                  type="text"
                  {...register(`lineItems.${index}.category`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="예: 도배, 벽지, 타일"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                {errors.lineItems?.[index]?.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lineItems[index]?.category?.message}
                  </p>
                )}
              </div>

              {/* 단가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  단가 (원) *
                </label>
                <input
                  type="number"
                  step="1000"
                  {...register(`lineItems.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="100000"
                />
                {errors.lineItems?.[index]?.unitPrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lineItems[index]?.unitPrice?.message}
                  </p>
                )}
              </div>

              {/* 수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수량 *
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register(`lineItems.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="1"
                />
                {errors.lineItems?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lineItems[index]?.quantity?.message}
                  </p>
                )}
              </div>

              {/* 소계 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소계
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {(
                    (lineItems[index]?.unitPrice || 0) *
                    (lineItems[index]?.quantity || 0)
                  ).toLocaleString('ko-KR')}
                  원
                </div>
              </div>
            </div>

            {/* 포함 항목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                포함 항목
              </label>
              <textarea
                {...register(`lineItems.${index}.included.0`)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="포함된 항목을 쉼표로 구분하여 입력"
                rows={2}
              />
            </div>

            {/* 제외 항목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제외 항목
              </label>
              <textarea
                {...register(`lineItems.${index}.excluded.0`)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="제외된 항목을 쉼표로 구분하여 입력"
                rows={2}
              />
            </div>

            {/* 가정 사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가정 사항
              </label>
              <textarea
                {...register(`lineItems.${index}.assumptions.0`)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="견적 산정 시 가정한 사항을 입력"
                rows={2}
              />
            </div>

            {/* 자재 스펙 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                자재 스펙
              </label>
              <input
                type="text"
                {...register(`lineItems.${index}.materialSpec`)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 두께 12mm, 브랜드명"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 항목 추가 버튼 */}
      <button
        type="button"
        onClick={() =>
          append({
            category: '',
            unitPrice: 0,
            quantity: 0,
            included: [],
            excluded: [],
            assumptions: [],
            materialSpec: '',
          })
        }
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        + 항목 추가
      </button>

      {/* 총액 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-800">총액</span>
          <div className="text-right">
            <input
              type="number"
              step="1000"
              {...register('totalAmount', { valueAsNumber: true })}
              className="text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 text-right"
            />
            <span className="text-sm text-gray-500 ml-2">원</span>
          </div>
        </div>
        {errors.totalAmount && (
          <p className="mt-2 text-sm text-red-600">{errors.totalAmount.message}</p>
        )}
      </div>

      {/* 유효기간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          견적 유효기간 (선택)
        </label>
        <input
          type="datetime-local"
          {...register('validUntil')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '제출 중...' : '견적 제출'}
        </button>
      </div>
    </form>
  );
}


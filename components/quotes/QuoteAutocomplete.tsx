'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { QuoteTemplate } from '@/types/quote';

interface QuoteAutocompleteProps {
  vendorId: string;
  category?: string;
  onSelect: (template: QuoteTemplate) => void;
  onClose: () => void;
}

export default function QuoteAutocomplete({
  vendorId,
  category,
  onSelect,
  onClose,
}: QuoteAutocompleteProps) {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const url = category
          ? `/api/quotes/autocomplete?vendorId=${vendorId}&category=${category}`
          : `/api/quotes/autocomplete?vendorId=${vendorId}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '템플릿을 불러올 수 없습니다.');
        }

        setTemplates(result.templates || []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : '템플릿을 불러올 수 없습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [vendorId, category]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">템플릿 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">과거 견적 불러오기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">사용 가능한 템플릿이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {template.line_items.length}개 항목
                    </h3>
                    <p className="text-sm text-gray-500">
                      사용일: {new Date(template.used_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(template);
                      onClose();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    선택
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    {template.line_items.slice(0, 4).map((item, index) => (
                      <div key={index} className="truncate">
                        {item.category}: {item.unitPrice.toLocaleString('ko-KR')}원 ×{' '}
                        {item.quantity}
                      </div>
                    ))}
                  </div>
                  {template.line_items.length > 4 && (
                    <p className="text-xs text-gray-400 mt-2">
                      외 {template.line_items.length - 4}개 항목...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


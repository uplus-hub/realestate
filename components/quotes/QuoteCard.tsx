'use client';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Quote } from '@/types/quote';

interface QuoteCardProps {
  quote: Quote;
  onSelect?: (quoteId: string) => void;
  showActions?: boolean;
}

export default function QuoteCard({
  quote,
  onSelect,
  showActions = true,
}: QuoteCardProps) {
  const lineItems = Array.isArray(quote.line_items)
    ? quote.line_items
    : typeof quote.line_items === 'object'
    ? [quote.line_items]
    : [];

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6 border-2
        ${onSelect ? 'cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all' : ''}
        ${
          quote.status === 'accepted'
            ? 'border-green-400'
            : quote.status === 'rejected'
            ? 'border-red-400'
            : 'border-gray-200'
        }
      `}
      onClick={() => onSelect?.(quote.id)}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            견적 #{quote.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(quote.created_at)}
          </p>
        </div>
        <span
          className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${
              quote.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : quote.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : quote.status === 'expired'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-800'
            }
          `}
        >
          {quote.status === 'accepted'
            ? '수락됨'
            : quote.status === 'rejected'
            ? '거절됨'
            : quote.status === 'expired'
            ? '만료됨'
            : '대기 중'}
        </span>
      </div>

      {/* 주요 항목 미리보기 */}
      {lineItems.length > 0 && (
        <div className="mb-4 space-y-2">
          {lineItems.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.category}</span>
              <span className="text-gray-800 font-medium">
                {((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString('ko-KR')}원
              </span>
            </div>
          ))}
          {lineItems.length > 3 && (
            <p className="text-xs text-gray-400">
              외 {lineItems.length - 3}개 항목...
            </p>
          )}
        </div>
      )}

      {/* 총액 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-800">총액</span>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(quote.total_amount)}
          </span>
        </div>
      </div>

      {/* 유효기간 */}
      {quote.valid_until && (
        <div className="mt-2 text-sm text-gray-500">
          유효기간: {formatDate(quote.valid_until)}
        </div>
      )}

      {/* 액션 버튼 */}
      {showActions && onSelect && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(quote.id);
            }}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            상세 보기
          </button>
        </div>
      )}
    </div>
  );
}


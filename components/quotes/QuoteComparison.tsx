'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/format';
import type { Quote, QuoteComparison as QuoteComparisonType } from '@/types/quote';

interface QuoteComparisonProps {
  quotes: Quote[];
  showDifferencesOnly?: boolean;
}

export default function QuoteComparison({
  quotes,
  showDifferencesOnly = true,
}: QuoteComparisonProps) {
  const [showDifferences, setShowDifferences] = useState(showDifferencesOnly);
  const [comparison, setComparison] = useState<QuoteComparisonType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 견적 비교 데이터 가져오기
  const fetchComparison = async () => {
    if (quotes.length < 2) return;

    setIsLoading(true);
    try {
      const quoteIds = quotes.map((q) => q.id).join(',');
      const projectId = quotes[0].project_id;

      const response = await fetch(
        `/api/quotes/compare?projectId=${projectId}&quoteIds=${quoteIds}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '비교 데이터를 불러올 수 없습니다.');
      }

      setComparison(result.comparison);
    } catch (error) {
      console.error('비교 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 견적이 변경되면 자동으로 비교 데이터 가져오기
  useEffect(() => {
    if (quotes.length >= 2) {
      fetchComparison();
    }
  }, [quotes]);

  if (quotes.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        비교하려면 최소 2개 이상의 견적이 필요합니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">비교 중...</p>
      </div>
    );
  }

  // 간단한 비교 테이블 (실제로는 comparison 데이터 사용)
  const allCategories = new Set<string>();
  quotes.forEach((quote) => {
    const items = Array.isArray(quote.line_items)
      ? quote.line_items
      : typeof quote.line_items === 'object'
      ? [quote.line_items]
      : [];
    items.forEach((item: any) => {
      if (item.category) allCategories.add(item.category);
    });
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">견적 비교</h2>
          {comparison && (
            <p className="text-sm text-gray-500 mt-1">
              매핑률: {(comparison.mappingRate * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDifferences}
            onChange={(e) => setShowDifferences(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">차이만 보기</span>
        </label>
      </div>

      {/* 비교 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                항목
              </th>
              {quotes.map((quote, index) => (
                <th
                  key={quote.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  견적 {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from(allCategories).map((category) => {
              const values = quotes.map((quote) => {
                const items = Array.isArray(quote.line_items)
                  ? quote.line_items
                  : typeof quote.line_items === 'object'
                  ? [quote.line_items]
                  : [];
                const item = items.find((i: any) => i.category === category);
                return item
                  ? (item.unitPrice || 0) * (item.quantity || 0)
                  : null;
              });

              // 차이만 보기 필터
              if (showDifferences) {
                const uniqueValues = new Set(values.filter((v) => v !== null));
                if (uniqueValues.size <= 1) return null;
              }

              return (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category}
                  </td>
                  {values.map((value, index) => (
                    <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {value !== null ? formatCurrency(value) : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
            {/* 총액 행 */}
            <tr className="bg-indigo-50 font-semibold">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">총액</td>
              {quotes.map((quote) => (
                <td
                  key={quote.id}
                  className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600"
                >
                  {formatCurrency(quote.total_amount)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 차이점 요약 */}
      {comparison && comparison.differences.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">주요 차이점</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            {comparison.differences.slice(0, 5).map((diff, index) => (
              <li key={index}>
                • {diff.field}: {diff.values.join(' vs ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


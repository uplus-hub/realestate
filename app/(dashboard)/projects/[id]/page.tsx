'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency, formatDate, formatTimeRemaining } from '@/lib/utils/format';
import { SPACE_TYPES } from '@/lib/constants/project-types';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  space_types: string[];
  area_value: number;
  area_unit: '평' | '㎡';
  budget: number;
  is_rental: boolean;
  status: string;
  sla_deadline: string | null;
  created_at: string;
  photos?: Array<{ storage_url: string; order_index: number }>;
  quotes?: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '프로젝트를 불러올 수 없습니다.');
        }

        setProject(result.project);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : '프로젝트를 불러올 수 없습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">프로젝트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const spaceTypeLabels = project.space_types.map(
    (type) => SPACE_TYPES.find((t) => t.value === type)?.label || type
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                생성일: {formatDate(project.created_at)}
              </p>
            </div>
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  project.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : project.status === 'quoted'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }
              `}
            >
              {project.status === 'pending'
                ? '견적 대기'
                : project.status === 'quoted'
                ? '견적 수신'
                : project.status}
            </span>
          </div>

          {/* SLA 타이머 */}
          {project.sla_deadline && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-800">
                    24시간 내 2건 이상 견적 보장
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {formatTimeRemaining(project.sla_deadline)}
                  </p>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.ceil(
                    (new Date(project.sla_deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60)
                  )}
                  h
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 사진 */}
            {project.photos && project.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">사진</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.photos
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((photo, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={photo.storage_url}
                          alt={`프로젝트 사진 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 견적 목록 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">견적</h2>
                {project.quotes && project.quotes.length >= 2 && (
                  <span className="text-sm text-indigo-600">
                    {project.quotes.length}건 수신
                  </span>
                )}
              </div>
              {project.quotes && project.quotes.length > 0 ? (
                <div className="space-y-4">
                  {project.quotes.map((quote: any) => (
                    <div
                      key={quote.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            견적 #{quote.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(quote.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">
                            {formatCurrency(quote.total_amount)}
                          </div>
                          <span
                            className={`
                              mt-1 inline-block px-2 py-1 rounded-full text-xs
                              ${
                                quote.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : quote.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            `}
                          >
                            {quote.status === 'accepted'
                              ? '수락됨'
                              : quote.status === 'rejected'
                              ? '거절됨'
                              : '대기 중'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">아직 견적이 없습니다.</p>
              )}
            </div>

            {/* 견적 비교 (2개 이상일 때) */}
            {project.quotes && project.quotes.length >= 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">견적 비교</h2>
                {/* TODO: QuoteComparison 컴포넌트 사용 */}
                <p className="text-gray-500">비교 기능은 준비 중입니다.</p>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 프로젝트 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 정보</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">공간 유형</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {spaceTypeLabels.join(', ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">면적</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {project.area_value} {project.area_unit}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">예산</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatCurrency(project.budget)}
                  </dd>
                </div>
                {project.is_rental && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">임대 주택</dt>
                    <dd className="mt-1 text-sm text-green-600">예</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  created_at: string;
  sla_deadline: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?role=consumer');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '프로젝트를 불러올 수 없습니다.');
        }

        setProjects(result.projects || []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : '프로젝트를 불러올 수 없습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">대시보드</h1>
          <Link
            href="/projects/new"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            새 프로젝트 생성
          </Link>
        </div>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">프로젝트가 없습니다</h3>
            <p className="mt-2 text-sm text-gray-500">
              새 프로젝트를 생성하여 견적을 받아보세요.
            </p>
            <div className="mt-6">
              <Link
                href="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                프로젝트 생성하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {project.title}
                  </h3>
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
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
                      ? '대기'
                      : project.status === 'quoted'
                      ? '견적 수신'
                      : project.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>예산: {formatCurrency(project.budget)}</div>
                  <div>생성일: {formatDate(project.created_at)}</div>
                  {project.sla_deadline && (
                    <div className="text-indigo-600 font-medium">
                      SLA: {new Date(project.sla_deadline).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


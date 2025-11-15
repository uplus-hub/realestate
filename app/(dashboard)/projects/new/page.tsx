'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProjectForm from '@/components/projects/ProjectForm';
import toast from 'react-hot-toast';
import type { ProjectFormData } from '@/types/project';

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      // 프로젝트 생성 (사진은 이미 ProjectForm에서 업로드됨)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '프로젝트 생성에 실패했습니다.');
      }

      toast.success('프로젝트가 생성되었습니다!');
      router.push(`/projects/${result.project.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">새 프로젝트 생성</h1>
          <p className="text-gray-600 mb-6">
            사진을 업로드하고 프로젝트 정보를 입력하세요.
          </p>

          <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}


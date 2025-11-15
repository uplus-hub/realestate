'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'vendor' | null>(null);

  const handleRoleSelect = (role: 'consumer' | 'vendor') => {
    setSelectedRole(role);
    router.push(`/signup?role=${role}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            인테리어 견적 플랫폼
          </h1>
          <p className="text-center text-gray-600 mb-8">
            사진으로 쉽게 견적을 받아보세요
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('consumer')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              고객으로 시작하기
            </button>
            <button
              onClick={() => handleRoleSelect('vendor')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              업체로 시작하기
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


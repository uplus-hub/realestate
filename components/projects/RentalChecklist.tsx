'use client';

import { useEffect } from 'react';
import type { RentalChecklist as RentalChecklistType } from '@/types/project';

interface RentalChecklistProps {
  checklist: RentalChecklistType | null;
  onChange: (checklist: RentalChecklistType) => void;
}

export default function RentalChecklist({
  checklist,
  onChange,
}: RentalChecklistProps) {
  const defaultChecklist: RentalChecklistType = {
    noiseRestriction: false,
    drillingRestriction: false,
    wallModification: false,
    floorModification: false,
    otherRestrictions: '',
  };

  const currentChecklist = checklist || defaultChecklist;

  const handleChange = (field: keyof RentalChecklistType, value: boolean | string) => {
    onChange({
      ...currentChecklist,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        임대 원상복구 체크리스트
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        임대 조건에 따라 가능한 공법만 표시됩니다. 원상복구 기준을 확인해주세요.
      </p>

      <div className="space-y-3">
        {/* 층간소음 제한 */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={currentChecklist.noiseRestriction}
            onChange={(e) => handleChange('noiseRestriction', e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700">층간소음 제한</div>
            <div className="text-sm text-gray-500">
              타일 시공, 드릴 작업 등 소음 발생 공법 제한
            </div>
          </div>
        </label>

        {/* 타공 제한 */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={currentChecklist.drillingRestriction}
            onChange={(e) => handleChange('drillingRestriction', e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700">타공 제한</div>
            <div className="text-sm text-gray-500">
              벽, 천장 타공 불가 (조명, 선반 설치 제한)
            </div>
          </div>
        </label>

        {/* 벽면 수정 제한 */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={currentChecklist.wallModification}
            onChange={(e) => handleChange('wallModification', e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700">벽면 수정 제한</div>
            <div className="text-sm text-gray-500">
              벽지 제거, 페인트 도색 등 벽면 수정 불가
            </div>
          </div>
        </label>

        {/* 바닥 수정 제한 */}
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={currentChecklist.floorModification}
            onChange={(e) => handleChange('floorModification', e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700">바닥 수정 제한</div>
            <div className="text-sm text-gray-500">
              마루, 장판 제거 및 교체 불가
            </div>
          </div>
        </label>

        {/* 기타 제한사항 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기타 제한사항
          </label>
          <textarea
            value={currentChecklist.otherRestrictions || ''}
            onChange={(e) => handleChange('otherRestrictions', e.target.value)}
            placeholder="기타 원상복구 관련 제한사항을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <strong>안내:</strong> 체크리스트 결과에 따라 허용 가능한 공법만 견적에 표시됩니다.
        원상복구 문제로 인한 분쟁을 예방하기 위해 정확히 입력해주세요.
      </div>
    </div>
  );
}


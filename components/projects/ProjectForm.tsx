'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhotoUpload from './PhotoUpload';
import RentalChecklist from './RentalChecklist';
import { SPACE_TYPES } from '@/lib/constants/project-types';
import type { ProjectFormData, RentalChecklist as RentalChecklistType } from '@/types/project';

const projectFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  spaceTypes: z.array(z.string()).min(1, '최소 1개 이상의 공간 유형을 선택해주세요.'),
  area: z.object({
    value: z.number().positive('면적은 양수여야 합니다.'),
    unit: z.enum(['평', '㎡']),
  }),
  budget: z.number().positive('예산은 양수여야 합니다.'),
  isRental: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
  isLoading?: boolean;
}

export default function ProjectForm({
  onSubmit,
  initialData,
  isLoading = false,
}: ProjectFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [rentalChecklist, setRentalChecklist] = useState<RentalChecklistType | null>(
    initialData?.rentalChecklist || null
  );
  const [isRental, setIsRental] = useState(initialData?.isRental || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      spaceTypes: initialData?.spaceTypes || [],
      area: initialData?.area || { value: 0, unit: '평' },
      budget: initialData?.budget || 0,
      isRental: initialData?.isRental || false,
    },
  });

  const selectedSpaceTypes = watch('spaceTypes');

  const handleSpaceTypeToggle = (value: string) => {
    const current = selectedSpaceTypes || [];
    if (current.includes(value)) {
      setValue('spaceTypes', current.filter((v) => v !== value));
    } else {
      setValue('spaceTypes', [...current, value]);
    }
  };

  const handleFormSubmit = async (data: ProjectFormValues) => {
    // 사진 검증
    if (photos.length < 3) {
      alert('최소 3장의 사진이 필요합니다.');
      return;
    }

    if (photos.length > 10) {
      alert('최대 10장까지 업로드 가능합니다.');
      return;
    }

    // 임대 체크리스트 검증
    if (isRental && !rentalChecklist) {
      alert('임대 체크리스트를 작성해주세요.');
      return;
    }

    // 사진을 Supabase Storage에 업로드
    const formData = new FormData();
    photos.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const uploadResponse = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || '사진 업로드에 실패했습니다.');
      }

      onSubmit({
        ...data,
        photos: uploadResult.urls || [],
        rentalChecklist: isRental ? rentalChecklist : undefined,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : '사진 업로드에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          프로젝트 제목
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="예: 거실 리모델링"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 사진 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사진 업로드 (3~10장)
        </label>
        <PhotoUpload
          onUpload={setPhotos}
          maxFiles={10}
          maxSize={10}
          initialFiles={photos}
        />
        {photos.length < 3 && photos.length > 0 && (
          <p className="mt-2 text-sm text-amber-600">
            최소 3장의 사진이 필요합니다. ({photos.length}/3)
          </p>
        )}
      </div>

      {/* 공간 유형 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공간 유형 (다중 선택)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPACE_TYPES.map((type) => (
            <label
              key={type.value}
              className={`
                p-3 border-2 rounded-lg cursor-pointer text-center transition-colors
                ${
                  selectedSpaceTypes?.includes(type.value)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input
                type="checkbox"
                value={type.value}
                checked={selectedSpaceTypes?.includes(type.value) || false}
                onChange={() => handleSpaceTypeToggle(type.value)}
                className="sr-only"
              />
              <div className="font-medium text-sm">{type.label}</div>
            </label>
          ))}
        </div>
        {errors.spaceTypes && (
          <p className="mt-1 text-sm text-red-600">{errors.spaceTypes.message}</p>
        )}
      </div>

      {/* 면적 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="area-value" className="block text-sm font-medium text-gray-700 mb-1">
            면적
          </label>
          <div className="flex gap-2">
            <input
              id="area-value"
              type="number"
              step="0.1"
              {...register('area.value', { valueAsNumber: true })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="33"
            />
            <select
              {...register('area.unit')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="평">평</option>
              <option value="㎡">㎡</option>
            </select>
          </div>
          {errors.area?.value && (
            <p className="mt-1 text-sm text-red-600">{errors.area.value.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            예산 (원)
          </label>
          <input
            id="budget"
            type="number"
            step="100000"
            {...register('budget', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="5000000"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
          )}
        </div>
      </div>

      {/* 임대 여부 */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isRental}
            onChange={(e) => {
              setIsRental(e.target.checked);
              setValue('isRental', e.target.checked);
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div>
            <div className="font-medium text-gray-700">임대 주택입니다</div>
            <div className="text-sm text-gray-500">
              원상복구 기준을 확인하기 위해 체크리스트를 작성해주세요
            </div>
          </div>
        </label>
      </div>

      {/* 임대 체크리스트 */}
      {isRental && (
        <RentalChecklist
          checklist={rentalChecklist}
          onChange={setRentalChecklist}
        />
      )}

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
          disabled={isLoading || photos.length < 3}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '생성 중...' : '프로젝트 생성'}
        </button>
      </div>
    </form>
  );
}


import type { SpaceType } from '@/types/project';

export const SPACE_TYPES: Array<{
  value: SpaceType;
  label: string;
  description?: string;
}> = [
  { value: 'living_room', label: '거실' },
  { value: 'bedroom', label: '침실' },
  { value: 'kitchen', label: '주방' },
  { value: 'bathroom', label: '욕실' },
  { value: 'balcony', label: '발코니' },
  { value: 'entrance', label: '현관' },
  { value: 'other', label: '기타' },
];

export const AREA_UNITS = ['평', '㎡'] as const;

// 평을 ㎡로 변환 (1평 = 3.3058㎡)
export function convertPyeongToSquareMeter(pyeong: number): number {
  return pyeong * 3.3058;
}

// ㎡를 평으로 변환
export function convertSquareMeterToPyeong(squareMeter: number): number {
  return squareMeter / 3.3058;
}


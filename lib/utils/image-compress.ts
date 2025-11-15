import imageCompression from 'react-image-compressor';

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * 이미지를 압축합니다.
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 파일
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const defaultOptions: CompressOptions = {
    maxSizeMB: 2, // 2MB로 압축
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, {
      ...defaultOptions,
      ...options,
    });
    return compressedFile;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    throw new Error('이미지 압축에 실패했습니다.');
  }
}

/**
 * 이미지 파일 크기를 확인합니다.
 * @param file 이미지 파일
 * @returns 파일 크기 (MB)
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

/**
 * 이미지가 10MB를 초과하는지 확인합니다.
 * @param file 이미지 파일
 * @returns 10MB 초과 여부
 */
export function isFileTooLarge(file: File): boolean {
  return getFileSizeMB(file) > 10;
}

/**
 * 이미지 압축을 재시도합니다 (최대 3회).
 * @param file 원본 파일
 * @param maxRetries 최대 재시도 횟수
 * @returns 압축된 파일
 */
export async function compressImageWithRetry(
  file: File,
  maxRetries: number = 3
): Promise<File> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await compressImage(file);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        // 재시도 전 대기
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('이미지 압축에 실패했습니다.');
}


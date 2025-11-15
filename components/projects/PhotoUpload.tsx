'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { compressImageWithRetry, isFileTooLarge } from '@/lib/utils/image-compress';
import { removeExifData } from '@/lib/utils/exif-remove';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // MB
  initialFiles?: File[];
}

export default function PhotoUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 10,
  initialFiles = [],
}: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<File> => {
    let processedFile = file;

    // 1. EXIF 제거
    try {
      const blob = await removeExifData(processedFile);
      processedFile = new File([blob], file.name, { type: file.type });
    } catch (error) {
      console.warn('EXIF 제거 실패:', error);
      // EXIF 제거 실패해도 계속 진행
    }

    // 2. 크기 확인 및 압축
    if (isFileTooLarge(processedFile)) {
      try {
        processedFile = await compressImageWithRetry(processedFile, 3);
        toast.success(`${file.name} 압축 완료`);
      } catch (error) {
        toast.error(`${file.name} 압축 실패`);
        throw error;
      }
    }

    return processedFile;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // 파일 개수 검증
      const totalFiles = files.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`최대 ${maxFiles}장까지 업로드 가능합니다.`);
        return;
      }

      // 파일 형식 검증
      const invalidFiles = acceptedFiles.filter(
        (file) => !file.type.match(/^image\/(jpeg|jpg|png|heic)$/i)
      );
      if (invalidFiles.length > 0) {
        toast.error('JPG, PNG, HEIC 형식만 업로드 가능합니다.');
        return;
      }

      setIsProcessing(true);

      try {
        const processedFiles: File[] = [];

        for (const file of acceptedFiles) {
          const fileId = `${file.name}-${Date.now()}`;
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

          try {
            const processed = await processFile(file);
            processedFiles.push(processed);
            setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
          } catch (error) {
            toast.error(`${file.name} 처리 실패`);
            setUploadProgress((prev) => {
              const newPrev = { ...prev };
              delete newPrev[fileId];
              return newPrev;
            });
          }
        }

        const newFiles = [...files, ...processedFiles];
        setFiles(newFiles);
        onUpload(newFiles);
        toast.success(`${processedFiles.length}장의 사진이 업로드되었습니다.`);
      } catch (error) {
        toast.error('파일 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    },
    [files, maxFiles, processFile, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
    },
    maxSize: maxSize * 1024 * 1024, // MB to bytes
    disabled: isProcessing || files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, removed);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }
          ${isProcessing || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isProcessing ? (
            <p className="text-sm text-gray-600">처리 중...</p>
          ) : files.length >= maxFiles ? (
            <p className="text-sm text-gray-600">최대 {maxFiles}장까지 업로드 가능합니다.</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? '여기에 파일을 놓으세요'
                  : '드래그 앤 드롭 또는 클릭하여 업로드'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, HEIC (최대 {maxSize}MB, {maxFiles}장)
              </p>
            </>
          )}
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`업로드 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveFile(index, index - 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="왼쪽으로 이동"
                      >
                        ←
                      </button>
                    )}
                    {index < files.length - 1 && (
                      <button
                        onClick={() => moveFile(index, index + 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="오른쪽으로 이동"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
              {uploadProgress[`${file.name}-${Date.now()}`] !== undefined && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-indigo-600 h-1 rounded-full transition-all"
                      style={{
                        width: `${uploadProgress[`${file.name}-${Date.now()}`]}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 파일 개수 안내 */}
      {files.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          {files.length} / {maxFiles}장 업로드됨
        </p>
      )}
    </div>
  );
}


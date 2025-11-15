import exifr from 'exifr';

/**
 * EXIF 데이터를 제거한 이미지 Blob을 반환합니다.
 * @param file 원본 이미지 파일
 * @returns EXIF가 제거된 Blob
 */
export async function removeExifData(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
          return;
        }

        // EXIF 없이 이미지 그리기
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Blob 생성에 실패했습니다.'));
            }
          },
          file.type || 'image/jpeg',
          0.92 // 품질
        );
      };

      img.onerror = () => {
        reject(new Error('이미지 로드에 실패했습니다.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 파일에서 EXIF 메타데이터를 읽습니다 (디버깅용).
 * @param file 이미지 파일
 * @returns EXIF 데이터
 */
export async function readExifData(file: File) {
  try {
    const exifData = await exifr.parse(file);
    return exifData;
  } catch (error) {
    console.warn('EXIF 데이터를 읽을 수 없습니다:', error);
    return null;
  }
}


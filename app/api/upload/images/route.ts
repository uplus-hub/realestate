import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const projectId = formData.get('projectId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 개수 검증
    if (files.length < 3 || files.length > 10) {
      return NextResponse.json(
        { success: false, error: '3~10장의 사진이 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const urls: string[] = [];
    let compressed = false;

    for (const file of files) {
      // 파일 형식 검증
      if (!file.type.match(/^image\/(jpeg|jpg|png|heic)$/i)) {
        return NextResponse.json(
          { success: false, error: 'JPG, PNG, HEIC 형식만 업로드 가능합니다.' },
          { status: 400 }
        );
      }

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: '파일당 10MB 이하만 업로드 가능합니다.' },
          { status: 400 }
        );
      }

      // Supabase Storage에 업로드
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      const filePath = projectId ? `${projectId}/${fileName}` : fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('업로드 실패:', uploadError);
        return NextResponse.json(
          { success: false, error: '파일 업로드에 실패했습니다.' },
          { status: 500 }
        );
      }

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('project-photos')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }

      // 압축 여부 확인 (클라이언트에서 이미 압축했을 수 있음)
      if (file.size < 2 * 1024 * 1024) {
        compressed = true;
      }
    }

    return NextResponse.json({
      success: true,
      urls,
      compressed,
    });
  } catch (error) {
    console.error('업로드 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


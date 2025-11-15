import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const supabase = createServiceSupabaseClient();

    // 프로젝트 조회
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사진 조회
    const { data: photos } = await supabase
      .from('project_photos')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    // 견적 조회
    const { data: quotes } = await supabase
      .from('quotes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        photos: photos || [],
        quotes: quotes || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { projectSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const supabase = createServiceSupabaseClient();

    let query = supabase.from('projects').select('*');

    if (role === 'consumer') {
      // 고객: 자신의 프로젝트만 조회
      // TODO: 실제로는 세션에서 user_id를 가져와야 함
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const supabase = createServiceSupabaseClient();

    // SLA 데드라인 계산 (24시간 후)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 24);

    // 프로젝트 생성
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: 'temp-user-id', // TODO: 실제로는 세션에서 가져와야 함
        title: validatedData.title,
        space_types: validatedData.spaceTypes,
        area_value: validatedData.area.value,
        area_unit: validatedData.area.unit,
        budget: validatedData.budget,
        is_rental: validatedData.isRental,
        rental_checklist: validatedData.rentalChecklist || null,
        status: 'pending',
        sla_deadline: slaDeadline.toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json(
        { success: false, error: projectError.message },
        { status: 500 }
      );
    }

    // 사진 저장
    if (validatedData.photos && validatedData.photos.length > 0) {
      const photoInserts = validatedData.photos.map((url, index) => ({
        project_id: projectData.id,
        storage_url: url,
        order_index: index,
      }));

      const { error: photoError } = await supabase
        .from('project_photos')
        .insert(photoInserts);

      if (photoError) {
        console.error('사진 저장 실패:', photoError);
        // 사진 저장 실패해도 프로젝트는 생성됨
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        id: projectData.id,
        status: projectData.status,
        slaDeadline: projectData.sla_deadline,
        createdAt: projectData.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '입력값을 확인해주세요.',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


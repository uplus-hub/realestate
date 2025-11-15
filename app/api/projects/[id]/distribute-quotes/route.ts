import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

const distributeSchema = z.object({
  maxVendors: z.number().min(1).max(5).default(5),
  filters: z
    .object({
      regions: z.array(z.string()).optional(),
      specialties: z.array(z.string()).optional(),
      minTicket: z.number().optional(),
    })
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const validatedData = distributeSchema.parse(body);

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

    // 쿨다운 체크 (30분)
    const { data: recentDistribution } = await supabase
      .from('quote_distributions')
      .select('cooldown_until')
      .eq('project_id', projectId)
      .order('distributed_at', { ascending: false })
      .limit(1)
      .single();

    if (recentDistribution?.cooldown_until) {
      const cooldownUntil = new Date(recentDistribution.cooldown_until);
      if (cooldownUntil > new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: '쿨다운 중입니다. 잠시 후 다시 시도해주세요.',
            cooldownUntil: cooldownUntil.toISOString(),
          },
          { status: 409 }
        );
      }
    }

    // 업체 필터링
    let vendorQuery = supabase
      .from('vendor_profiles')
      .select('user_id, specialties, min_ticket, regions')
      .eq('verified', true);

    // 공정 필터
    if (validatedData.filters?.specialties && validatedData.filters.specialties.length > 0) {
      vendorQuery = vendorQuery.overlaps('specialties', validatedData.filters.specialties);
    }

    // 최소 티켓 필터
    if (validatedData.filters?.minTicket) {
      vendorQuery = vendorQuery.lte('min_ticket', validatedData.filters.minTicket);
    } else if (project.budget) {
      vendorQuery = vendorQuery.lte('min_ticket', project.budget);
    }

    const { data: vendors, error: vendorError } = await vendorQuery.limit(
      validatedData.maxVendors
    );

    if (vendorError) {
      return NextResponse.json(
        { success: false, error: vendorError.message },
        { status: 500 }
      );
    }

    if (!vendors || vendors.length === 0) {
      return NextResponse.json(
        { success: false, error: '조건에 맞는 업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권역 필터 (GeoJSON 폴리곤 매칭 - 간단한 구현)
    // TODO: 실제로는 @turf/turf를 사용하여 폴리곤 내부 점 검사

    const vendorIds = vendors.map((v) => v.user_id);

    // 견적 배포 기록
    const cooldownUntil = new Date();
    cooldownUntil.setMinutes(cooldownUntil.getMinutes() + 30); // 30분 쿨다운

    const distributionRecords = vendorIds.map((vendorId) => ({
      project_id: projectId,
      vendor_id: vendorId,
      cooldown_until: cooldownUntil.toISOString(),
    }));

    const { error: distributionError } = await supabase
      .from('quote_distributions')
      .insert(distributionRecords);

    if (distributionError) {
      console.error('배포 기록 저장 실패:', distributionError);
      // 배포 기록 실패해도 배포는 완료됨
    }

    return NextResponse.json({
      success: true,
      distributed: vendorIds,
      cooldownUntil: cooldownUntil.toISOString(),
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


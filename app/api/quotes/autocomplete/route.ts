import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');
    const category = searchParams.get('category');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'vendorId가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // 최근 3건의 견적 템플릿 조회
    let query = supabase
      .from('quote_templates')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('used_at', { ascending: false })
      .limit(3);

    // 카테고리 필터링 (선택사항)
    if (category) {
      // JSONB 필드에서 카테고리 검색
      query = query.filter('line_items', 'cs', JSON.stringify([{ category }]));
    }

    const { data: templates, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


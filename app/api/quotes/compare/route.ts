import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const quoteIdsParam = searchParams.get('quoteIds');

    if (!projectId || !quoteIdsParam) {
      return NextResponse.json(
        { success: false, error: 'projectId와 quoteIds가 필요합니다.' },
        { status: 400 }
      );
    }

    const quoteIds = quoteIdsParam.split(',').filter((id) => id.length > 0);

    if (quoteIds.length < 2 || quoteIds.length > 3) {
      return NextResponse.json(
        { success: false, error: '2~3개의 견적 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // 견적 조회
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .in('id', quoteIds)
      .eq('project_id', projectId);

    if (error || !quotes || quotes.length === 0) {
      return NextResponse.json(
        { success: false, error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비교 로직
    const allCategories = new Set<string>();
    const categoryMap: Record<string, Record<string, number>> = {};

    quotes.forEach((quote) => {
      const items = Array.isArray(quote.line_items)
        ? quote.line_items
        : typeof quote.line_items === 'object'
        ? [quote.line_items]
        : [];

      items.forEach((item: any) => {
        if (item.category) {
          allCategories.add(item.category);
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {};
          }
          categoryMap[item.category][quote.id] =
            (item.unitPrice || 0) * (item.quantity || 0);
        }
      });
    });

    // 매핑률 계산 (90% 이상 목표)
    const totalCategories = allCategories.size;
    const mappedCategories = Object.keys(categoryMap).length;
    const mappingRate = totalCategories > 0 ? mappedCategories / totalCategories : 0;

    // 차이점 찾기
    const differences: Array<{ field: string; values: unknown[] }> = [];
    Object.entries(categoryMap).forEach(([category, values]) => {
      const uniqueValues = Object.values(values);
      if (new Set(uniqueValues).size > 1) {
        differences.push({
          field: category,
          values: uniqueValues,
        });
      }
    });

    // 비교 테이블 생성
    const table = Array.from(allCategories).map((category) => {
      const row: Record<string, unknown> = { category };
      quotes.forEach((quote) => {
        const value = categoryMap[category]?.[quote.id] || null;
        row[`quote_${quote.id}`] = value;
      });
      return row;
    });

    return NextResponse.json({
      success: true,
      comparison: {
        mappingRate,
        differences,
        table,
        showDifferencesOnly: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


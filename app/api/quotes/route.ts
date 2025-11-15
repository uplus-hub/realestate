import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { quoteSchema, validateQuoteSchema } from '@/lib/utils/validation';
import { validateQuoteSchema as validateJSONSchema } from '@/lib/constants/quote-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = quoteSchema.parse(body);

    // JSON Schema 검증
    const schemaValidation = validateJSONSchema(validatedData);
    if (!schemaValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: '견적 스키마 검증에 실패했습니다.',
          details: schemaValidation.errors,
        },
        { status: 400 }
      );
    }

    // 총액 검증
    const calculatedTotal = validatedData.lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    if (Math.abs(calculatedTotal - validatedData.totalAmount) > 100) {
      return NextResponse.json(
        {
          success: false,
          error: '총액이 항목 합계와 일치하지 않습니다.',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // 견적 저장
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        project_id: validatedData.projectId,
        vendor_id: 'temp-vendor-id', // TODO: 실제로는 세션에서 가져와야 함
        line_items: validatedData.lineItems,
        total_amount: validatedData.totalAmount,
        valid_until: validatedData.validUntil || null,
        status: 'pending',
      })
      .select()
      .single();

    if (quoteError) {
      return NextResponse.json(
        { success: false, error: quoteError.message },
        { status: 500 }
      );
    }

    // 견적 템플릿 저장 (자동완성용)
    const { error: templateError } = await supabase.from('quote_templates').insert({
      vendor_id: 'temp-vendor-id', // TODO: 실제로는 세션에서 가져와야 함
      line_items: validatedData.lineItems,
    });

    if (templateError) {
      console.error('템플릿 저장 실패:', templateError);
      // 템플릿 저장 실패해도 견적은 생성됨
    }

    return NextResponse.json({
      success: true,
      quote: {
        id: quoteData.id,
        status: quoteData.status,
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


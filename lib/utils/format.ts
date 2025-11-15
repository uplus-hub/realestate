/**
 * 숫자를 천 단위 콤마로 포맷팅합니다.
 * @param num 숫자
 * @returns 포맷팅된 문자열
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 금액을 원화 형식으로 포맷팅합니다.
 * @param amount 금액
 * @returns 포맷팅된 문자열 (예: "1,000,000원")
 */
export function formatCurrency(amount: number): string {
  return `${formatNumber(amount)}원`;
}

/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 문자열 (예: "2024년 1월 1일")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅합니다.
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 문자열 (예: "2024년 1월 1일 오후 3시 30분")
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
}

/**
 * 면적을 포맷팅합니다.
 * @param value 면적 값
 * @param unit 단위 ('평' 또는 '㎡')
 * @returns 포맷팅된 문자열 (예: "33㎡")
 */
export function formatArea(value: number, unit: '평' | '㎡'): string {
  return `${formatNumber(value)}${unit}`;
}

/**
 * 남은 시간을 포맷팅합니다.
 * @param deadline 마감 시간
 * @returns 포맷팅된 문자열 (예: "2시간 30분 남음")
 */
export function formatTimeRemaining(deadline: string | Date): string {
  const now = new Date();
  const end = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return '마감됨';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  } else {
    return `${minutes}분 남음`;
  }
}


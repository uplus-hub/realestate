'use client';

import { useEffect, useState } from 'react';
import { formatTimeRemaining } from '@/lib/utils/format';

interface SLATimerProps {
  deadline: string | Date;
  targetCount?: number;
  currentCount?: number;
}

export default function SLATimer({
  deadline,
  targetCount = 2,
  currentCount = 0,
}: SLATimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = typeof deadline === 'string' ? new Date(deadline) : deadline;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('마감됨');
        return;
      }

      setIsExpired(false);
      setTimeRemaining(formatTimeRemaining(deadline));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [deadline]);

  const isMet = currentCount >= targetCount;

  return (
    <div
      className={`
        p-4 rounded-lg border-2
        ${
          isExpired
            ? 'bg-red-50 border-red-200'
            : isMet
            ? 'bg-green-50 border-green-200'
            : 'bg-indigo-50 border-indigo-200'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">
            24시간 내 {targetCount}건 이상 견적 보장
          </p>
          <p className="text-xs text-gray-600 mt-1">
            현재 {currentCount}건 수신 ({isMet ? '목표 달성' : `${targetCount - currentCount}건 남음`})
          </p>
        </div>
        <div className="text-right">
          <div
            className={`
              text-2xl font-bold
              ${isExpired ? 'text-red-600' : isMet ? 'text-green-600' : 'text-indigo-600'}
            `}
          >
            {timeRemaining}
          </div>
        </div>
      </div>
    </div>
  );
}


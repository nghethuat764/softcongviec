import React, { useEffect, useState, useRef } from 'react';

export interface CountUpNumberProps {
  /** Giá trị số cần hiển thị */
  value: number | null | undefined;
  /** Thời gian chạy hiệu ứng (ms), mặc định 1400ms (trong khoảng 1200 - 1800ms) */
  duration?: number;
  /** Số chữ số sau dấu phẩy thập phân */
  decimals?: number;
  /** Tiền tố hiển thị trước số (ví dụ: "$", "+") */
  prefix?: string;
  /** Hậu tố hiển thị sau số (ví dụ: "%", " việc", " cán bộ") */
  suffix?: string;
  /** Ký tự phân cách hàng nghìn (chuẩn Việt Nam mặc định là dấu chấm ".") */
  thousandSeparator?: string;
  /** Ký tự phân cách phần thập phân (chuẩn Việt Nam mặc định là dấu phẩy ",") */
  decimalSeparator?: string;
  /** Class CSS bổ sung */
  className?: string;
  /** Trạng thái đang tải dữ liệu */
  isLoading?: boolean;
  /** Tùy chọn hàm định dạng số tùy chỉnh */
  formatter?: (val: number) => string;
}

/**
 * Hàm làm mịn chuyển động (Easing function: easeOutCubic)
 * Tăng tốc ban đầu và giảm tốc mượt mà tự nhiên khi về đích.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Định dạng số với phân cách hàng nghìn và thập phân chuẩn Việt Nam
 */
function formatValue(
  val: number,
  decimals: number,
  thousandSep: string,
  decimalSep: string
): string {
  if (!isFinite(val) || isNaN(val)) return '0';

  const fixed = val.toFixed(decimals);
  const parts = fixed.split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Thêm phân cách hàng nghìn vào phần nguyên
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

  if (decimals > 0 && decPart !== undefined) {
    return `${formattedInt}${decimalSep}${decPart}`;
  }
  return formattedInt;
}

/**
 * Component CountUpNumber:
 * Hiển thị số liệu thống kê với hiệu ứng đếm số tăng dần mượt mà từ 0 đến giá trị thực.
 * Tự động chạy lại khi tải lại trang hoặc khi giá trị thực tế thay đổi.
 * Tối ưu hiệu năng, chống giật rung giao diện với font tabular-nums.
 */
export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  thousandSeparator = '.',
  decimalSeparator = ',',
  className = '',
  isLoading = false,
  formatter,
}) => {
  const targetNumber = typeof value === 'number' && !isNaN(value) ? value : null;
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number | null>(null);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    // Nếu đang loading hoặc chưa có dữ liệu hợp lệ, tạm hoãn animation
    if (isLoading || targetNumber === null) {
      return;
    }

    // Nếu không phải lần mount đầu và giá trị không đổi, không chạy lại
    if (!isFirstMountRef.current && prevTargetRef.current === targetNumber) {
      return;
    }

    // Lần đầu tải trang -> luôn bắt đầu đếm sinh động từ 0 đến số thực tế
    // Khi giá trị cập nhật sau đó -> đếm từ số cũ sang số mới
    const startVal = isFirstMountRef.current ? 0 : (prevTargetRef.current ?? 0);
    const endVal = targetNumber;
    prevTargetRef.current = targetNumber;
    isFirstMountRef.current = false;
    startTimeRef.current = null;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const animDuration = Math.max(duration, 300);

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animDuration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentVal = startVal + (endVal - startVal) * easedProgress;
      setDisplayNumber(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayNumber(endVal);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetNumber, isLoading, duration]);

  // Xử lý hiển thị an toàn khi dữ liệu chưa có
  if (isLoading) {
    return <span className={className}>...</span>;
  }

  if (targetNumber === null) {
    return <span className={className}>—</span>;
  }

  const formattedStr = formatter
    ? formatter(displayNumber)
    : formatValue(displayNumber, decimals, thousandSeparator, decimalSeparator);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {prefix}
      {formattedStr}
      {suffix}
    </span>
  );
};

export default CountUpNumber;

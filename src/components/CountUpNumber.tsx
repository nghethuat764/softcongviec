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
 * Mang lại chuyển động mượt mà, giảm tốc dần tự nhiên về cuối.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Định dạng số với phân cách hàng nghìn và thập phân chuẩn
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
 * Tôn trọng prefers-reduced-motion, chỉ đếm khi dữ liệu đã sẵn sàng, tránh re-render liên tục.
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
  // Kiểm tra prefers-reduced-motion
  const prefersReducedMotion = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Giá trị số đích thực tế
  const targetNumber = typeof value === 'number' && !isNaN(value) ? value : null;

  // State hiển thị số hiện tại
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  const startNumberRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef<boolean>(false);
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    // Nếu đang loading hoặc chưa có dữ liệu hợp lệ, không chạy animation
    if (isLoading || targetNumber === null) {
      return;
    }

    // Nếu người dùng bật giảm chuyển động, nhảy ngay đến giá trị đích
    if (prefersReducedMotion.current) {
      setDisplayNumber(targetNumber);
      prevTargetRef.current = targetNumber;
      return;
    }

    // Nếu giá trị không đổi sau lần đếm đầu tiên, giữ nguyên không reset
    if (hasAnimatedRef.current && prevTargetRef.current === targetNumber) {
      return;
    }

    // Xác định điểm bắt đầu đếm:
    // Lần đầu tải trang -> đếm từ 0
    // Nếu giá trị cập nhật sau đó -> đếm từ giá trị hiện tại lên/xuống giá trị mới
    const fromVal = hasAnimatedRef.current ? (prevTargetRef.current ?? 0) : 0;
    const toVal = targetNumber;
    startNumberRef.current = fromVal;
    prevTargetRef.current = toVal;
    startTimeRef.current = null;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);
      const easedProgress = easeOutCubic(progress);

      const currentVal = fromVal + (toVal - fromVal) * easedProgress;
      setDisplayNumber(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayNumber(toVal);
        hasAnimatedRef.current = true;
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
    <span className={className}>
      {prefix}
      {formattedStr}
      {suffix}
    </span>
  );
};

export default CountUpNumber;

import React from 'react';

interface LogoTTDVTHProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const LogoTTDVTH: React.FC<LogoTTDVTHProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <span className={`relative inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/logo_ttdvth.svg"
        alt="Logo Trung Tâm Dịch Vụ Tổng Hợp Phường Hố Nai"
        style={sizeStyle}
        className="w-full h-full object-contain rounded-full shadow-xs shrink-0 select-none"
        loading="eager"
        referrerPolicy="no-referrer"
      />
      {showText && (
        <span className="flex flex-col text-left leading-tight">
          <span className="font-extrabold uppercase tracking-wide text-xs text-red-950">
            TRUNG TÂM DỊCH VỤ TỔNG HỢP
          </span>
          <span className="font-bold uppercase tracking-wider text-2xs text-blue-900">
            PHƯỜNG HỐ NAI
          </span>
        </span>
      )}
    </span>
  );
};

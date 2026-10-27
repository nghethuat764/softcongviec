import React, { useState, useEffect } from 'react';
import { Palette, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_PRIMARY_COLOR } from '../context/ThemeContext';

interface ThemeColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
  onSelectColor: (color: string) => void;
  onResetColor: () => void;
}

export const PRESET_COLORS = [
  { hex: '#003366', name: 'Xanh Hải Quân', desc: 'Mặc định Chính quyền' },
  { hex: '#064E3B', name: 'Xanh Ngọc / Bích', desc: 'Điều hành Cao cấp' },
  { hex: '#1E40AF', name: 'Xanh Hoàng Gia', desc: 'Doanh nghiệp SaaS' },
  { hex: '#1E293B', name: 'Xám Mực Đô Thị', desc: 'Chuyên nghiệp Hiện đại' },
  { hex: '#581C87', name: 'Tím Hoàng Gia', desc: 'Sáng tạo Nổi bật' },
  { hex: '#991B1B', name: 'Đỏ Đô / Quốc Cờ', desc: 'Trang trọng Quyết liệt' },
  { hex: '#78350F', name: 'Nâu Đồng Hổ Phách', desc: 'Ấm áp Cổ điển' },
  { hex: '#0284C7', name: 'Xanh Biển Tươi', desc: 'Tươi sáng Công nghệ' },
];

export const ThemeColorPickerModal: React.FC<ThemeColorPickerModalProps> = ({
  isOpen,
  onClose,
  primaryColor,
  onSelectColor,
  onResetColor,
}) => {
  const [inputHex, setInputHex] = useState(primaryColor);
  const [isValidHex, setIsValidHex] = useState(true);

  useEffect(() => {
    setInputHex(primaryColor);
  }, [primaryColor]);

  if (!isOpen) return null;

  const handleHexInputChange = (value: string) => {
    setInputHex(value);
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (hexRegex.test(value)) {
      setIsValidHex(true);
      onSelectColor(value);
    } else {
      setIsValidHex(false);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputHex(newColor);
    setIsValidHex(true);
    onSelectColor(newColor);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111c35] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                TÙY CHỈNH MÀU SẮC GIAO DIỆN
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Chọn tông màu chủ đạo hệ thống (Lưu tự động vào LocalStorage)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Palettes Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            1. Bảng màu chủ đạo đề xuất:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_COLORS.map((preset) => {
              const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    setInputHex(preset.hex);
                    setIsValidHex(true);
                    onSelectColor(preset.hex);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-400 dark:border-slate-500 ring-2 ring-blue-500/20 shadow-xs' 
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs border border-white/20"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs block text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {preset.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      {preset.hex}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color Picker & Native Input */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            2. Tùy chọn mã màu HEX cá nhân:
          </label>
          <div className="flex items-center gap-2.5">
            {/* Color Swatch Trigger Native Picker */}
            <div className="relative shrink-0">
              <input
                type="color"
                value={isValidHex ? inputHex : DEFAULT_PRIMARY_COLOR}
                onChange={handleNativeColorChange}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden bg-transparent shadow-xs"
                title="Mở bảng chọn màu chi tiết"
              />
            </div>

            {/* Text Input for HEX string */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputHex}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#003366"
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none transition-colors ${
                  isValidHex 
                    ? 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500' 
                    : 'border-red-400 text-red-600 dark:text-red-400 focus:ring-1 focus:ring-red-500'
                }`}
              />
            </div>
          </div>
          {!isValidHex && (
            <p className="text-[11px] text-red-500 font-medium mt-1">
              Mã màu không hợp lệ! Vui lòng nhập định dạng chuẩn #RRGGBB (ví dụ: #003366).
            </p>
          )}
        </div>

        {/* Live Preview Sample */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Xem trước giao diện mẫu:
          </span>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Nút chính
            </button>
            <span 
              className="px-2.5 py-1 rounded-md text-xs font-semibold border"
              style={{ 
                backgroundColor: `${primaryColor}15`, 
                color: primaryColor, 
                borderColor: `${primaryColor}40` 
              }}
            >
              Hành chính công
            </span>
            <span className="font-mono text-xs font-bold" style={{ color: primaryColor }}>
              #ThemeColor
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              onResetColor();
              setInputHex(DEFAULT_PRIMARY_COLOR);
              setIsValidHex(true);
            }}
            className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-medium transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định (#003366)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white font-bold transition-all shadow-xs cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            Lưu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

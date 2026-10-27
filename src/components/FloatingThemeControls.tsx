import React, { useState } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeColorPickerModal } from './ThemeColorPickerModal';

export const FloatingThemeControls: React.FC = () => {
  const { isDark, toggleTheme, primaryColor, setPrimaryColor, resetPrimaryColor } = useTheme();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  return (
    <>
      {/* Floating Action Controls Widget - Fixed Viewport Position */}
      <div 
        className="fixed bottom-20 right-5 z-40 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200"
        aria-label="Tùy chỉnh giao diện trôi nổi"
      >
        {/* 1. Floating Dark / Light Theme Toggle Button (ICON ONLY) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95 border ${
            isDark
              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:border-amber-400/50'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* 2. Floating Theme Primary Color Picker Button (ICON ONLY) */}
        <button
          type="button"
          onClick={() => setIsColorPickerOpen(true)}
          title={`Tùy chỉnh màu sắc giao diện (Hiện tại: ${primaryColor})`}
          className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95 relative group"
        >
          <Palette className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: primaryColor }} />
          <span 
            className="w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 absolute -top-0.5 -right-0.5 shadow-2xs" 
            style={{ backgroundColor: primaryColor }}
          />
        </button>
      </div>

      {/* Theme Color Customizer Modal */}
      <ThemeColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        primaryColor={primaryColor}
        onSelectColor={setPrimaryColor}
        onResetColor={resetPrimaryColor}
      />
    </>
  );
};

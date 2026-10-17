import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Check, RefreshCw, Eye, Sparkles, Sliders } from 'lucide-react';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgImage: string;
  onUpdateBgImage: (url: string) => void;
  bgOpacity: number;
  onUpdateBgOpacity: (opacity: number) => void;
  bgBlur: string;
  onUpdateBgBlur: (blur: string) => void;
}

const PRESET_BACKGROUNDS = [
  {
    id: 'gov_official',
    title: 'Trung tâm Hành chính công (Mặc định)',
    subtitle: 'Hình ảnh trụ sở cơ quan hành chính & phục vụ công',
    url: '/management_bg.jpg',
  },
];

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBgImage,
  onUpdateBgImage,
  bgOpacity,
  onUpdateBgOpacity,
  bgBlur,
  onUpdateBgBlur,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn định dạng file hình ảnh (PNG, JPG, WEBP, SVG).');
      return;
    }

    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Kích thước ảnh vượt quá 8MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onUpdateBgImage(dataUrl);
      }
    };
    reader.onerror = () => {
      setUploadError('Có lỗi khi đọc file ảnh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#003366] px-5 py-4 text-white flex items-center justify-between border-b border-[#002244]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <ImageIcon className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-[15px] sm:text-base font-bold text-white">
                Cài Đặt Hình Nền Cho Trang Quản Lý
              </h2>
              <p className="text-[12px] text-blue-200 font-medium">
                Áp dụng cho Phân hệ Lãnh đạo & Các màn hình Quản lý
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-[13px] max-h-[80vh] overflow-y-auto bg-[#F4F6F9]">
          
          {/* Current Background Preview Card */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[13px]">
                <Eye className="w-4 h-4 text-[#003366]" />
                Xem trước hình nền hiện tại:
              </span>
              <span className="text-[11px] font-mono bg-blue-50 text-[#003366] px-2 py-0.5 rounded border border-blue-200 font-semibold">
                {currentBgImage ? 'Đang kích hoạt' : 'Nền phẳng chuẩn'}
              </span>
            </div>

            <div 
              className="w-full h-36 rounded-[8px] border border-slate-200 overflow-hidden relative shadow-inner bg-slate-100 flex items-center justify-center"
              style={{
                backgroundImage: currentBgImage ? `url(${currentBgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: bgBlur === 'sm' ? 'blur(2px)' : bgBlur === 'md' ? 'blur(4px)' : 'none',
              }}
            >
              {/* Simulated overlay */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center"
                style={{
                  backgroundColor: currentBgImage ? `rgba(244, 246, 249, ${bgOpacity})` : '#F4F6F9',
                }}
              >
                <div className="bg-white/95 px-3 py-1.5 rounded-md shadow-xs border border-slate-200 text-center">
                  <div className="font-bold text-[#003366] text-[13px]">TRANG QUẢN LÝ ĐIỀU HÀNH</div>
                  <div className="text-[11px] text-slate-500">Mô phỏng hiển thị chữ và nội dung bảng việc</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Custom File from Device */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[13px]">
                <Upload className="w-4 h-4 text-emerald-600" />
                Tải ảnh từ máy tính của bạn:
              </span>
              <span className="text-[11px] text-slate-500">PNG, JPG, WEBP, SVG</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[8px] p-4 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-[#003366] bg-blue-50'
                  : 'border-slate-300 hover:border-[#003366] bg-slate-50/60'
              }`}
            >
              <input
                type="file"
                id="bg-file-upload-input"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="bg-file-upload-input" className="cursor-pointer block">
                <Upload className="w-7 h-7 text-[#003366] mx-auto mb-1.5" />
                <span className="font-semibold text-[#003366] hover:underline block text-[13px]">
                  Bấm vào đây để chọn file ảnh đính kèm từ máy tính
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  hoặc kéo thả file ảnh trực tiếp vào khung này
                </span>
              </label>
            </div>

            {uploadError && (
              <p className="text-[12px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {uploadError}
              </p>
            )}
          </div>

          {/* Preset Administrative Backgrounds */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[13px]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Ảnh trụ sở công vụ chuẩn Quốc gia (Khuyến nghị):
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_BACKGROUNDS.map((preset) => {
                const isSelected = currentBgImage === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onUpdateBgImage(preset.url)}
                    className={`flex items-center gap-3 p-2.5 rounded-[8px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#003366] bg-blue-50/80 shadow-xs ring-1 ring-[#003366]'
                        : 'border-[#E5E7EB] hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div 
                      className="w-16 h-12 rounded-[6px] bg-cover bg-center shrink-0 border border-slate-200 shadow-2xs"
                      style={{ backgroundImage: `url(${preset.url})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#111827] text-[13px] flex items-center gap-1.5">
                        <span className="truncate">{preset.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#003366] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {preset.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adjustments: Opacity & Blur */}
          <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs space-y-3">
            <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[13px]">
              <Sliders className="w-4 h-4 text-[#003366]" />
              Tinh chỉnh độ hiển thị & độ trong suốt:
            </span>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-600">Độ che phủ màu nền công vụ (Lớp phủ đọc văn bản):</span>
                <span className="font-mono font-bold text-[#003366]">{Math.round(bgOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.98"
                step="0.02"
                value={bgOpacity}
                onChange={(e) => onUpdateBgOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#003366] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Rõ hình nền hơn (60%)</span>
                <span>Chuẩn tài liệu (90%)</span>
                <span>Tối giản (98%)</span>
              </div>
            </div>

            {/* Blur Options */}
            <div className="pt-2 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Hiệu ứng mờ nền (Blur):</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'none', label: 'Sắc nét' },
                  { id: 'sm', label: 'Mờ nhẹ' },
                  { id: 'md', label: 'Mờ vừa' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onUpdateBgBlur(b.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                      bgBlur === b.id
                        ? 'bg-[#003366] text-white border-[#003366]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3.5 border-t border-[#E5E7EB] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onUpdateBgImage('/management_bg.jpg');
              onUpdateBgOpacity(0.90);
              onUpdateBgBlur('none');
            }}
            className="text-[12px] text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer shadow-xs"
          >
            Hoàn Tất & Áp Dụng
          </button>
        </div>

      </div>
    </div>
  );
};

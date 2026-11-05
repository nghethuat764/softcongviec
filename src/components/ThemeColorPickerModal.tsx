import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography, Space, Tag, Divider, Row, Col, Card } from 'antd';
import { Palette, Check, RotateCcw, X } from 'lucide-react';
import { DEFAULT_PRIMARY_COLOR } from '../context/ThemeContext';

const { Text, Title } = Typography;

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
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Palette size={18} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>TÙY CHỈNH MÀU SẮC GIAO DIỆN</Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Tự động áp dụng Ant Design Design Tokens & CSS Variables
            </Text>
          </div>
        </div>
      }
    >
      <div style={{ marginTop: 16 }}>
        {/* Preset Colors Grid */}
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          1. Bảng màu chủ đạo đề xuất:
        </Text>
        <Row gutter={[8, 8]}>
          {PRESET_COLORS.map((preset) => {
            const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <Col span={12} key={preset.hex}>
                <div
                  onClick={() => {
                    setInputHex(preset.hex);
                    setIsValidHex(true);
                    onSelectColor(preset.hex);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? primaryColor : '#e2e8f0'}`,
                    backgroundColor: isSelected ? `${primaryColor}10` : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: preset.hex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <Text strong style={{ fontSize: 12, display: 'block', lineHeight: '1.2' }} ellipsis>
                      {preset.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>
                      {preset.hex}
                    </Text>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        <Divider style={{ margin: '16px 0 12px' }} />

        {/* Custom Hex Color Picker */}
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          2. Tùy chọn mã màu HEX cá nhân:
        </Text>
        <Space style={{ width: '100%' }} align="center">
          <input
            type="color"
            value={isValidHex ? inputHex : DEFAULT_PRIMARY_COLOR}
            onChange={handleNativeColorChange}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              backgroundColor: 'transparent'
            }}
            title="Mở bảng chọn màu"
          />
          <Input
            value={inputHex}
            onChange={(e) => handleHexInputChange(e.target.value)}
            placeholder="#003366"
            status={isValidHex ? '' : 'error'}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Space>
        {!isValidHex && (
          <Text type="danger" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
            Mã màu không hợp lệ! Vui lòng nhập định dạng chuẩn #RRGGBB.
          </Text>
        )}

        {/* Preview Card */}
        <Card size="small" style={{ marginTop: 12, backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}30` }}>
          <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Xem trước Ant Design Components:
          </Text>
          <Space wrap>
            <Button type="primary" size="small" style={{ backgroundColor: primaryColor }}>
              Nút AntD Primary
            </Button>
            <Tag color={primaryColor} style={{ fontWeight: 600 }}>
              AntD Tag Label
            </Tag>
            <Text code style={{ color: primaryColor, fontWeight: 'bold' }}>
              {primaryColor}
            </Text>
          </Space>
        </Card>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <Button
            type="text"
            icon={<RotateCcw size={14} />}
            onClick={() => {
              onResetColor();
              setInputHex(DEFAULT_PRIMARY_COLOR);
              setIsValidHex(true);
            }}
            style={{ fontSize: 12 }}
          >
            Mặc định (#003366)
          </Button>
          <Button
            type="primary"
            onClick={onClose}
            style={{ backgroundColor: primaryColor, borderRadius: 8, fontWeight: 700 }}
          >
            Lưu & Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

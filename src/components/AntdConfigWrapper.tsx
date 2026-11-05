import React from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useTheme } from '../context/ThemeContext';

export const AntdConfigWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, primaryColor } = useTheme();

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor || '#003366',
          borderRadius: 8,
          fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 13,
          colorBgContainer: isDark ? '#131c31' : '#ffffff',
          colorBgElevated: isDark ? '#1a253e' : '#ffffff',
          colorBgLayout: isDark ? '#0b1120' : '#f8fafc',
          colorTextHeading: isDark ? '#f8fafc' : '#0f172a',
          colorText: isDark ? '#e2e8f0' : '#334155',
          colorBorder: isDark ? '#1e293b' : '#e2e8f0',
          colorBorderSecondary: isDark ? '#334155' : '#f1f5f9',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        },
        components: {
          Button: {
            fontWeight: 600,
            borderRadius: 8,
            controlHeight: 36,
            controlHeightLG: 42,
            controlHeightSM: 30,
          },
          Card: {
            borderRadiusLG: 12,
            paddingLG: 20,
            boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
          },
          Modal: {
            borderRadiusLG: 16,
            contentBg: isDark ? '#131c31' : '#ffffff',
            headerBg: isDark ? '#131c31' : '#ffffff',
          },
          Table: {
            borderRadius: 10,
            headerBg: isDark ? '#1e293b' : '#f8fafc',
            headerColor: isDark ? '#f8fafc' : '#0f172a',
            rowHoverBg: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(239, 246, 255, 0.5)',
          },
          Tag: {
            borderRadiusSM: 6,
          },
          Badge: {
            fontSize: 11,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Tabs: {
            itemSelectedColor: primaryColor || '#003366',
            inkBarColor: primaryColor || '#003366',
            itemHoverColor: primaryColor || '#003366',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

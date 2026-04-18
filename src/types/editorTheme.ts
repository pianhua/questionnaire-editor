// 编辑器主题类型定义

// 编辑器主题接口
export interface EditorTheme {
  id: string;
  name: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    divider: string;
  };
  typography: {
    fontFamily: string;
  };
  shape: {
    borderRadius: number;
  };
}

// 预设主题模板
export const editorThemePresets: EditorTheme[] = [
  {
    id: 'default',
    name: '默认主题',
    palette: {
      primary: '#6366F1',
      secondary: '#10B981',
      background: '#F8FAFC',
      text: '#1E293B',
      divider: '#E2E8F0',
    },
    typography: {
      fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  },
  {
    id: 'dark',
    name: '深色主题',
    palette: {
      primary: '#818CF8',
      secondary: '#34D399',
      background: '#1E293B',
      text: '#F8FAFC',
      divider: '#334155',
    },
    typography: {
      fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  },
  {
    id: 'blue',
    name: '蓝色主题',
    palette: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      background: '#EFF6FF',
      text: '#1E40AF',
      divider: '#BFDBFE',
    },
    typography: {
      fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  },
  {
    id: 'green',
    name: '绿色主题',
    palette: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#ECFDF5',
      text: '#065F46',
      divider: '#A7F3D0',
    },
    typography: {
      fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  },
  {
    id: 'purple',
    name: '紫色主题',
    palette: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#F5F3FF',
      text: '#5B21B6',
      divider: '#C4B5FD',
    },
    typography: {
      fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  },
];

// 默认主题
export const defaultEditorTheme: EditorTheme = editorThemePresets[0];

// 字体选项
export const fontOptions = [
  { value: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif', label: '默认字体' },
  { value: '"Roboto", "PingFang SC", "Microsoft YaHei", sans-serif', label: 'Roboto' },
  { value: '"Arial", "PingFang SC", "Microsoft YaHei", sans-serif', label: 'Arial' },
  { value: '"Helvetica", "PingFang SC", "Microsoft YaHei", sans-serif', label: 'Helvetica' },
  { value: '"Georgia", "PingFang SC", "Microsoft YaHei", serif', label: 'Georgia' },
  { value: '"Times New Roman", "PingFang SC", "Microsoft YaHei", serif', label: 'Times New Roman' },
];
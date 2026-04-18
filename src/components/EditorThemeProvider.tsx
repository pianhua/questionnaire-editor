import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { EditorTheme, defaultEditorTheme } from '../types/editorTheme';

interface EditorThemeContextType {
  currentTheme: EditorTheme;
  setTheme: (theme: EditorTheme) => void;
}

const EditorThemeContext = createContext<EditorThemeContextType | undefined>(undefined);

export const useEditorTheme = (): EditorThemeContextType => {
  const context = useContext(EditorThemeContext);
  if (!context) {
    throw new Error('useEditorTheme must be used within an EditorThemeProvider');
  }
  return context;
};

interface EditorThemeProviderProps {
  children: ReactNode;
}

export const EditorThemeProvider: React.FC<EditorThemeProviderProps> = ({ children }) => {
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(defaultEditorTheme);

  // 从本地存储加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('editorTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setEditorTheme(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // 保存主题到本地存储
  useEffect(() => {
    localStorage.setItem('editorTheme', JSON.stringify(editorTheme));
  }, [editorTheme]);

  // 将EditorTheme转换为Material-UI Theme
  const muiTheme: Theme = createTheme({
    palette: {
      primary: {
        main: editorTheme.palette.primary,
      },
      secondary: {
        main: editorTheme.palette.secondary,
      },
      background: {
        default: editorTheme.palette.background,
      },
      text: {
        primary: editorTheme.palette.text,
      },
      divider: editorTheme.palette.divider,
    },
    typography: {
      fontFamily: editorTheme.typography.fontFamily,
    },
    shape: {
      borderRadius: editorTheme.shape.borderRadius,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: editorTheme.shape.borderRadius,
            padding: '10px 20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          contained: {
            boxShadow: `0 4px 14px 0 rgba(${hexToRgb(editorTheme.palette.primary)}, 0.39)`,
            '&:hover': {
              boxShadow: `0 6px 20px 0 rgba(${hexToRgb(editorTheme.palette.primary)}, 0.5)`,
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              backgroundColor: `rgba(${hexToRgb(editorTheme.palette.primary)}, 0.08)`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: editorTheme.shape.borderRadius * 1.33,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: editorTheme.shape.borderRadius * 1.33,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: editorTheme.shape.borderRadius * 0.67,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: editorTheme.shape.borderRadius,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: `0 2px 8px rgba(${hexToRgb(editorTheme.palette.primary)}, 0.15)`,
              },
              '&.Mui-focused': {
                boxShadow: `0 4px 12px rgba(${hexToRgb(editorTheme.palette.primary)}, 0.25)`,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: editorTheme.shape.borderRadius * 1.67,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: `linear-gradient(135deg, ${editorTheme.palette.primary} 0%, ${darkenColor(editorTheme.palette.primary, 0.1)} 100%)`,
            boxShadow: `0 4px 20px rgba(${hexToRgb(editorTheme.palette.primary)}, 0.3)`,
          },
        },
      },
    },
  });

  return (
    <EditorThemeContext.Provider value={{ currentTheme: editorTheme, setTheme: setEditorTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </EditorThemeContext.Provider>
  );
};

// 辅助函数：将十六进制颜色转换为RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}

// 辅助函数：使颜色变暗
function darkenColor(hex: string, amount: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
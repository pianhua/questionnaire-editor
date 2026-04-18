import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Grid,
  Divider,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Palette as PaletteIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { EditorTheme, editorThemePresets, fontOptions } from '../types/editorTheme';

interface EditorThemeCustomizerProps {
  currentTheme: EditorTheme;
  onThemeChange: (theme: EditorTheme) => void;
}

const EditorThemeCustomizer: React.FC<EditorThemeCustomizerProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [theme, setTheme] = useState<EditorTheme>(currentTheme);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (updates: Partial<EditorTheme>) => {
    const updatedTheme = { ...theme, ...updates };
    setTheme(updatedTheme);
    onThemeChange(updatedTheme);
  };

  const handleColorChange = (colorType: keyof EditorTheme['palette'], value: string) => {
    handleThemeChange({
      palette: {
        ...theme.palette,
        [colorType]: value,
      },
    });
  };

  const handleFontChange = (fontFamily: string) => {
    handleThemeChange({
      typography: {
        ...theme.typography,
        fontFamily,
      },
    });
  };

  const handleBorderRadiusChange = (value: number) => {
    handleThemeChange({
      shape: {
        borderRadius: value,
      },
    });
  };

  const handleApplyPreset = (preset: EditorTheme) => {
    setTheme(preset);
    onThemeChange(preset);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <SettingsIcon color="primary" />
        <Typography variant="h6">编辑器主题设置</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            颜色设置
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              主题色
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="color"
                value={theme.palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={theme.palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              辅助色
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="color"
                value={theme.palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={theme.palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              背景色
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="color"
                value={theme.palette.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={theme.palette.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              文字颜色
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="color"
                value={theme.palette.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={theme.palette.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              边框颜色
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="color"
                value={theme.palette.divider}
                onChange={(e) => handleColorChange('divider', e.target.value)}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={theme.palette.divider}
                onChange={(e) => handleColorChange('divider', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            预设主题
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1}>
            {editorThemePresets.map((preset) => (
              <Grid item xs={6} key={preset.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                    backgroundColor: preset.palette.background,
                    color: preset.palette.text,
                  }}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box display="flex" gap={0.5} mb={1}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          backgroundColor: preset.palette.primary,
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          backgroundColor: preset.palette.secondary,
                        }}
                      />
                    </Box>
                    <Typography variant="caption">{preset.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            字体设置
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TextField
            select
            label="选择字体"
            value={theme.typography.fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
            sx={{ mb: 3 }}
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </TextField>

          <Typography variant="subtitle1" gutterBottom>
            外观设置
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box mb={3}>
            <Typography variant="body2" gutterBottom>
              圆角大小
            </Typography>
            <TextField
              type="number"
              value={theme.shape.borderRadius}
              onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value) || 0)}
              size="small"
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 24 } }}
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            预览效果
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              backgroundColor: theme.palette.background,
              color: theme.palette.text,
              padding: '20px',
              borderRadius: theme.shape.borderRadius,
              minHeight: '200px',
              border: `1px solid ${theme.palette.divider}`,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.palette.primary, mb: 2, fontFamily: theme.typography.fontFamily }}
            >
              编辑器主题预览
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text, mb: 2, fontFamily: theme.typography.fontFamily }}
            >
              这是一个主题预览示例，展示当前主题的视觉效果。
            </Typography>
            <Box
              sx={{
                backgroundColor: theme.palette.primary,
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: theme.shape.borderRadius / 2,
                display: 'inline-block',
                fontFamily: theme.typography.fontFamily,
              }}
            >
              按钮示例
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            以上预览仅供参考，实际效果可能略有不同
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EditorThemeCustomizer;
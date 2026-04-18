import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateTheme } from '../redux/questionnaireSlice';
import { Theme } from '../types/questionnaire';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';

const fontOptions = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
];

const colorPresets = [
  { primary: '#4285F4', secondary: '#34A853', name: '蓝色科技' },
  { primary: '#EA4335', secondary: '#FBBC04', name: '红色活力' },
  { primary: '#34A853', secondary: '#4285F4', name: '绿色清新' },
  { primary: '#9C27B0', secondary: '#E91E63', name: '紫色浪漫' },
  { primary: '#FF5722', secondary: '#FFC107', name: '橙色活力' },
  { primary: '#607D8B', secondary: '#455A64', name: '灰色专业' },
];

const ThemeCustomizer: React.FC = () => {
  const dispatch = useDispatch();
  const { questionnaires, currentQuestionnaireId } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const currentQuestionnaire = questionnaires.find((q) => q.id === currentQuestionnaireId);

  if (!currentQuestionnaire) {
    return null;
  }

  const currentTheme = currentQuestionnaire.theme;

  const handleThemeChange = (updates: Partial<Theme>) => {
    dispatch(updateTheme({ ...currentTheme, ...updates }));
  };

  const handleApplyPreset = (preset: typeof colorPresets[0]) => {
    handleThemeChange({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    });
  };

  const previewStyles = {
    backgroundColor: currentTheme.backgroundColor,
    color: currentTheme.textColor,
    fontFamily: currentTheme.font,
    padding: '20px',
    borderRadius: '8px',
    minHeight: '200px',
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <PaletteIcon color="primary" />
        <Typography variant="h6">主题定制</Typography>
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
                value={currentTheme.primaryColor}
                onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={currentTheme.primaryColor}
                onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
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
                value={currentTheme.secondaryColor}
                onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={currentTheme.secondaryColor}
                onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
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
                value={currentTheme.backgroundColor}
                onChange={(e) => handleThemeChange({ backgroundColor: e.target.value })}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={currentTheme.backgroundColor}
                onChange={(e) => handleThemeChange({ backgroundColor: e.target.value })}
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
                value={currentTheme.textColor}
                onChange={(e) => handleThemeChange({ textColor: e.target.value })}
                sx={{ width: 100, height: 50 }}
              />
              <TextField
                value={currentTheme.textColor}
                onChange={(e) => handleThemeChange({ textColor: e.target.value })}
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
            {colorPresets.map((preset, index) => (
              <Grid item xs={6} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box display="flex" gap={0.5}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          backgroundColor: preset.primary,
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '4px',
                          backgroundColor: preset.secondary,
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
            value={currentTheme.font}
            onChange={(e) => handleThemeChange({ font: e.target.value })}
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
            预览效果
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ ...previewStyles, border: '1px solid #e0e0e0' }}>
            <Typography
              variant="h5"
              sx={{ color: currentTheme.primaryColor, mb: 2, fontFamily: currentTheme.font }}
            >
              {currentQuestionnaire.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: currentTheme.textColor, mb: 2, fontFamily: currentTheme.font }}
            >
              {currentQuestionnaire.description || '问卷描述将显示在这里'}
            </Typography>
            <Box
              sx={{
                backgroundColor: currentTheme.primaryColor,
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                display: 'inline-block',
                fontFamily: currentTheme.font,
              }}
            >
              问题示例
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

export default ThemeCustomizer;

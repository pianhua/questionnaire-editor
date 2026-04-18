import React from 'react';
import { QuestionType } from '../types/questionnaire';
import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  TextFields as TextIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckboxIcon,
  GridOn as MatrixIcon,
  Sort as RankingIcon,
  CloudUpload as UploadIcon,
  Star as RatingIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
}

// 移到组件外部，避免每次渲染时重新创建
const typeConfig: Array<{
  type: QuestionType;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}> = [
  { type: QuestionType.TEXT, label: '文本题', icon: TextIcon, description: '简短文本或段落回答', color: '#6366F1' },
  { type: QuestionType.SINGLE_CHOICE, label: '单选题', icon: RadioIcon, description: '从多个选项中选择一个', color: '#10B981' },
  { type: QuestionType.MULTIPLE_CHOICE, label: '多选题', icon: CheckboxIcon, description: '从多个选项中选择多个', color: '#F59E0B' },
  { type: QuestionType.MATRIX, label: '矩阵题', icon: MatrixIcon, description: '行列矩阵选择题', color: '#EC4899' },
  { type: QuestionType.RANKING, label: '排序题', icon: RankingIcon, description: '对选项进行排序', color: '#8B5CF6' },
  { type: QuestionType.FILE_UPLOAD, label: '文件上传', icon: UploadIcon, description: '上传文件或图片', color: '#14B8A6' },
  { type: QuestionType.RATING, label: '评分题', icon: RatingIcon, description: '星级评分或数字评分', color: '#F97316' },
  { type: QuestionType.DATE, label: '日期题', icon: DateIcon, description: '选择日期', color: '#06B6D4' },
  { type: QuestionType.TIME, label: '时间题', icon: TimeIcon, description: '选择时间', color: '#84CC16' },
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = React.memo(({ onSelect }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: 'rgba(99, 102, 241, 0.02)',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(99, 102, 241, 0.08)',
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        选择问题类型
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        点击下方卡片选择要添加的问题类型
      </Typography>
      <Grid container spacing={2}>
        {typeConfig.map(({ type, label, icon: Icon, description, color }) => (
          <Grid item xs={12} sm={6} md={4} key={type}>
            <Box
              className="question-type-card"
              onClick={() => onSelect(type)}
              sx={{
                p: 2.5,
                backgroundColor: 'white',
                border: '2px solid',
                borderColor: 'transparent',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: color,
                  boxShadow: `0 8px 24px ${color}25`,
                },
                '&:hover .type-icon-wrapper': {
                  backgroundColor: color,
                  transform: 'scale(1.1)',
                },
                '&:hover .type-label': {
                  color: color,
                },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box
                  className="type-icon-wrapper"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  <Icon className="type-icon" sx={{ color, fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    className="type-label"
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      transition: 'color 0.3s ease',
                      color: 'text.primary',
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
});

export default QuestionTypeSelector;

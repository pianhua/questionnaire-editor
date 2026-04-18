import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { createFromTemplate } from '../redux/questionnaireSlice';
import { Template } from '../types/questionnaire';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Fade,
} from '@mui/material';
import {
  TextFields,
  RadioButtonChecked,
  CheckBox,
  GridOn,
  Star,
  CalendarToday,
  LibraryBooks as LibraryIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

const defaultTemplates: Template[] = [
  {
    id: 'template-1',
    title: '客户满意度调查',
    description: '收集客户对产品或服务的满意度反馈',
    category: '满意度',
    questions: [
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您对我们产品的整体满意度如何？',
        required: true,
        options: [
          { id: uuidv4(), text: '非常满意' },
          { id: uuidv4(), text: '满意' },
          { id: uuidv4(), text: '一般' },
          { id: uuidv4(), text: '不满意' },
          { id: uuidv4(), text: '非常不满意' },
        ],
      },
      {
        id: uuidv4(),
        type: 'rating',
        title: '请为我们的服务质量打分',
        required: true,
        min: 1,
        max: 5,
        step: 1,
        labels: ['很差', '一般', '很好'],
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '您有哪些改进建议？',
        required: false,
        multiline: true,
        placeholder: '请输入您的建议...',
      },
    ],
  },
  {
    id: 'template-2',
    title: '员工满意度调查',
    description: '了解员工对工作环境、薪酬、领导力等方面的满意度',
    category: '人力资源',
    questions: [
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您对目前的工作环境满意吗？',
        required: true,
        options: [
          { id: uuidv4(), text: '非常满意' },
          { id: uuidv4(), text: '满意' },
          { id: uuidv4(), text: '一般' },
          { id: uuidv4(), text: '不满意' },
        ],
      },
      {
        id: uuidv4(),
        type: 'multiple_choice',
        title: '您认为哪些方面需要改进？（可多选）',
        required: false,
        options: [
          { id: uuidv4(), text: '薪酬福利' },
          { id: uuidv4(), text: '工作环境' },
          { id: uuidv4(), text: '职业发展' },
          { id: uuidv4(), text: '工作与生活平衡' },
          { id: uuidv4(), text: '团队合作' },
        ],
      },
      {
        id: uuidv4(),
        type: 'rating',
        title: '您对直属领导的满意度评分',
        required: true,
        min: 1,
        max: 5,
        labels: ['非常不满意', '中立', '非常满意'],
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '请分享您的其他想法或建议',
        required: false,
        multiline: true,
      },
    ],
  },
  {
    id: 'template-3',
    title: '活动报名表',
    description: '用于会议、研讨会、培训班等活动的报名信息收集',
    category: '活动',
    questions: [
      {
        id: uuidv4(),
        type: 'text',
        title: '您的姓名',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '您的邮箱',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '联系电话',
        required: true,
      },
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您计划参加哪种形式？',
        required: true,
        options: [
          { id: uuidv4(), text: '现场参加' },
          { id: uuidv4(), text: '线上参加' },
          { id: uuidv4(), text: '两者都参加' },
        ],
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '您对活动有什么特殊要求吗？',
        required: false,
        multiline: true,
      },
    ],
  },
  {
    id: 'template-4',
    title: '产品反馈调查',
    description: '收集用户对新产品的使用体验和反馈',
    category: '产品',
    questions: [
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您是通过什么渠道了解到我们产品的？',
        required: true,
        options: [
          { id: uuidv4(), text: '社交媒体' },
          { id: uuidv4(), text: '朋友推荐' },
          { id: uuidv4(), text: '搜索引擎' },
          { id: uuidv4(), text: '广告' },
          { id: uuidv4(), text: '其他' },
        ],
      },
      {
        id: uuidv4(),
        type: 'rating',
        title: '请为产品易用性评分',
        required: true,
        min: 1,
        max: 5,
        labels: ['非常难用', '一般', '非常易用'],
      },
      {
        id: uuidv4(),
        type: 'multiple_choice',
        title: '您最常使用哪些功能？（可多选）',
        required: false,
        options: [
          { id: uuidv4(), text: '核心功能A' },
          { id: uuidv4(), text: '核心功能B' },
          { id: uuidv4(), text: '高级功能C' },
          { id: uuidv4(), text: '设置选项' },
        ],
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '您希望我们增加什么功能？',
        required: false,
        multiline: true,
      },
    ],
  },
  {
    id: 'template-5',
    title: '市场调研问卷',
    description: '了解目标市场的需求和偏好',
    category: '市场',
    questions: [
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您的年龄段是？',
        required: true,
        options: [
          { id: uuidv4(), text: '18-25岁' },
          { id: uuidv4(), text: '26-35岁' },
          { id: uuidv4(), text: '36-45岁' },
          { id: uuidv4(), text: '46-60岁' },
          { id: uuidv4(), text: '60岁以上' },
        ],
      },
      {
        id: uuidv4(),
        type: 'single_choice',
        title: '您的月收入范围？',
        required: false,
        options: [
          { id: uuidv4(), text: '5000元以下' },
          { id: uuidv4(), text: '5000-10000元' },
          { id: uuidv4(), text: '10000-20000元' },
          { id: uuidv4(), text: '20000元以上' },
        ],
      },
      {
        id: uuidv4(),
        type: 'multiple_choice',
        title: '您平时消费的主要类别是？（可多选）',
        required: false,
        options: [
          { id: uuidv4(), text: '食品餐饮' },
          { id: uuidv4(), text: '服装配饰' },
          { id: uuidv4(), text: '电子产品' },
          { id: uuidv4(), text: '旅游出行' },
          { id: uuidv4(), text: '娱乐休闲' },
        ],
      },
      {
        id: uuidv4(),
        type: 'rating',
        title: '您对当前消费环境的满意度',
        required: true,
        min: 1,
        max: 5,
        labels: ['很不满意', '中立', '很满意'],
      },
    ],
  },
];

const categoryColors: Record<string, string> = {
  '满意度': '#10B981',
  '人力资源': '#6366F1',
  '活动': '#F59E0B',
  '产品': '#EC4899',
  '市场': '#8B5CF6',
};

const TemplateLibrary: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setNewTitle(`${template.title} - 副本`);
    setOpenDialog(true);
  };

  const handleConfirmUse = () => {
    if (selectedTemplate && newTitle.trim()) {
      dispatch(createFromTemplate({ template: selectedTemplate, title: newTitle.trim() }));
      setOpenDialog(false);
      setSelectedTemplate(null);
      setNewTitle('');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setNewTitle('');
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextFields fontSize="small" />;
      case 'single_choice':
        return <RadioButtonChecked fontSize="small" />;
      case 'multiple_choice':
        return <CheckBox fontSize="small" />;
      case 'matrix':
        return <GridOn fontSize="small" />;
      case 'rating':
        return <Star fontSize="small" />;
      case 'date':
        return <CalendarToday fontSize="small" />;
      default:
        return <TextFields fontSize="small" />;
    }
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'text': '文本',
      'single_choice': '单选',
      'multiple_choice': '多选',
      'matrix': '矩阵',
      'rating': '评分',
      'date': '日期',
    };
    return labels[type] || type;
  };

  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <Grid container spacing={3}>
        {defaultTemplates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Fade in timeout={300 + index * 100}>
              <Box className="template-card">
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      '& .template-action-area': {
                        backgroundColor: 'rgba(99, 102, 241, 0.04)',
                      },
                    },
                  }}
                >
                  <CardActionArea
                    className="template-action-area"
                    onClick={() => handleUseTemplate(template)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      p: 0,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardContent sx={{ flex: 1, width: '100%' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${categoryColors[template.category] || '#6366F1'} 0%, ${categoryColors[template.category] ? '#4F46E5' : '#4338CA'} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                          }}
                        >
                          {template.title.charAt(0)}
                        </Box>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{
                            backgroundColor: `${categoryColors[template.category] || '#6366F1'}15`,
                            color: categoryColors[template.category] || 'primary.main',
                            fontWeight: 500,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {template.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2}
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                        }}
                      >
                        {template.description}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {template.questions.slice(0, 3).map((q, idx) => (
                          <Chip
                            key={idx}
                            icon={getQuestionTypeIcon(q.type)}
                            label={getQuestionTypeLabel(q.type)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.5,
                              height: 26,
                              '& .MuiChip-icon': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        ))}
                        {template.questions.length > 3 && (
                          <Chip
                            label={`+${template.questions.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.5,
                              height: 26,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <LibraryIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                        共 {template.questions.length} 个问题
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            使用模板
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Box
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                模板
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedTemplate?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {selectedTemplate?.description}
              </Typography>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="问卷标题"
              fullWidth
              variant="outlined"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ borderRadius: 3 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTitle.trim()) {
                  handleConfirmUse();
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
              将基于此模板创建一个新的问卷
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 3, px: 3 }}>
            取消
          </Button>
          <Button
            onClick={handleConfirmUse}
            variant="contained"
            disabled={!newTitle.trim()}
            sx={{ borderRadius: 3, px: 3 }}
          >
            创建问卷
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TemplateLibrary;

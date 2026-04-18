import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Fade,
  Slide,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Collapse,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  Settings,
  Add as AddIcon,
  CheckCircle,
  RadioButtonChecked,
  CheckBox,
  TextFields,
  Star,
  Sort,
  GridOn,
  CloudUpload,
  CalendarToday,
  AccessTime,
  ArrowForward,
  Refresh,
  WifiOff,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Question, QuestionType } from '../types/questionnaire';
import { llmService, GeneratedQuestion, LLMServiceError } from '../services/llmService';
import { isNetworkOffline, onNetworkRestore } from '../utils/networkUtils';

interface AIGeneratePanelProps {
  open: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  onTitleGenerated?: (title: string, description?: string) => void;
  onOpenConfig: () => void;
}

// 问题类型配置
const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  text: { icon: TextFields, color: '#6366F1', label: '文本题' },
  single_choice: { icon: RadioButtonChecked, color: '#10B981', label: '单选题' },
  multiple_choice: { icon: CheckBox, color: '#F59E0B', label: '多选题' },
  rating: { icon: Star, color: '#F97316', label: '评分题' },
  ranking: { icon: Sort, color: '#8B5CF6', label: '排序题' },
  matrix: { icon: GridOn, color: '#EC4899', label: '矩阵题' },
  file_upload: { icon: CloudUpload, color: '#14B8A6', label: '文件上传' },
  date: { icon: CalendarToday, color: '#06B6D4', label: '日期题' },
  time: { icon: AccessTime, color: '#84CC16', label: '时间题' },
};

const AIGeneratePanel: React.FC<AIGeneratePanelProps> = ({
  open,
  onClose,
  onQuestionsGenerated,
  onTitleGenerated,
  onOpenConfig,
}) => {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ code: string; retryable: boolean } | null>(null);
  const [progressText, setProgressText] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [networkOffline, setNetworkOffline] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const isConfigured = llmService.isConfigured();

  // 网络状态监听
  useEffect(() => {
    const handleNetworkChange = (isOffline: boolean) => {
      setNetworkOffline(isOffline);
      if (isOffline) {
        setError('网络已断开，请检查网络连接');
      } else {
        setError(null);
        setErrorDetails(null);
      }
    };

    // 初始化网络状态
    setNetworkOffline(isNetworkOffline());

    // 监听网络恢复
    const unsubscribe = onNetworkRestore(() => {
      setNetworkOffline(false);
      setError(null);
      setErrorDetails(null);
    });

    // 监听网络断开
    const handleOffline = () => setNetworkOffline(true);
    const handleOnline = () => setNetworkOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 重置状态
  useEffect(() => {
    if (open) {
      setDescription('');
      setGenerating(false);
      setGeneratedQuestions([]);
      setGeneratedTitle('');
      setGeneratedDescription('');
      setShowResults(false);
      setError(null);
      setErrorDetails(null);
      setSelectedQuestions(new Set());
      setNetworkOffline(isNetworkOffline());
    }
  }, [open]);

  // 进度文字动画
  useEffect(() => {
    if (generating) {
      const texts = [
        '正在分析需求...',
        '正在设计问卷结构...',
        '正在生成问题...',
        '正在优化内容...',
        '即将完成...',
      ];
      let index = 0;
      const interval = setInterval(() => {
        setProgressText(texts[index % texts.length]);
        index++;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [generating]);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    if (!isConfigured) {
      setError('请先配置API');
      setErrorDetails({ code: 'NOT_CONFIGURED', retryable: false });
      onOpenConfig();
      return;
    }

    if (networkOffline) {
      setError('网络已断开，请检查网络连接后重试');
      setErrorDetails({ code: 'NETWORK_OFFLINE', retryable: true });
      return;
    }

    setGenerating(true);
    setError(null);
    setErrorDetails(null);
    setShowResults(false);
    setGeneratedQuestions([]);

    try {
      const result = await llmService.generateQuestionnaireFromDescription(description);
      setGeneratedTitle(result.title);
      setGeneratedDescription(result.description || '');
      setGeneratedQuestions(result.questions || []);
      setShowResults(true);
      // 默认全选
      const questions = result.questions || [];
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成失败，请重试';
      setError(errorMessage);

      // 提取错误详情
      if (err instanceof LLMServiceError) {
        setErrorDetails({
          code: err.code,
          retryable: err.retryable
        });
      } else {
        setErrorDetails({ code: 'UNKNOWN', retryable: true });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === generatedQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)));
    }
  };

  const handleAddSelected = () => {
    const typeMapping: Record<string, QuestionType> = {
      'text': QuestionType.TEXT,
      'single_choice': QuestionType.SINGLE_CHOICE,
      'multiple_choice': QuestionType.MULTIPLE_CHOICE,
      'rating': QuestionType.RATING,
      'ranking': QuestionType.RANKING,
      'matrix': QuestionType.MATRIX,
      'file_upload': QuestionType.FILE_UPLOAD,
      'date': QuestionType.DATE,
      'time': QuestionType.TIME,
    };

    const questionsToAdd = generatedQuestions
      .filter((_, index) => selectedQuestions.has(index))
      .map((q) => {
        const questionType = typeMapping[q.type] || QuestionType.TEXT;

        const baseQuestion: Question = {
          id: crypto.randomUUID(),
          type: questionType,
          title: q.title,
          description: q.description,
          required: q.required,
        };

        switch (q.type) {
          case 'text':
            return {
              ...baseQuestion,
              type: QuestionType.TEXT,
              placeholder: q.placeholder || '',
              maxLength: q.maxLength || 500,
              multiline: q.multiline ?? true,
            };
          case 'single_choice':
          case 'multiple_choice':
          case 'ranking':
            return {
              ...baseQuestion,
              type: questionType,
              options: (q.options || []).map((opt) => ({
                id: crypto.randomUUID(),
                text: opt.text,
              })),
            };
          case 'rating':
            return {
              ...baseQuestion,
              type: QuestionType.RATING,
              min: q.min || 1,
              max: q.max || 5,
              step: q.step || 1,
            };
          case 'matrix':
            return {
              ...baseQuestion,
              type: QuestionType.MATRIX,
              rows: (q.rows || []).map((r) => ({ id: crypto.randomUUID(), text: r.text })),
              columns: (q.columns || []).map((c) => ({ id: crypto.randomUUID(), text: c.text })),
            };
          case 'date':
            return {
              ...baseQuestion,
              type: QuestionType.DATE,
              minDate: q.minDate,
              maxDate: q.maxDate,
            };
          case 'time':
            return {
              ...baseQuestion,
              type: QuestionType.TIME,
              minTime: q.minTime,
              maxTime: q.maxTime,
            };
          case 'file_upload':
            return {
              ...baseQuestion,
              type: QuestionType.FILE_UPLOAD,
              allowedExtensions: q.allowedExtensions || [],
              maxFileSize: q.maxFileSize || 10,
              multiple: q.multiple ?? false,
            };
          default:
            return baseQuestion;
        }
      });

    if (questionsToAdd.length > 0) {
      onQuestionsGenerated(questionsToAdd);
    }

    if (onTitleGenerated && generatedTitle) {
      onTitleGenerated(generatedTitle, generatedDescription);
    }

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      {/* 渐变头部 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰圆形 */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: '20%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <AutoAwesome sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              AI智能生成问卷
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              描述您的需求，AI将为您创建专业的问卷
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, zIndex: 1 }}>
          <IconButton
            onClick={onOpenConfig}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            <Settings />
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* 输入区域 */}
        <Fade in={!showResults} timeout={400}>
          <Box>
            {/* 示例提示 */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <strong>示例：</strong>创建一个客户满意度调查问卷，包含关于服务质量、产品体验和整体评价的问题
              </Typography>
            </Paper>

            {/* 输入框 */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: '20px',
                background: 'linear-gradient(145degdeg, #f0f0f0, #ffffff)',
                boxShadow: generating ? 'none' : 'inset 0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2), 0 8px 32px rgba(102, 126, 234, 0.15)',
                },
              }}
            >
              <TextField
                inputRef={textFieldRef}
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={generating}
                placeholder="描述您想要创建的问卷内容、主题和目的..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    backgroundColor: 'transparent',
                    '& fieldset': {
                      border: '2px solid transparent',
                    },
                    '&:hover fieldset': {
                      border: '2px solid rgba(99, 102, 241, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #6366F1',
                    },
                  },
                }}
              />

              {/* 涟漪效果按钮 */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !description.trim()}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  borderRadius: '14px',
                  px: 3,
                  py: 1,
                  background: generating
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: generating ? '#6366F1' : 'white',
                  boxShadow: generating
                    ? 'none'
                    : '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.6s ease, height 0.6s ease',
                  },
                  '&:hover::before': {
                    width: 300,
                    height: 300,
                  },
                  '&:hover': {
                    transform: generating ? 'none' : 'translateY(-2px)',
                    boxShadow: generating
                      ? 'none'
                      : '0 6px 20px rgba(102, 126, 234, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {generating ? (
                  <>
                    <CircularProgress size={18} sx={{ mr: 1, color: '#6366F1' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>生成中...</span>
                  </>
                ) : (
                  <>
                    <AutoAwesome sx={{ mr: 1, fontSize: 18 }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>AI生成</span>
                  </>
                )}
              </Button>
            </Box>

            {/* 进度显示 */}
            {generating && (
              <Box
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 4,
                    py: 2,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <CircularProgress
                    size={24}
                    thickness={3}
                    sx={{ color: '#6366F1' }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6366F1',
                      fontWeight: 500,
                      minWidth: 150,
                    }}
                  >
                    {progressText}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* 网络离线提示 */}
            {networkOffline && !error && (
              <Fade in timeout={300}>
                <Alert
                  severity="warning"
                  icon={<WifiOff />}
                  sx={{
                    mt: 2,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <AlertTitle>网络已断开</AlertTitle>
                  请检查网络连接后重试
                </Alert>
              </Fade>
            )}

            {/* 错误提示 */}
            {error && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  icon={<ErrorIcon />}
                  action={
                    errorDetails?.retryable && !networkOffline ? (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleGenerate}
                        startIcon={<Refresh />}
                      >
                        重试
                      </Button>
                    ) : undefined
                  }
                  sx={{
                    mt: 2,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <AlertTitle>
                    {errorDetails?.code === 'NOT_CONFIGURED' && '请先配置API'}
                    {errorDetails?.code === 'NETWORK_OFFLINE' && '网络错误'}
                    {errorDetails?.code === 'RATE_LIMITED' && '请求过于频繁'}
                    {errorDetails?.code === 'TIMEOUT' && '请求超时'}
                    {errorDetails?.code === 'INVALID_API_KEY' && 'API配置错误'}
                    {!errorDetails?.code && '生成失败'}
                  </AlertTitle>
                  {error}
                </Alert>
              </Fade>
            )}
          </Box>
        </Fade>

        {/* 结果展示区域 */}
        <Collapse in={showResults} timeout={500}>
          {showResults && (
            <Slide in direction="up" timeout={400}>
              <Box>
                {/* 问卷标题 */}
                {generatedTitle && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      mb: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '16px',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {generatedTitle}
                    </Typography>
                    {generatedDescription && (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                        {generatedDescription}
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* 操作栏 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      共 {generatedQuestions.length} 个问题
                    </Typography>
                    <Chip
                      label={`已选择 ${selectedQuestions.size} 个`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366F1',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={handleSelectAll}
                      sx={{ borderRadius: '8px' }}
                    >
                      {selectedQuestions.size === generatedQuestions.length
                        ? '取消全选'
                        : '全选'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setShowResults(false);
                        setGeneratedQuestions([]);
                        setSelectedQuestions(new Set());
                      }}
                      startIcon={<Refresh />}
                      sx={{ borderRadius: '8px' }}
                    >
                      重新生成
                    </Button>
                  </Box>
                </Box>

                {/* 问题列表 */}
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                      },
                    },
                  }}
                >
                  {generatedQuestions.map((question, index) => {
                    const config = typeConfig[question.type] || typeConfig.text;
                    const Icon = config.icon;
                    const isSelected = selectedQuestions.has(index);

                    return (
                      <Paper
                        key={index}
                        elevation={0}
                        onClick={() => handleToggleQuestion(index)}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: '14px',
                          border: '2px solid',
                          borderColor: isSelected
                            ? '#6366F1'
                            : 'rgba(99, 102, 241, 0.1)',
                          backgroundColor: isSelected
                            ? 'rgba(99, 102, 241, 0.04)'
                            : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: '#6366F1',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                          },
                          '&::before': isSelected
                            ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background:
                                  'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                              }
                            : {},
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                          }}
                        >
                          {/* 选择指示器 */}
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '8px',
                              border: '2px solid',
                              borderColor: isSelected
                                ? '#6366F1'
                                : 'rgba(99, 102, 241, 0.3)',
                              backgroundColor: isSelected
                                ? '#6366F1'
                                : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          >
                            {isSelected && (
                              <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                            )}
                          </Box>

                          {/* 内容 */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              {/* 类型标签 */}
                              <Chip
                                icon={<Icon sx={{ fontSize: '14px !important' }} />}
                                label={config.label}
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: `${config.color}15`,
                                  color: config.color,
                                  '& .MuiChip-icon': {
                                    color: config.color,
                                  },
                                }}
                              />
                              {question.required && (
                                <Chip
                                  label="必填"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '10px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#EF4444',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box>

                            {/* 标题 */}
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{
                                color: 'text.primary',
                                mb: question.options ? 1 : 0,
                              }}
                            >
                              {index + 1}. {question.title}
                            </Typography>

                            {/* 描述 */}
                            {question.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {question.description}
                              </Typography>
                            )}

                            {/* 选项预览 */}
                            {question.options && question.options.length > 0 && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 0.5,
                                  mt: 1,
                                }}
                              >
                                {question.options.slice(0, 4).map((opt, optIdx) => (
                                  <Chip
                                    key={optIdx}
                                    label={opt.text}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '11px',
                                      backgroundColor:
                                        'rgba(99, 102, 241, 0.06)',
                                      color: 'text.secondary',
                                    }}
                                  />
                                ))}
                                {question.options.length > 4 && (
                                  <Chip
                                    label={`+${question.options.length - 4}`}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '11px',
                                      backgroundColor:
                                        'rgba(99, 102, 241, 0.1)',
                                      color: '#6366F1',
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>

                {/* 添加按钮 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <Button
                    onClick={onClose}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      color: 'text.secondary',
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddSelected}
                    disabled={selectedQuestions.size === 0}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      },
                      '&:disabled': {
                        background: 'rgba(99, 102, 241, 0.3)',
                      },
                    }}
                  >
                    添加选中的 {selectedQuestions.size} 个问题
                  </Button>
                </Box>
              </Box>
            </Slide>
          )}
        </Collapse>
      </DialogContent>
    </Dialog>
  );
};

export default AIGeneratePanel;
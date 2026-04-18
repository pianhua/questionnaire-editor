import React, { useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Question, QuestionType } from '../types/questionnaire';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { validateQuestionTitle } from '../utils/validation';

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: Question) => void;
  onMoveQuestion: (fromIndex: number, toIndex: number) => void;
  totalQuestions: number;
  onSelect?: (questionId: string) => void;
  isSelected?: boolean;
  titleError?: string;
}

// 移到组件外部，避免重复创建
const typeColors: Record<QuestionType, string> = {
  [QuestionType.TEXT]: '#6366F1',
  [QuestionType.SINGLE_CHOICE]: '#10B981',
  [QuestionType.MULTIPLE_CHOICE]: '#F59E0B',
  [QuestionType.MATRIX]: '#EC4899',
  [QuestionType.RANKING]: '#8B5CF6',
  [QuestionType.FILE_UPLOAD]: '#14B8A6',
  [QuestionType.RATING]: '#F97316',
  [QuestionType.DATE]: '#06B6D4',
  [QuestionType.TIME]: '#84CC16',
};

const questionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.TEXT]: '文本题',
  [QuestionType.SINGLE_CHOICE]: '单选题',
  [QuestionType.MULTIPLE_CHOICE]: '多选题',
  [QuestionType.MATRIX]: '矩阵题',
  [QuestionType.RANKING]: '排序题',
  [QuestionType.FILE_UPLOAD]: '文件上传',
  [QuestionType.RATING]: '评分题',
  [QuestionType.DATE]: '日期题',
  [QuestionType.TIME]: '时间题',
};

const QuestionCard: React.FC<QuestionCardProps> = React.memo(({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveQuestion,
  totalQuestions,
  onSelect,
  isSelected,
  titleError: externalTitleError,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [internalTitleError, setInternalTitleError] = useState<string>('');

  // 合并外部和内部的标题错误
  const titleError = externalTitleError || internalTitleError;

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'QUESTION',
    item: { type: 'QUESTION', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'QUESTION',
    hover: (item: { type: string; index: number }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMoveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const getQuestionTypeLabel = useCallback((type: QuestionType): string => {
    return questionTypeLabels[type];
  }, []);

  const handleRequiredChange = useCallback((checked: boolean) => {
    onUpdate({ ...question, required: checked });
  }, [onUpdate, question]);

  const handleTitleChange = useCallback((title: string) => {
    const validation = validateQuestionTitle(title);
    if (!validation.isValid && validation.error) {
      setInternalTitleError(validation.error);
    } else {
      setInternalTitleError('');
    }
    onUpdate({ ...question, title });
  }, [onUpdate, question]);

  const handleDescriptionChange = useCallback((description: string) => {
    onUpdate({ ...question, description });
  }, [onUpdate, question]);

  const handleToggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // 使用 useMemo 优化选项预览计算
  const optionsPreview = useMemo(() => {
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.RANKING:
        if (question.options && question.options.length > 0) {
          const texts = question.options.slice(0, 3).map(opt => opt.text);
          const suffix = question.options.length > 3 ? `...等${question.options.length}项` : '';
          return texts.join('、') + suffix;
        }
        return '暂无选项';
      case QuestionType.MATRIX:
        if (question.rows && question.columns) {
          return `${question.rows.length}行×${question.columns.length}列`;
        }
        return '暂无选项';
      case QuestionType.RATING:
        if (question.labels && question.labels.length > 0) {
          return `${question.min}-${question.max}分（${question.labels.join('、')}）`;
        }
        return `${question.min}-${question.max}分`;
      default:
        return null;
    }
  }, [question.type, question.options, question.rows, question.columns, question.labels, question.min, question.max]);

  return (
    <Paper
      ref={(node) => preview(drop(node))}
      elevation={0}
      className="question-card"
      onClick={() => onSelect?.(question.id)}
      sx={{
        mb: 0,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        boxShadow: isSelected
          ? '0 4px 20px rgba(99, 102, 241, 0.3)'
          : '0 2px 12px rgba(0, 0, 0, 0.04)',
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'white',
        '&:hover': {
          boxShadow: isSelected
            ? '0 6px 24px rgba(99, 102, 241, 0.35)'
            : '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        p={{ xs: 1.5, md: 2 }}
        gap={{ xs: 1, md: 2 }}
        sx={{
          backgroundColor: 'rgba(99, 102, 241, 0.02)',
          flexDirection: 'row',
        }}
      >
        <Box
          ref={drag}
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            borderRadius: 2,
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
            },
            '&:active': {
              cursor: 'grabbing',
            },
            flexShrink: 0,
          }}
        >
          <DragIcon sx={{ color: 'text.secondary', fontSize: { xs: 20, md: 24 } }} />
        </Box>

        <Box
          sx={{
            width: { xs: 6, md: 8 },
            height: { xs: 36, md: 40 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${typeColors[question.type]} 0%, ${typeColors[question.type]}99 100%)`,
            flexShrink: 0,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1}
            sx={{ flexWrap: 'wrap' }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: typeColors[question.type],
                fontWeight: 600,
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {getQuestionTypeLabel(question.type)}
            </Typography>
            {question.required && (
              <Chip
                label="必填"
                size="small"
                sx={{
                  height: { xs: 18, md: 20 },
                  fontSize: { xs: '0.65rem', md: '0.7rem' },
                  fontWeight: 600,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'error.main',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: question.title ? 'text.primary' : 'error.main',
              fontWeight: 500,
              mt: 0.5,
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: { xs: 'nowrap', md: 'normal' },
            }}
          >
            {question.title || '（未填写问题标题）'}
          </Typography>
          {optionsPreview && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                mt: 0.5,
                fontSize: { xs: '0.65rem', md: '0.75rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'nowrap', md: 'normal' },
              }}
            >
              {optionsPreview}
            </Typography>
          )}
        </Box>

        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5}
          sx={{ flexShrink: 0 }}
        >
          <Chip
            label={`#${index + 1}`}
            size="small"
            sx={{
              height: { xs: 22, md: 24 },
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: 600,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'primary.main',
              borderRadius: 1.5,
            }}
          />
          <IconButton
            size="medium"
            onClick={handleToggleExpand}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              backgroundColor: expanded ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
              },
            }}
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>

          <IconButton
            size="medium"
            onClick={handleMenuOpen}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
              },
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(question);
              handleMenuClose();
            }}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            <CopyIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
            复制问题
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(question.id);
              handleMenuClose();
            }}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            删除问题
          </MenuItem>
        </Menu>
      </Box>

      <Collapse in={expanded}>
        <Box
          px={{ xs: 2, md: 3 }}
          pb={{ xs: 2, md: 3 }}
          sx={{
            backgroundColor: 'white',
          }}
        >
          <Box mt={2}>
            <TextField
              fullWidth
              label="问题标题"
              value={question.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              size="small"
              error={Boolean(titleError)}
              helperText={titleError}
              sx={{ mb: 2, '& .MuiInputBase-input': { minHeight: 48, py: 1.5 } }}
            />

            <TextField
              fullWidth
              label="问题描述（可选）"
              value={question.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              size="small"
              sx={{ mb: 2, '& .MuiInputBase-input': { minHeight: 48, py: 1.5 } }}
              placeholder="添加更多说明或指引..."
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                borderRadius: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={question.required}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRequiredChange(e.target.checked);
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    必填问题
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
});

export default QuestionCard;

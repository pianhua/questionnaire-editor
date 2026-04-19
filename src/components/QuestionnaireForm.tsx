import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Question, QuestionType, Option } from '../types/questionnaire';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Radio,
  RadioGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Rating,
  LinearProgress,
  IconButton,
  Container,
} from '@mui/material';
import { CloudUpload as UploadIcon, Send as SubmitIcon, DragIndicator as DragIcon } from '@mui/icons-material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface QuestionFormProps {
  question: Question;
  index: number;
  onAnswerChange: (questionId: string, answer: any) => void;
}

const RankItem: React.FC<{
  id: string;
  text: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}> = ({ id, text, index, moveItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'RANK_ITEM',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'RANK_ITEM',
    drop: (item: { id: string; index: number }) => moveItem(item.index, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Box
      ref={(node) => drag(drop(node))}
      sx={{
        p: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        mb: 1,
        cursor: 'grab',
        backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.1)' : isOver ? 'rgba(99, 102, 241, 0.05)' : 'white',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <IconButton size="small" sx={{ p: 0.5 }}>
        <DragIcon fontSize="small" color="action" />
      </IconButton>
      <Typography variant="body2">
        {index + 1}. {text}
      </Typography>
    </Box>
  );
};

const QuestionItem: React.FC<QuestionFormProps> = ({ question, index, onAnswerChange }) => {
  const [matrixValues, setMatrixValues] = useState<Record<string, string>>({});
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  const [multipleChoiceValues, setMultipleChoiceValues] = useState<string[]>([]);
  const [value, setValue] = useState<string | number>('');

  // 初始化排序题的顺序
  React.useEffect(() => {
    if (question.type === QuestionType.RANKING) {
      setRankingOrder(question.options.map(opt => opt.id));
    }
  }, [question]);

  const handleMatrixChange = (rowId: string, columnId: string) => {
    const newValue = { ...matrixValues, [rowId]: columnId };
    setMatrixValues(newValue);
    onAnswerChange(question.id, newValue);
  };

  const handleRankingChange = (newOrder: string[]) => {
    setRankingOrder(newOrder);
    onAnswerChange(question.id, newOrder);
  };

  const handleCheckboxChange = (optionId: string) => {
    // 检查是否是多选题且有选择限制
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      const maxSelections = (question as any).maxSelections;
      if (maxSelections && !multipleChoiceValues.includes(optionId) && multipleChoiceValues.length >= maxSelections) {
        // 达到选择限制，不允许再选择
        return;
      }
    }
    
    const newValue = multipleChoiceValues.includes(optionId)
      ? multipleChoiceValues.filter(id => id !== optionId)
      : [...multipleChoiceValues, optionId];
    setMultipleChoiceValues(newValue);
    onAnswerChange(question.id, newValue);
  };

  const handleValueChange = (newValue: string | number) => {
    setValue(newValue);
    onAnswerChange(question.id, newValue);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <TextField
            fullWidth
            multiline={question.multiline}
            rows={question.multiline ? 4 : 1}
            placeholder={question.placeholder || '请输入您的回答...'}
            inputProps={{ maxLength: question.maxLength }}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <RadioGroup value={value} onChange={(e) => handleValueChange(e.target.value)}>
            {question.options.map((opt: Option) => (
              <FormControlLabel
                key={opt.id}
                value={opt.id}
                control={<Radio />}
                label={opt.text}
              />
            ))}
          </RadioGroup>
        );

      case QuestionType.MULTIPLE_CHOICE:
        const maxSelections = (question as any).maxSelections;
        const minSelections = (question as any).minSelections;
        const isLimitReached = maxSelections && multipleChoiceValues.length >= maxSelections;
        
        return (
          <Box>
            <FormGroup>
              {question.options.map((opt: Option) => (
                <FormControlLabel
                  key={opt.id}
                  control={
                    <Checkbox
                      checked={multipleChoiceValues.includes(opt.id)}
                      onChange={() => handleCheckboxChange(opt.id)}
                      disabled={isLimitReached && !multipleChoiceValues.includes(opt.id)}
                      sx={{
                        '&.Mui-disabled': {
                          '& .MuiSvgIcon-root': {
                            color: 'rgba(0, 0, 0, 0.38)'
                          }
                        }
                      }}
                    />
                  }
                  label={opt.text}
                />
              ))}
            </FormGroup>
            {isLimitReached && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                已达到选择上限（最多{maxSelections}项），请取消选择后再添加其他选项
              </Typography>
            )}
            {minSelections && multipleChoiceValues.length < minSelections && (
              <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                至少需要选择{minSelections}项
              </Typography>
            )}
          </Box>
        );

      case QuestionType.MATRIX:
        return (
          <Box sx={{ overflowX: 'auto', my: 2 }}>
            <Box sx={{ minWidth: 'max-content' }}>
              <Box display="flex" gap={2} mb={1}>
                <Box sx={{ width: 150 }} />
                {question.columns.map((col: Option) => (
                  <Typography key={col.id} variant="caption" sx={{ flex: 1, textAlign: 'center', minWidth: 80 }}>
                    {col.text}
                  </Typography>
                ))}
              </Box>
              {question.rows.map((row: Option) => (
                <Box key={row.id} display="flex" gap={2} alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ width: 150, flexShrink: 0 }}>
                    {row.text}
                  </Typography>
                  {question.columns.map((col: Option) => (
                    <Radio
                      key={`${row.id}-${col.id}`}
                      sx={{ flex: 1, minWidth: 80 }}
                      checked={matrixValues[row.id] === col.id}
                      onChange={() => handleMatrixChange(row.id, col.id)}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case QuestionType.RANKING:
        const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
          const dragItem = rankingOrder[dragIndex];
          const newOrder = [...rankingOrder];
          newOrder.splice(dragIndex, 1);
          newOrder.splice(hoverIndex, 0, dragItem);
          handleRankingChange(newOrder);
        };

        const rankedOptions = rankingOrder.map(id => 
          question.options.find(opt => opt.id === id)
        ).filter(Boolean) as Option[];

        return (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              拖动选项进行排序
            </Typography>
            <DndProvider backend={HTML5Backend}>
              {rankedOptions.map((opt: Option, idx: number) => (
                <RankItem
                  key={opt.id}
                  id={opt.id}
                  text={opt.text}
                  index={idx}
                  moveItem={handleMoveItem}
                />
              ))}
            </DndProvider>
          </Box>
        );

      case QuestionType.FILE_UPLOAD:
        return (
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mb: 1 }}
            >
              选择文件
              <input type="file" hidden multiple={question.multiple} />
            </Button>
            <Typography variant="caption" color="text.secondary" display="block">
              支持格式: {question.allowedExtensions?.join(', ') || '所有文件'}
              {question.maxFileSize && `, 最大 ${question.maxFileSize}MB`}
            </Typography>
          </Box>
        );

      case QuestionType.RATING:
        return (
          <Box>
            <Rating
              value={typeof value === 'number' ? value : 0}
              max={question.max}
              onChange={(_, newValue) => handleValueChange(newValue || 0)}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              {question.labels?.[0] && (
                <Typography variant="caption" color="text.secondary">
                  {question.labels[0]}
                </Typography>
              )}
              {question.labels?.[2] && (
                <Typography variant="caption" color="text.secondary">
                  {question.labels[2]}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case QuestionType.DATE:
        return (
          <TextField
            type="date"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: question.minDate,
              max: question.maxDate,
            }}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case QuestionType.TIME:
        return (
          <TextField
            type="time"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: question.minTime,
              max: question.maxTime,
            }}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      default:
        return <Typography>未支持的问题类型</Typography>;
    }
  };

  return (
    <Box mb={4}>
      <Typography variant="subtitle1" gutterBottom>
        {index + 1}. {question.title}
        {question.required && <Typography component="span" color="error"> *</Typography>}
      </Typography>
      {question.description && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {question.description}
        </Typography>
      )}
      {renderQuestion()}
    </Box>
  );
};

interface QuestionnaireFormProps {
  questionnaireId: string;
  onSubmit: (answers: Record<string, any>) => void;
}

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ questionnaireId, onSubmit }) => {
  const { questionnaires } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const currentQuestionnaire = questionnaires.find((q) => q.id === questionnaireId);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!currentQuestionnaire) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            问卷不存在或已被删除
          </Typography>
        </Paper>
      </Container>
    );
  }

  const { theme, title, description, questions } = currentQuestionnaire;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    // 验证所有问题
    const validationErrors: string[] = [];
    
    questions.forEach((question) => {
      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        const answer = answers[question.id] || [];
        const selectedCount = Array.isArray(answer) ? answer.length : 0;
        const maxSelections = (question as any).maxSelections;
        const minSelections = (question as any).minSelections;
        
        if (minSelections && selectedCount < minSelections) {
          validationErrors.push(`${question.title}：至少需要选择${minSelections}项`);
        }
        if (maxSelections && selectedCount > maxSelections) {
          validationErrors.push(`${question.title}：最多只能选择${maxSelections}项`);
        }
      }
    });
    
    if (validationErrors.length > 0) {
      // 显示验证错误
      alert(validationErrors.join('\n'));
      return;
    }
    
    setSubmitting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSubmitting(false);
          setSubmitted(true);
          onSubmit(answers);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  if (submitted) {
    return (
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            fontFamily: theme.font,
          }}
        >
          <Box textAlign="center" py={4}>
            <Typography
              variant="h4"
              sx={{ color: theme.primaryColor, mb: 2 }}
              style={{ fontFamily: theme.font }}
            >
              感谢您的参与！
            </Typography>
            <Typography variant="body1" style={{ fontFamily: theme.font }}>
              您的回答已成功提交。
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.font,
        }}
      >
        <Box mb={4} textAlign="center">
          <Typography
            variant="h4"
            sx={{ color: theme.primaryColor, mb: 2 }}
            style={{ fontFamily: theme.font }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" style={{ fontFamily: theme.font }}>
              {description}
            </Typography>
          )}
        </Box>

        {submitting && (
          <Box mb={3}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary">
              正在提交...
            </Typography>
          </Box>
        )}

        {questions.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            此问卷暂无问题
          </Typography>
        ) : (
          questions.map((question: Question, index: number) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              onAnswerChange={handleAnswerChange}
            />
          ))
        )}

        {questions.length > 0 && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={<SubmitIcon />}
              style={{
                backgroundColor: theme.primaryColor,
                fontFamily: theme.font,
              }}
            >
              提交回答
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default QuestionnaireForm;
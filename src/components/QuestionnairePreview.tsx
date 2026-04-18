import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { CloudUpload as UploadIcon, Send as SubmitIcon, DragIndicator as DragIcon } from '@mui/icons-material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface QuestionPreviewProps {
  question: Question;
  index: number;
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

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question, index }) => {
  const [matrixValues, setMatrixValues] = useState<Record<string, string>>({});
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  const [multipleChoiceValues, setMultipleChoiceValues] = useState<string[]>([]);
  const [value, setValue] = useState<string | number>('');

  useEffect(() => {
    // 初始化排序题的顺序
    if (question.type === QuestionType.RANKING) {
      setRankingOrder(question.options.map(opt => opt.id));
    }
  }, [question]);

  const handleMatrixChange = (rowId: string, columnId: string) => {
    setMatrixValues(prev => ({
      ...prev,
      [rowId]: columnId
    }));
  };

  const handleRankingChange = (newOrder: string[]) => {
    setRankingOrder(newOrder);
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
          />
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
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
        const handleCheckboxChange = (optionId: string) => {
          setMultipleChoiceValues(prev => {
            if (prev.includes(optionId)) {
              return prev.filter(id => id !== optionId);
            } else {
              return [...prev, optionId];
            }
          });
        };

        return (
          <FormGroup>
            {question.options.map((opt: Option) => (
              <FormControlLabel
                key={opt.id}
                control={
                  <Checkbox
                    checked={multipleChoiceValues.includes(opt.id)}
                    onChange={() => handleCheckboxChange(opt.id)}
                  />
                }
                label={opt.text}
              />
            ))}
          </FormGroup>
        );

      case QuestionType.MATRIX:
        return (
          <Box>
            <Box display="flex" gap={2} mb={1}>
              <Box sx={{ width: 150 }} />
              {question.columns.map((col: Option) => (
                <Typography key={col.id} variant="caption" sx={{ flex: 1, textAlign: 'center' }}>
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
                    sx={{ flex: 1 }}
                    checked={matrixValues[row.id] === col.id}
                    onChange={() => handleMatrixChange(row.id, col.id)}
                  />
                ))}
              </Box>
            ))}
          </Box>
        );

      case QuestionType.RANKING:
        const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
          const dragItem = rankingOrder[dragIndex];
          const newOrder = [...rankingOrder];
          newOrder.splice(dragIndex, 1);
          newOrder.splice(hoverIndex, 0, dragItem);
          setRankingOrder(newOrder);
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
              onChange={(_, newValue) => setValue(newValue || 0)}
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

const QuestionnairePreview: React.FC = () => {
  const { questionnaires, currentQuestionnaireId } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const currentQuestionnaire = questionnaires.find((q) => q.id === currentQuestionnaireId);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!currentQuestionnaire) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary" textAlign="center">
          请先选择一个问卷进行预览
        </Typography>
      </Paper>
    );
  }

  const { theme, title, description, questions } = currentQuestionnaire;

  const handleSubmit = () => {
    setSubmitting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSubmitting(false);
          setSubmitted(true);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  if (submitted) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 4,
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
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => setSubmitted(false)}
            style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
          >
            再次填写
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.font,
        maxWidth: 800,
        mx: 'auto',
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
          <QuestionPreview key={question.id} question={question} index={index} />
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
  );
};

export default QuestionnairePreview;

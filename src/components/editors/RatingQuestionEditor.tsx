import React from 'react';
import { RatingQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch, Typography } from '@mui/material';

interface RatingQuestionEditorProps {
  question: RatingQuestion;
  onChange: (question: RatingQuestion) => void;
}

const RatingQuestionEditor: React.FC<RatingQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<RatingQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="最小值"
          type="number"
          value={question.min}
          onChange={(e) => handleUpdate({ min: parseInt(e.target.value) || 1 })}
          size="small"
          inputProps={{ min: 0 }}
        />
        <TextField
          label="最大值"
          type="number"
          value={question.max}
          onChange={(e) => handleUpdate({ max: parseInt(e.target.value) || 5 })}
          size="small"
          inputProps={{ min: 2 }}
        />
        <TextField
          label="步进值"
          type="number"
          value={question.step || 1}
          onChange={(e) => handleUpdate({ step: parseInt(e.target.value) || 1 })}
          size="small"
          inputProps={{ min: 1 }}
        />
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        评分标签（可选）
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="低分标签"
          value={question.labels?.[0] || ''}
          onChange={(e) =>
            handleUpdate({
              labels: [e.target.value, question.labels?.[1] || '', question.labels?.[2] || ''],
            })
          }
          size="small"
          fullWidth
          placeholder="例如: 不满意"
        />
        <TextField
          label="中等标签"
          value={question.labels?.[1] || ''}
          onChange={(e) =>
            handleUpdate({
              labels: [question.labels?.[0] || '', e.target.value, question.labels?.[2] || ''],
            })
          }
          size="small"
          fullWidth
          placeholder="例如: 一般"
        />
        <TextField
          label="高分标签"
          value={question.labels?.[2] || ''}
          onChange={(e) =>
            handleUpdate({
              labels: [question.labels?.[0] || '', question.labels?.[1] || '', e.target.value],
            })
          }
          size="small"
          fullWidth
          placeholder="例如: 满意"
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={question.required || false}
            onChange={(e) => handleUpdate({ required: e.target.checked })}
          />
        }
        label="必填"
      />
    </Box>
  );
};

export default RatingQuestionEditor;

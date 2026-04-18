import React from 'react';
import { DateQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

interface DateQuestionEditorProps {
  question: DateQuestion;
  onChange: (question: DateQuestion) => void;
}

const DateQuestionEditor: React.FC<DateQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<DateQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="最小日期"
          type="date"
          value={question.minDate || ''}
          onChange={(e) => handleUpdate({ minDate: e.target.value || undefined })}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="最大日期"
          type="date"
          value={question.maxDate || ''}
          onChange={(e) => handleUpdate({ maxDate: e.target.value || undefined })}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
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

export default DateQuestionEditor;

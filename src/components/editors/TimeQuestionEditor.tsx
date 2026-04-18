import React from 'react';
import { TimeQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

interface TimeQuestionEditorProps {
  question: TimeQuestion;
  onChange: (question: TimeQuestion) => void;
}

const TimeQuestionEditor: React.FC<TimeQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<TimeQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="最早时间"
          type="time"
          value={question.minTime || ''}
          onChange={(e) => handleUpdate({ minTime: e.target.value || undefined })}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="最晚时间"
          type="time"
          value={question.maxTime || ''}
          onChange={(e) => handleUpdate({ maxTime: e.target.value || undefined })}
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

export default TimeQuestionEditor;

import React from 'react';
import { MultipleChoiceQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';
import { OptionsEditor } from './OptionsEditor';

interface MultipleChoiceQuestionEditorProps {
  question: MultipleChoiceQuestion;
  onChange: (question: MultipleChoiceQuestion) => void;
}

const MultipleChoiceQuestionEditor: React.FC<MultipleChoiceQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<MultipleChoiceQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <Box mb={3}>
        <OptionsEditor
          options={question.options}
          onChange={(options) => handleUpdate({ options })}
          label="选项"
        />
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="最少选择数"
          type="number"
          value={question.minSelections || ''}
          onChange={(e) => handleUpdate({ minSelections: parseInt(e.target.value) || undefined })}
          size="small"
          inputProps={{ min: 0 }}
        />
        <TextField
          label="最多选择数"
          type="number"
          value={question.maxSelections || ''}
          onChange={(e) => handleUpdate({ maxSelections: parseInt(e.target.value) || undefined })}
          size="small"
          inputProps={{ min: 0 }}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={question.randomizeOptions || false}
            onChange={(e) => handleUpdate({ randomizeOptions: e.target.checked })}
          />
        }
        label="随机排列选项"
      />

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

export default MultipleChoiceQuestionEditor;

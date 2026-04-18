import React from 'react';
import { SingleChoiceQuestion } from '../../types/questionnaire';
import { Box, FormControlLabel, Switch } from '@mui/material';
import { OptionsEditor } from './OptionsEditor';

interface SingleChoiceQuestionEditorProps {
  question: SingleChoiceQuestion;
  onChange: (question: SingleChoiceQuestion) => void;
}

const SingleChoiceQuestionEditor: React.FC<SingleChoiceQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<SingleChoiceQuestion>) => {
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

export default SingleChoiceQuestionEditor;

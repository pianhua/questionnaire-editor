import React from 'react';
import { RankingQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch, Typography } from '@mui/material';
import { OptionsEditor } from './OptionsEditor';

interface RankingQuestionEditorProps {
  question: RankingQuestion;
  onChange: (question: RankingQuestion) => void;
}

const RankingQuestionEditor: React.FC<RankingQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<RankingQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          拖动选项可以调整默认顺序，受访者将看到打乱顺序的选项进行排序
        </Typography>
        <OptionsEditor
          options={question.options}
          onChange={(options) => handleUpdate({ options })}
          label="选项"
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

export default RankingQuestionEditor;

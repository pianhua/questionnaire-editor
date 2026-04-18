import React, { useState } from 'react';
import { TextQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch, Collapse } from '@mui/material';
import { OptionsEditor } from './OptionsEditor';

interface TextQuestionEditorProps {
  question: TextQuestion;
  onChange: (question: TextQuestion) => void;
}

const TextQuestionEditor: React.FC<TextQuestionEditorProps> = ({ question, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleUpdate = (updates: Partial<TextQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={question.multiline || false}
            onChange={(e) => handleUpdate({ multiline: e.target.checked })}
          />
        }
        label="多行文本"
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

      <Box mt={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
          }
          label="显示高级设置"
        />

        <Collapse in={showAdvanced}>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="占位符文本"
              value={question.placeholder || ''}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="最大字符数"
              type="number"
              value={question.maxLength || ''}
              onChange={(e) => handleUpdate({ maxLength: parseInt(e.target.value) || undefined })}
              size="small"
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default TextQuestionEditor;

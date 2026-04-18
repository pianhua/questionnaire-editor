import React from 'react';
import { MatrixQuestion } from '../../types/questionnaire';
import { Box, FormControlLabel, Switch } from '@mui/material';
import { MatrixOptionsEditor } from './OptionsEditor';

interface MatrixQuestionEditorProps {
  question: MatrixQuestion;
  onChange: (question: MatrixQuestion) => void;
}

const MatrixQuestionEditor: React.FC<MatrixQuestionEditorProps> = ({ question, onChange }) => {
  const handleUpdate = (updates: Partial<MatrixQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Box>
      <MatrixOptionsEditor
        rows={question.rows}
        columns={question.columns}
        onRowsChange={(rows) => handleUpdate({ rows })}
        onColumnsChange={(columns) => handleUpdate({ columns })}
      />

      <FormControlLabel
        control={
          <Switch
            checked={question.required || false}
            onChange={(e) => handleUpdate({ required: e.target.checked })}
          />
        }
        label="必填"
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default MatrixQuestionEditor;

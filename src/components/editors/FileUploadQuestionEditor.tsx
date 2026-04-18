import React from 'react';
import { FileUploadQuestion } from '../../types/questionnaire';
import { Box, TextField, FormControlLabel, Switch, Chip, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface FileUploadQuestionEditorProps {
  question: FileUploadQuestion;
  onChange: (question: FileUploadQuestion) => void;
}

const FileUploadQuestionEditor: React.FC<FileUploadQuestionEditorProps> = ({ question, onChange }) => {
  const [newExtension, setNewExtension] = React.useState('');

  const handleUpdate = (updates: Partial<FileUploadQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const handleAddExtension = () => {
    if (newExtension.trim() && !question.allowedExtensions?.includes(newExtension.trim().toLowerCase())) {
      handleUpdate({
        allowedExtensions: [...(question.allowedExtensions || []), newExtension.trim().toLowerCase()],
      });
      setNewExtension('');
    }
  };

  const handleDeleteExtension = (ext: string) => {
    handleUpdate({
      allowedExtensions: question.allowedExtensions?.filter((e) => e !== ext),
    });
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={question.multiple || false}
            onChange={(e) => handleUpdate({ multiple: e.target.checked })}
          />
        }
        label="允许多文件上传"
      />

      <Box mt={2} mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          允许的文件类型
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
          {question.allowedExtensions?.map((ext) => (
            <Chip
              key={ext}
              label={ext}
              onDelete={() => handleDeleteExtension(ext)}
              size="small"
            />
          ))}
        </Box>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            value={newExtension}
            onChange={(e) => setNewExtension(e.target.value)}
            placeholder="例如: pdf, jpg, png"
            onKeyPress={(e) => e.key === 'Enter' && handleAddExtension()}
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" size="small" onClick={handleAddExtension} startIcon={<AddIcon />}>
            添加
          </Button>
        </Box>
      </Box>

      <TextField
        label="最大文件大小 (MB)"
        type="number"
        value={question.maxFileSize || ''}
        onChange={(e) => handleUpdate({ maxFileSize: parseInt(e.target.value) || undefined })}
        size="small"
        fullWidth
        inputProps={{ min: 1 }}
        sx={{ mb: 2 }}
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

export default FileUploadQuestionEditor;

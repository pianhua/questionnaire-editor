import React, { useState, useMemo } from 'react';
import { Option, MatrixOption } from '../../types/questionnaire';
import { Box, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Button, Typography, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, DragHandle as DragIcon, Warning as WarningIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { validateOptions, validateMatrixOptions } from '../../utils/validation';

interface OptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
  label?: string;
  minOptions?: number;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({ options, onChange, label = '选项', minOptions = 2 }) => {
  const [newOption, setNewOption] = useState('');
  const [touched, setTouched] = useState(false);

  // 验证选项
  const validation = useMemo(() => {
    return validateOptions(options, minOptions);
  }, [options, minOptions]);

  // 显示错误提示（仅在用户交互过后显示）
  const showError = touched && !validation.isValid && validation.error;

  // 检测重复的选项
  const duplicateTexts = useMemo(() => {
    if (validation.duplicateOptions) {
      return validation.duplicateOptions;
    }
    return [];
  }, [validation.duplicateOptions]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      onChange([...options, { id: uuidv4(), text: newOption.trim() }]);
      setNewOption('');
      setTouched(true);
    }
  };

  const handleUpdateOption = (id: string, text: string) => {
    onChange(options.map(opt => (opt.id === id ? { ...opt, text } : opt)));
    setTouched(true);
  };

  const handleDeleteOption = (id: string) => {
    onChange(options.filter(opt => opt.id !== id));
    setTouched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <Box>
      {showError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validation.error}
          {duplicateTexts.length > 0 && (
            <Typography component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
              重复选项：{duplicateTexts.join('、')}
            </Typography>
          )}
        </Alert>
      )}
      <List dense>
        {options.map((option, index) => {
          const isDuplicate = duplicateTexts.includes(option.text.trim().toLowerCase());
          return (
            <ListItem key={option.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <DragIcon color="action" fontSize="small" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={option.text}
                    onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                    placeholder={`${label} ${index + 1}`}
                    error={isDuplicate}
                    helperText={isDuplicate ? '选项重复' : ''}
                    sx={{
                      '& .MuiInputBase-input': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  />
                </Box>
                <IconButton size="small" onClick={() => handleDeleteOption(option.id)} sx={{ flexShrink: 0, ml: 1 }}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            </ListItem>
          );
        })}
      </List>
      <Box display="flex" gap={1} mt={1}>
        <TextField
          size="small"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`添加新${label}`}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" size="small" onClick={handleAddOption} startIcon={<AddIcon />}>
          添加
        </Button>
      </Box>
    </Box>
  );
};

interface MatrixOptionsEditorProps {
  rows: Option[];
  columns: Option[];
  onRowsChange: (rows: Option[]) => void;
  onColumnsChange: (columns: Option[]) => void;
}

export const MatrixOptionsEditor: React.FC<MatrixOptionsEditorProps> = ({
  rows,
  columns,
  onRowsChange,
  onColumnsChange,
}) => {
  const [newRow, setNewRow] = useState('');
  const [newColumn, setNewColumn] = useState('');
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    return validateMatrixOptions(rows, columns);
  }, [rows, columns]);

  const showError = touched && !validation.isValid && validation.error;

  const handleAddRow = () => {
    if (newRow.trim()) {
      onRowsChange([...rows, { id: uuidv4(), text: newRow.trim() }]);
      setNewRow('');
      setTouched(true);
    }
  };

  const handleAddColumn = () => {
    if (newColumn.trim()) {
      onColumnsChange([...columns, { id: uuidv4(), text: newColumn.trim() }]);
      setNewColumn('');
      setTouched(true);
    }
  };

  const handleUpdateRow = (id: string, text: string) => {
    onRowsChange(rows.map(row => (row.id === id ? { ...row, text } : row)));
    setTouched(true);
  };

  const handleUpdateColumn = (id: string, text: string) => {
    onColumnsChange(columns.map(col => (col.id === id ? { ...col, text } : col)));
    setTouched(true);
  };

  const handleDeleteRow = (id: string) => {
    onRowsChange(rows.filter(row => row.id !== id));
    setTouched(true);
  };

  const handleDeleteColumn = (id: string) => {
    onColumnsChange(columns.filter(col => col.id !== id));
    setTouched(true);
  };

  return (
    <Box>
      {showError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validation.error}
        </Alert>
      )}
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          行选项（问题）
        </Typography>
        <List dense>
          {rows.map((row, index) => (
            <ListItem key={row.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.text}
                    onChange={(e) => handleUpdateRow(row.id, e.target.value)}
                    placeholder={`行 ${index + 1}`}
                    sx={{
                      '& .MuiInputBase-input': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  />
                </Box>
                <IconButton size="small" onClick={() => handleDeleteRow(row.id)} sx={{ flexShrink: 0, ml: 1 }}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            size="small"
            value={newRow}
            onChange={(e) => setNewRow(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRow()}
            placeholder="添加行选项"
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" size="small" onClick={handleAddRow} startIcon={<AddIcon />}>
            添加行
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          列选项（答案）
        </Typography>
        <List dense>
          {columns.map((col, index) => (
            <ListItem key={col.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={col.text}
                    onChange={(e) => handleUpdateColumn(col.id, e.target.value)}
                    placeholder={`列 ${index + 1}`}
                    sx={{
                      '& .MuiInputBase-input': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  />
                </Box>
                <IconButton size="small" onClick={() => handleDeleteColumn(col.id)} sx={{ flexShrink: 0, ml: 1 }}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Box display="flex" gap={1} mt={1}>
          <TextField
            size="small"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
            placeholder="添加列选项"
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" size="small" onClick={handleAddColumn} startIcon={<AddIcon />}>
            添加列
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

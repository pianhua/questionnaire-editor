import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Settings,
} from '@mui/icons-material';
import { LLMProvider, APIConfig, llmService } from '../services/llmService';

interface APIConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const APIConfigDialog: React.FC<APIConfigDialogProps> = ({ open, onClose }) => {
  const [provider, setProvider] = useState<LLMProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // 加载已有配置
  useEffect(() => {
    if (open) {
      const config = llmService.getConfig();
      if (config) {
        setProvider(config.provider);
        setApiKey(config.apiKey);
        setBaseURL(config.baseURL);
      } else {
        // 设置默认值
        setProvider('openai');
        setApiKey('');
        setBaseURL('https://api.openai.com/v1');
      }
      setValidationResult(null);
    }
  }, [open]);

  const handleProviderChange = (
    _: React.MouseEvent<HTMLElement>,
    newProvider: LLMProvider | null
  ) => {
    if (newProvider) {
      setProvider(newProvider);
      setValidationResult(null);
      // 根据提供商设置默认URL
      if (newProvider === 'openai') {
        setBaseURL('https://api.openai.com/v1');
      } else {
        setBaseURL('https://api.minimax.chat/v1');
      }
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);

    const result = await llmService.validateConfig({
      provider,
      apiKey,
      baseURL,
    });

    setValidationResult(result);
    setValidating(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // 先验证
    const result = await llmService.validateConfig({
      provider,
      apiKey,
      baseURL,
    });

    if (result.valid) {
      llmService.saveConfig({ provider, apiKey, baseURL });
      setSaving(false);
      onClose();
    } else {
      setValidationResult(result);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValidationResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
        },
      }}
      TransitionProps={{
        style: {
          transitionDuration: '300ms',
        },
      }}
    >
      {/* 渐变头部 */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Settings sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            API配置
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            配置LLM服务以启用AI生成问卷功能
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* 提供商选择 */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            选择LLM提供商
          </Typography>
          <ToggleButtonGroup
            value={provider}
            exclusive
            onChange={handleProviderChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                borderRadius: '12px !important',
                border: '2px solid',
                borderColor: 'rgba(99, 102, 241, 0.12)',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: '#6366F1',
                  color: '#6366F1',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                },
              },
            }}
          >
            <ToggleButton value="openai">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                </svg>
                OpenAI
              </Box>
            </ToggleButton>
            <ToggleButton value="minimax">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                MiniMax
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Base URL */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            API地址
          </Typography>
          <TextField
            fullWidth
            value={baseURL}
            onChange={(e) => {
              setBaseURL(e.target.value);
              setValidationResult(null);
            }}
            placeholder={
              provider === 'openai'
                ? 'https://api.openai.com/v1'
                : 'https://api.minimax.chat/v1'
            }
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366F1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366F1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {provider === 'openai'
              ? 'OpenAI API地址，默认为 https://api.openai.com/v1'
              : 'MiniMax API地址，默认为 https://api.minimax.chat/v1'}
          </Typography>
        </Box>

        {/* API Key */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            API Key
          </Typography>
          <TextField
            fullWidth
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidationResult(null);
            }}
            placeholder="sk-..."
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showApiKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366F1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366F1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                },
              },
            }}
          />
        </Box>

        {/* 验证结果 */}
        {validationResult && (
          <Alert
            severity={validationResult.valid ? 'success' : 'error'}
            icon={validationResult.valid ? <CheckCircle /> : <Cancel />}
            sx={{
              borderRadius: '12px',
              animation: 'fadeIn 0.3s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {validationResult.valid
              ? '配置验证成功！'
              : validationResult.error || '配置验证失败'}
          </Alert>
        )}

        {/* 提示信息 */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            提示：您的API配置会安全地存储在浏览器的localStorage中，仅在同一浏览器中可用。
            请确保API Key有足够的调用额度。
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleValidate}
          disabled={validating || !apiKey || !baseURL}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            px: 3,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            color: '#6366F1',
            '&:hover': {
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
            },
          }}
        >
          {validating ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : null}
          {validating ? '验证中...' : '验证配置'}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleCancel}
          sx={{
            borderRadius: '12px',
            px: 3,
            color: 'text.secondary',
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !apiKey || !baseURL}
          variant="contained"
          sx={{
            borderRadius: '12px',
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            },
          }}
        >
          {saving ? (
            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
          ) : null}
          保存配置
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default APIConfigDialog;
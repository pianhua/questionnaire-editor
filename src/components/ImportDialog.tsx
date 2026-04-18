import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Fade,
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  UploadFile,
  ContentPaste,
  Close,
  CheckCircle,
  Error,
  Info,
  WifiOff,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { importQuestionnaire, getImportFormatExample } from '../services/importService';
import { Questionnaire } from '../types/questionnaire';
import { isNetworkOffline, onNetworkRestore } from '../utils/networkUtils';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (questionnaire: Questionnaire) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImportSuccess
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    questionnaire?: Questionnaire;
  } | null>(null);
  const [preview, setPreview] = useState<Questionnaire | null>(null);
  const [networkOffline, setNetworkOffline] = useState(false);

  // 网络状态监听
  useEffect(() => {
    // 初始化网络状态
    setNetworkOffline(isNetworkOffline());

    // 监听网络恢复
    const unsubscribe = onNetworkRestore(() => {
      setNetworkOffline(false);
    });

    // 监听网络断开
    const handleOffline = () => setNetworkOffline(true);
    const handleOnline = () => setNetworkOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 处理选项卡切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setResult(null);
    setPreview(null);
  };

  // 处理文件拖放
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // 检查文件类型
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setResult({
          success: false,
          error: '不支持的文件类型，请上传.json格式的文件'
        });
        return;
      }
      // 检查文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        setResult({
          success: false,
          error: '文件过大，请确保文件小于5MB'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setJsonText(e.target.result as string);
          validateImport(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setResult({
          success: false,
          error: '文件读取失败，请重试'
        });
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  // 验证导入
  const validateImport = (text: string) => {
    setImporting(true);
    setResult(null);
    setPreview(null);

    try {
      const importResult = importQuestionnaire(text);
      setResult(importResult);
      if (importResult.success && importResult.questionnaire) {
        setPreview(importResult.questionnaire);
      }
    } catch (error) {
      setResult({
        success: false,
        error: '导入失败：' + (error instanceof Error ? error.message : '未知错误')
      });
    } finally {
      setImporting(false);
    }
  };

  // 处理导入
  const handleImport = () => {
    if (result?.success && result.questionnaire) {
      onImportSuccess(result.questionnaire);
      onClose();
    }
  };

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setResult(null);
    setPreview(null);
  };

  // 处理验证按钮点击
  const handleValidate = () => {
    if (jsonText.trim()) {
      validateImport(jsonText);
    }
  };

  // 重置状态
  React.useEffect(() => {
    if (open) {
      setActiveTab(0);
      setJsonText('');
      setImporting(false);
      setResult(null);
      setPreview(null);
      setNetworkOffline(isNetworkOffline());
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      {/* 渐变头部 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 装饰圆形 */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            zIndex: 1
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <UploadFile sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              导入问卷
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              从JSON文件或文本粘贴导入问卷
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)'
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* 选项卡 */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'rgba(99, 102, 241, 0.1)'
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadFile fontSize="small" />
                <span>文件上传</span>
              </Box>
            }
            sx={{
              py: 2,
              fontWeight: 600,
              color: activeTab === 0 ? '#6366F1' : 'text.secondary',
              '&.Mui-selected': {
                color: '#6366F1'
              }
            }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContentPaste fontSize="small" />
                <span>文本粘贴</span>
              </Box>
            }
            sx={{
              py: 2,
              fontWeight: 600,
              color: activeTab === 1 ? '#6366F1' : 'text.secondary',
              '&.Mui-selected': {
                color: '#6366F1'
              }
            }}
          />
        </Tabs>

        {/* 内容 */}
        <Box sx={{ p: 3 }}>
          {/* 网络离线提示 */}
          {networkOffline && (
            <Fade in timeout={300}>
              <Alert
                severity="warning"
                icon={<WifiOff />}
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <AlertTitle>网络已断开</AlertTitle>
                请检查网络连接，导入功能需要网络支持
              </Alert>
            </Fade>
          )}

          {/* 文件上传 */}
          {activeTab === 0 && (
            <Box>
              <Paper
                {...getRootProps()}
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '2px dashed',
                  borderColor: isDragActive
                    ? '#6366F1'
                    : 'rgba(99, 102, 241, 0.2)',
                  backgroundColor: isDragActive
                    ? 'rgba(99, 102, 241, 0.05)'
                    : 'rgba(99, 102, 241, 0.02)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)'
                  }
                }}
              >
                <input {...getInputProps()} />
                <Box sx={{ py: 2 }}>
                  <UploadFile sx={{ fontSize: 48, color: '#6366F1', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {isDragActive ? '拖放文件到此处' : '点击或拖放JSON文件'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    支持 .json 文件格式
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      px: 4
                    }}
                  >
                    选择文件
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          {/* 文本粘贴 */}
          {activeTab === 1 && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={jsonText}
                onChange={handleTextChange}
                placeholder="粘贴JSON格式的问卷数据..."
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366F1'
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setJsonText(getImportFormatExample())}
                  sx={{ borderRadius: '12px' }}
                >
                  查看示例格式
                </Button>
                <Button
                  variant="contained"
                  onClick={handleValidate}
                  disabled={!jsonText.trim() || importing}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px'
                  }}
                >
                  {importing ? '验证中...' : '验证格式'}
                </Button>
              </Box>
            </Box>
          )}

          {/* 导入结果 */}
          {result && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              {result.success ? (
                <Alert
                  severity="success"
                  icon={<CheckCircle fontSize="inherit" />}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  导入格式验证成功！
                </Alert>
              ) : (
                <Alert
                  severity="error"
                  icon={<Error fontSize="inherit" />}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {result.error}
                </Alert>
              )}

              {/* 预览 */}
              {result.success && preview && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    mb: 2
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    导入预览
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    问卷标题: {preview.title}
                  </Typography>
                  {preview.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      描述: {preview.description}
                    </Typography>
                  )}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    问题数量: {preview.questions.length}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {preview.questions.slice(0, 3).map((question, index) => (
                      <Box
                        key={question.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: '8px',
                          background: 'rgba(99, 102, 241, 0.04)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {index + 1}. {question.title}
                          </Typography>
                          {question.required && (
                            <Chip
                              label="必填"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '10px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          类型: {question.type}
                        </Typography>
                      </Box>
                    ))}
                    {preview.questions.length > 3 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        ... 还有 {preview.questions.length - 3} 个问题
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {/* 操作按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button
              onClick={onClose}
              sx={{ borderRadius: '12px', px: 3 }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!result?.success}
              sx={{
                borderRadius: '12px',
                px: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)'
                },
                '&:disabled': {
                  background: 'rgba(99, 102, 241, 0.3)'
                }
              }}
            >
              导入问卷
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
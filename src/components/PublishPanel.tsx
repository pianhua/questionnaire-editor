import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { publishQuestionnaire, unpublishQuestionnaire } from '../redux/questionnaireSlice';
import QRCode from 'qrcode';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Grid,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Link as LinkIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  CheckCircle as PublishedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { validateForPublish } from '../utils/validation';

const PublishPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { questionnaires, currentQuestionnaireId } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const currentQuestionnaire = questionnaires.find((q) => q.id === currentQuestionnaireId);
  const [shareLink, setShareLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateForPublish> | null>(null);

  useEffect(() => {
    if (currentQuestionnaire?.isPublished && currentQuestionnaire?.shareLink) {
      setShareLink(currentQuestionnaire.shareLink);
      generateQRCode(currentQuestionnaire.shareLink);
    } else {
      generateShareLink();
    }

    // 运行发布前验证
    if (currentQuestionnaire) {
      const result = validateForPublish(currentQuestionnaire);
      setValidationResult(result);
    }
  }, [currentQuestionnaire]);

  const generateShareLink = () => {
    if (!currentQuestionnaire) return;

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/respond/${currentQuestionnaire.id}`;
    setShareLink(link);

    if (currentQuestionnaire.isPublished) {
      dispatch(publishQuestionnaire({ shareLink: link, qrCode: qrCodeUrl }));
    }
  };

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handlePublish = async () => {
    if (!currentQuestionnaire) return;

    // 执行发布前验证
    const result = validateForPublish(currentQuestionnaire);
    setValidationResult(result);

    if (!result.canPublish) {
      showSnackbar('请先修复问卷中的错误');
      return;
    }

    await generateQRCode(shareLink);
    dispatch(publishQuestionnaire({ shareLink, qrCode: qrCodeUrl }));
    showSnackbar('问卷已成功发布！');
  };

  const handleUnpublish = () => {
    dispatch(unpublishQuestionnaire());
    showSnackbar('问卷已取消发布');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showSnackbar('链接已复制到剪贴板');
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${currentQuestionnaire?.title || 'questionnaire'}-qrcode.png`;
    link.href = qrCodeUrl;
    link.click();
    showSnackbar('二维码已下载');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!currentQuestionnaire) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary" textAlign="center">
          请先选择一个问卷进行发布
        </Typography>
      </Paper>
    );
  }

  const isPublished = currentQuestionnaire.isPublished;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <ShareIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5">
            {isPublished ? '已发布' : '发布问卷'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPublished
              ? '您的问卷已经发布，可以分享给受访者'
              : '发布问卷以收集回答'}
          </Typography>
        </Box>
      </Box>

      {isPublished && (
        <Alert severity="success" icon={<PublishedIcon />} sx={{ mb: 3 }}>
          问卷已成功发布！分享链接让受访者参与回答。
        </Alert>
      )}

      {/* 验证结果提示 */}
      {!isPublished && validationResult && !validationResult.canPublish && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            问卷存在以下问题，无法发布：
          </Typography>
          <List dense sx={{ py: 0 }}>
            {validationResult.errors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ErrorIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {!isPublished && validationResult && validationResult.canPublish && validationResult.warnings.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            发布提示：
          </Typography>
          <List dense sx={{ py: 0 }}>
            {validationResult.warnings.map((warning, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <WarningIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText primary={warning} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                分享链接
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  value={shareLink}
                  onChange={(e) => setShareLink(e.target.value)}
                  placeholder="生成分享链接..."
                  InputProps={{
                    startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleCopyLink}
                  disabled={!shareLink}
                >
                  复制
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                二维码
              </Typography>
              {qrCodeUrl ? (
                <Box textAlign="center">
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code"
                    sx={{
                      width: 200,
                      height: 200,
                      mb: 2,
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadQR}
                  >
                    下载二维码
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  发布后即可生成二维码
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                发布状态
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">
                  {isPublished ? '已发布' : '未发布'}
                </Typography>
                <Switch
                  checked={isPublished}
                  onChange={(e) => (isPublished ? handleUnpublish() : handlePublish())}
                  color="primary"
                  disabled={!isPublished && validationResult && !validationResult.canPublish}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                {isPublished
                  ? '切换为关闭后，将无法再通过链接访问此问卷'
                  : '开启发布后，将生成可访问的链接和二维码'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                问卷信息
              </Typography>
              <Typography variant="body2" color="text.secondary">
                标题: {currentQuestionnaire.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                问题数: {currentQuestionnaire.questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                创建时间: {new Date(currentQuestionnaire.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default PublishPanel;

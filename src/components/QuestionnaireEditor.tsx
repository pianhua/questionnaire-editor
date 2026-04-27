import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  moveQuestion,
  updateQuestionnaireInfo,
  setCurrentQuestionnaire,
} from '../redux/questionnaireSlice';
import { Question, QuestionType } from '../types/questionnaire';
import QuestionFactory from '../factories/QuestionFactory';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Fade,
  Tooltip,
  Alert,
  Snackbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

import QuestionTypeSelector from './QuestionTypeSelector';
import QuestionCard from './QuestionCard';
import QuestionEditor from './editors/QuestionEditor';
import ThemeCustomizer from './ThemeCustomizer';
import EditorThemeCustomizer from './EditorThemeCustomizer';
import { useEditorTheme } from './EditorThemeProvider';
import QuestionnairePreview from './QuestionnairePreview';
import QuestionnaireForm from './QuestionnaireForm';
import PublishPanel from './PublishPanel';
import AnalysisPanel from './AnalysisPanel';
import AIGeneratePanel from './AIGeneratePanel';
import APIConfigDialog from './APIConfigDialog';
import { exportQuestionnaire } from '../services/exportService';
import { StorageService } from '../services/storageService';
import { validateQuestionnaireTitle } from '../utils/validation';

type EditorView = 'questions' | 'settings' | 'preview' | 'publish' | 'analysis' | 'form';
const storageService = new StorageService();

const QuestionnaireEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { questionnaires, currentQuestionnaireId } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const { currentTheme, setTheme } = useEditorTheme();
  const currentQuestionnaire = questionnaires.find((q) => q.id === currentQuestionnaireId);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [currentView, setCurrentView] = useState<EditorView>('questions');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'questionnaire' | 'editor'>('questionnaire');
  const [titleError, setTitleError] = useState<string>('');
  const [showAutoSaveNotice, setShowAutoSaveNotice] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const isFirstSaveEffect = useRef(true);
  const hasPendingSave = useRef(false);

  if (!currentQuestionnaire) {
    return (
      <Paper
        elevation={0}
        className="paper-container"
        sx={{ p: 4, textAlign: 'center' }}
      >
        <Typography variant="h6" color="text.secondary">
          请选择一个问卷进行编辑，或创建新问卷
        </Typography>
      </Paper>
    );
  }

  const handleAddQuestion = useCallback((type: QuestionType) => {
    try {
      const defaultQuestion = QuestionFactory.createQuestion(type);
      dispatch(addQuestion(defaultQuestion));
      setEditingQuestionId(defaultQuestion.id);
      setShowQuestionTypeSelector(false);
    } catch (error) {
      console.error('创建问题失败:', error);
    }
  }, [dispatch]);

  const handleUpdateQuestion = useCallback((question: Question) => {
    dispatch(updateQuestion(question));
  }, [dispatch]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    dispatch(deleteQuestion(questionId));
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
  }, [dispatch, editingQuestionId]);

  const handleDuplicateQuestion = useCallback((question: Question) => {
    const duplicated: Question = {
      ...JSON.parse(JSON.stringify(question)),
      id: uuidv4(),
      title: `${question.title} (副本)`,
    };
    dispatch(addQuestion(duplicated));
  }, [dispatch]);

  const handleMoveQuestion = useCallback((fromIndex: number, toIndex: number) => {
    dispatch(moveQuestion({ fromIndex, toIndex }));
  }, [dispatch]);

  const handleTitleChange = useCallback((title: string) => {
    const validation = validateQuestionnaireTitle(title);
    if (!validation.isValid && validation.error) {
      setTitleError(validation.error);
    } else {
      setTitleError('');
    }
    dispatch(updateQuestionnaireInfo({ title }));
  }, [dispatch]);

  const handleDescriptionChange = useCallback((description: string) => {
    dispatch(updateQuestionnaireInfo({ description }));
  }, [dispatch]);

  const handleBack = useCallback(() => {
    dispatch(setCurrentQuestionnaire(null));
  }, [dispatch]);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMobileViewChange = useCallback((view: EditorView) => {
    setCurrentView(view);
    setMobileOpen(false);
  }, []);

  const handleQuickAction = useCallback((view: EditorView) => {
    setCurrentView(view);
    setMobileOpen(false);
  }, []);

  // 使用 useMemo 优化 editingQuestion 计算
  const editingQuestion = useMemo(() => {
    return editingQuestionId
      ? currentQuestionnaire.questions.find((q) => q.id === editingQuestionId)
      : null;
  }, [editingQuestionId, currentQuestionnaire.questions]);

  useEffect(() => {
    if (editingQuestionId && editorRef.current) {
      const container = editorRef.current;
      const questionCard = container.querySelector(`[data-question-id="${editingQuestionId}"]`);
      if (questionCard) {
        const cardRect = questionCard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollTop = cardRect.top - containerRect.top + container.scrollTop - 100;
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [editingQuestionId]);

  useEffect(() => {
    if (isFirstSaveEffect.current) {
      isFirstSaveEffect.current = false;
      return;
    }

    hasPendingSave.current = true;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      storageService.saveQuestionnaires(questionnaires);
      hasPendingSave.current = false;
      setShowAutoSaveNotice(true);
      saveTimeoutRef.current = null;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questionnaires]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasPendingSave.current) {
        storageService.saveQuestionnaires(questionnaires);
        hasPendingSave.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [questionnaires]);

  const renderContent = () => {
    switch (currentView) {
      case 'questions':
        return (
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ overflowX: 'hidden' }}>
            <Grid item xs={12} md={editingQuestion ? 8 : 12} sx={{ pr: { md: 2 } }}>
              <Paper
                elevation={0}
                className="paper-container"
                sx={{ 
                  p: { xs: 1.5, md: 3 }, 
                  maxHeight: { xs: 'none', md: 'calc(100vh - 220px)' }, 
                  overflow: 'auto',
                  borderRadius: 3
                }}
                ref={editorRef}
              >
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={3}
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      问卷问题
                    </Typography>
                    <Chip
                      label={`${currentQuestionnaire.questions.length} 个问题`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: 'primary.main',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowQuestionTypeSelector(true)}
                    sx={{
                      borderRadius: 3,
                      px: { xs: 2, md: 3 },
                      minHeight: 48,
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    添加问题
                  </Button>
                </Box>

                {currentQuestionnaire.questions.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={6}
                    sx={{
                      backgroundColor: 'rgba(99, 102, 241, 0.04)',
                      borderRadius: 4,
                      border: '2px dashed',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      问卷还没有问题
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowQuestionTypeSelector(true)}
                      sx={{ borderRadius: 3, px: 3 }}
                    >
                      添加第一个问题
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentQuestionnaire.questions.map((question, index) => (
                      <Fade in key={question.id} timeout={400}>
                        <Box
                          className={`question-card ${editingQuestionId === question.id ? 'editing' : ''}`}
                          data-question-id={question.id}
                        >
                          <QuestionCard
                            question={question}
                            index={index}
                            onUpdate={handleUpdateQuestion}
                            onDelete={handleDeleteQuestion}
                            onDuplicate={handleDuplicateQuestion}
                            onMoveQuestion={handleMoveQuestion}
                            totalQuestions={currentQuestionnaire.questions.length}
                            onSelect={setEditingQuestionId}
                            isSelected={editingQuestionId === question.id}
                          />
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {editingQuestion && !isMobile && (
              <Grid item xs={12} md={4}>
                <Fade in timeout={300}>
                  <Box
                    sx={{
                      position: 'static',
                      backgroundColor: 'background.paper',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                      borderRadius: 3,
                      overflow: 'auto',
                      m: 0,
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={600}>
                          编辑问题
                        </Typography>
                        <IconButton
                          onClick={() => setEditingQuestionId(null)}
                          sx={{ minWidth: 48, minHeight: 48 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      <QuestionEditor
                        question={editingQuestion}
                        onChange={(q) => {
                          handleUpdateQuestion(q);
                        }}
                      />
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
        );

      case 'settings':
        return (
          <Box>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Box display="flex" gap={2}>
                <Button
                  variant={settingsTab === 'questionnaire' ? 'contained' : 'outlined'}
                  onClick={() => setSettingsTab('questionnaire')}
                  sx={{
                    borderRadius: '8px 8px 0 0',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                >
                  问卷主题
                </Button>
                <Button
                  variant={settingsTab === 'editor' ? 'contained' : 'outlined'}
                  onClick={() => setSettingsTab('editor')}
                  sx={{
                    borderRadius: '8px 8px 0 0',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                >
                  编辑器主题
                </Button>
              </Box>
            </Box>
            {settingsTab === 'questionnaire' ? (
              <ThemeCustomizer />
            ) : (
              <EditorThemeCustomizer
                currentTheme={currentTheme}
                onThemeChange={setTheme}
              />
            )}
          </Box>
        );

      case 'preview':
        return <QuestionnairePreview />;

      case 'form':
        return <QuestionnaireForm questionnaireId={currentQuestionnaireId} onSubmit={(answers) => console.log('Form submitted:', answers)} />;

      case 'publish':
        return <PublishPanel />;

      case 'analysis':
        return <AnalysisPanel />;

      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            {currentView === 'preview' || currentView === 'form' ? (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setCurrentView('questions')}
                sx={{
                  mr: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <BackIcon />
              </IconButton>
            ) : (
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleBack}
                sx={{
                  mr: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <BackIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                flex: 1,
                fontWeight: 600,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                pr: 1,
              }}
            >
              {(currentView === 'preview' || currentView === 'form') ? `${currentQuestionnaire.title} - ${currentView === 'preview' ? '预览' : '填写'}` : currentQuestionnaire.title}
            </Typography>
            {isMobile ? (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuOpen}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<PreviewIcon />}
                  onClick={() => setCurrentView('preview')}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  预览
                </Button>
                <Button
                  color="inherit"
                  startIcon={<EditIcon />}
                  onClick={() => setCurrentView('form')}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  填写
                </Button>
            <Tooltip title="AI智能生成问卷">
              <Button
                color="inherit"
                onClick={() => setShowAIPanel(true)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                  },
                }}
              >
                <AIIcon sx={{ mr: 0.5 }} />
                AI生成
              </Button>
            </Tooltip>
            <Button
              color="inherit"
              startIcon={<PublishIcon />}
              onClick={() => setCurrentView('publish')}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              发布
            </Button>
            <Button
              color="inherit"
              startIcon={<AnalyticsIcon />}
              onClick={() => setCurrentView('analysis')}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              分析
            </Button>
            <Button
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={() => setShowExportDialog(true)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              导出
            </Button>
            <Button
              color="inherit"
              startIcon={<SettingsIcon />}
              onClick={() => setCurrentView('settings')}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              设置
            </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        {isMobile && (
          <Box
            sx={{
              px: 1,
              py: 1,
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              position: 'sticky',
              top: 64,
              zIndex: 999,
            }}
          >
            <Button size="small" variant={currentView === 'questions' ? 'contained' : 'outlined'} onClick={() => handleQuickAction('questions')}>编辑</Button>
            <Button size="small" variant={currentView === 'preview' ? 'contained' : 'outlined'} onClick={() => handleQuickAction('preview')}>预览</Button>
            <Button size="small" variant={currentView === 'form' ? 'contained' : 'outlined'} onClick={() => handleQuickAction('form')}>填写</Button>
            <Button size="small" variant={currentView === 'settings' ? 'contained' : 'outlined'} onClick={() => handleQuickAction('settings')}>设置</Button>
            <Button size="small" variant="outlined" onClick={() => setShowAIPanel(true)}>AI</Button>
            <Button size="small" variant="outlined" onClick={() => setShowExportDialog(true)}>导出</Button>
          </Box>
        )}

        {/* 移动端侧边栏导航 */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleMobileMenuClose}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: 2,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                菜单
              </Typography>
              <IconButton
                onClick={handleMobileMenuClose}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('questions')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="编辑问题" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('preview')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <PreviewIcon />
                </ListItemIcon>
                <ListItemText primary="预览" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('form')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="填写" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setShowAIPanel(true)}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <AIIcon />
                </ListItemIcon>
                <ListItemText primary="AI生成" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('publish')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <PublishIcon />
                </ListItemIcon>
                <ListItemText primary="发布" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('analysis')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="分析" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setShowExportDialog(true)}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary="导出" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileViewChange('settings')}>
                <ListItemIcon sx={{ color: '#6366F1' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="设置" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box sx={{ 
        p: { xs: 1.5, md: 3 },
        pb: { xs: 2, md: 3 },
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, md: 3 },
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(99, 102, 241, 0.1)',
          }}
        >
          <TextField
            fullWidth
            value={currentQuestionnaire.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            variant="standard"
            placeholder="问卷标题"
            error={Boolean(titleError)}
            helperText={titleError}
            InputProps={{
              disableUnderline: false,
              sx: { 
                fontSize: { xs: '1.2rem', md: '1.5rem' }, 
                fontWeight: 'bold',
                whiteSpace: 'normal',
                wordBreak: 'break-word'
              },
            }}
            sx={{ mb: 1, '& .MuiInputBase-input': { px: { xs: 1, md: 0 } } }}
          />
          <TextField
            fullWidth
            value={currentQuestionnaire.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            variant="standard"
            placeholder="问卷描述（可选）"
            InputProps={{
              disableUnderline: false,
              sx: { color: 'text.secondary' },
            }}
          />
        </Paper>

        {renderContent()}
      </Box>

      {isMobile && editingQuestion && (
        <Drawer
          anchor="bottom"
          open={Boolean(editingQuestion)}
          onClose={() => setEditingQuestionId(null)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '86vh',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>编辑问题</Typography>
              <IconButton onClick={() => setEditingQuestionId(null)} sx={{ minWidth: 44, minHeight: 44 }}>
                <CloseIcon />
              </IconButton>
            </Box>
            {editingQuestion && (
              <QuestionEditor
                question={editingQuestion}
                onChange={(q) => {
                  handleUpdateQuestion(q);
                }}
              />
            )}
          </Box>
        </Drawer>
      )}

        <Dialog
          open={showQuestionTypeSelector}
          onClose={() => setShowQuestionTypeSelector(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
          sx={{
            '& .MuiDialog-container': {
              alignItems: isMobile ? 'flex-end' : 'center',
            },
            '& .MuiPaper-root': {
              borderRadius: isMobile ? '16px 16px 0 0' : '12px',
              maxHeight: isMobile ? '80vh' : '90vh',
              width: isMobile ? '100%' : 'auto',
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              选择问题类型
            </Typography>
          </DialogTitle>
          <DialogContent>
            <QuestionTypeSelector onSelect={handleAddQuestion} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setShowQuestionTypeSelector(false)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              取消
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI生成面板 */}
        <AIGeneratePanel
          open={showAIPanel}
          onClose={() => setShowAIPanel(false)}
          onQuestionsGenerated={(questions) => {
            questions.forEach((q) => dispatch(addQuestion(q)));
          }}
          onTitleGenerated={(title, description) => {
            dispatch(updateQuestionnaireInfo({ title, description }));
          }}
          onOpenConfig={() => {
            setShowAIPanel(false);
            setShowAPIConfig(true);
          }}
        />

        {/* API配置对话框 */}
      <APIConfigDialog
        open={showAPIConfig}
        onClose={() => setShowAPIConfig(false)}
      />

      <Snackbar
        open={showAutoSaveNotice}
        autoHideDuration={1500}
        onClose={() => setShowAutoSaveNotice(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowAutoSaveNotice(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          已自动保存
        </Alert>
      </Snackbar>

        {/* 导出对话框 */}
        <Dialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-container': {
              alignItems: isMobile ? 'flex-end' : 'center',
            },
            '& .MuiPaper-root': {
              borderRadius: isMobile ? '16px 16px 0 0' : '12px',
              maxHeight: isMobile ? '80vh' : '90vh',
              width: isMobile ? '100%' : 'auto',
            },
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 2.5,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DownloadIcon />
              <Typography variant="h6" fontWeight={700}>
                导出问卷
              </Typography>
            </Box>
            <IconButton
              onClick={() => setShowExportDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              选择导出格式，将问卷保存为JSON文件
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  if (currentQuestionnaire) {
                    exportQuestionnaire(currentQuestionnaire, 'standard');
                    setShowExportDialog(false);
                  }
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  py: 1.5
                }}
              >
                标准格式 (完整)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  if (currentQuestionnaire) {
                    exportQuestionnaire(currentQuestionnaire, 'simplified');
                    setShowExportDialog(false);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5
                }}
              >
                简化格式
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </DndProvider>
  );
};

export default QuestionnaireEditor;

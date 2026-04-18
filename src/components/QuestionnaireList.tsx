import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  loadQuestionnaires,
  setCurrentQuestionnaire,
  createQuestionnaire,
  removeQuestionnaire,
  duplicateQuestionnaire,
} from '../redux/questionnaireSlice';
import { StorageService } from '../services/storageService';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LibraryBooks as LibraryIcon,
} from '@mui/icons-material';
import TemplateLibrary from './TemplateLibrary';
import ImportDialog from './ImportDialog';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';

const storageService = new StorageService();

const QuestionnaireList: React.FC = () => {
  const dispatch = useDispatch();
  const { questionnaires, currentQuestionnaireId, currentView } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  useEffect(() => {
    const loadedQuestionnaires = storageService.loadQuestionnaires();
    if (loadedQuestionnaires.length > 0) {
      dispatch(loadQuestionnaires(loadedQuestionnaires));
    }
  }, [dispatch]);

  useEffect(() => {
    if (questionnaires.length > 0) {
      storageService.saveQuestionnaires(questionnaires);
    }
  }, [questionnaires]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTitle('');
  };

  const handleCreateNew = () => {
    if (newTitle.trim()) {
      dispatch(createQuestionnaire({ title: newTitle.trim() }));
      handleClose();
    }
  };

  const handleOpenQuestionnaire = (id: string) => {
    dispatch(setCurrentQuestionnaire(id));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, questionnaireId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedQuestionnaire(questionnaireId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedQuestionnaire(null);
  };

  const handleDuplicate = () => {
    if (selectedQuestionnaire) {
      dispatch(duplicateQuestionnaire(selectedQuestionnaire));
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedQuestionnaire) {
      dispatch(removeQuestionnaire(selectedQuestionnaire));
    }
    handleMenuClose();
  };

  const handleImportSuccess = (questionnaire: any) => {
    // 添加导入的问卷
    dispatch(createQuestionnaire(questionnaire));
    // 打开导入的问卷
    dispatch(setCurrentQuestionnaire(questionnaire.id));
  };

  if (currentQuestionnaireId && currentView !== 'templates') {
    return null;
  }

  if (showTemplates) {
    return (
      <Box className="paper-container" sx={{ p: 4 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Typography variant="h4" fontWeight={700} className="gradient-text" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              模板库
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              从预设模板快速创建问卷
            </Typography>
          </Box>
          <Box 
            display="flex" 
            gap={1.5}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}
          >
            <Button
              variant="outlined"
              startIcon={<LibraryIcon />}
              onClick={() => setShowTemplates(false)}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              返回列表
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => setOpenImport(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              导入问卷
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              创建问卷
            </Button>
          </Box>
        </Box>
        <TemplateLibrary />
      </Box>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        className="paper-container"
        sx={{ p: 4 }}
      >
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Typography variant="h4" fontWeight={700} className="gradient-text" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              我的问卷
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              创建和管理您的问卷
            </Typography>
          </Box>
          <Box 
            display="flex" 
            gap={1.5}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}
          >
            <Button
              variant="outlined"
              startIcon={<LibraryIcon />}
              onClick={() => setShowTemplates(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              模板库
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => setOpenImport(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              导入问卷
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
              sx={{
                borderRadius: 3,
                px: { xs: 2, md: 3 },
                minHeight: 44,
                flex: { xs: 1, sm: 'auto' },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              创建问卷
            </Button>
          </Box>
        </Box>

        {questionnaires.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            className="hover-lift"
            sx={{
              backgroundColor: 'rgba(99, 102, 241, 0.04)',
              borderRadius: 4,
              border: '2px dashed',
              borderColor: 'primary.light',
            }}
          >
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366F1'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E"
              alt="Empty"
              sx={{ width: 80, height: 80, opacity: 0.6, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              还没有创建问卷
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              点击上方按钮创建第一个问卷，或从模板库选择模板快速创建
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<LibraryIcon />}
                onClick={() => setShowTemplates(true)}
                sx={{ borderRadius: 3, px: 3 }}
              >
                浏览模板
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                sx={{ borderRadius: 3, px: 3 }}
              >
                创建问卷
              </Button>
            </Box>
          </Box>
        ) : (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questionnaires.map((questionnaire) => (
              <ListItem
                key={questionnaire.id}
                button
                onClick={() => handleOpenQuestionnaire(questionnaire.id)}
                className="questionnaire-list-item hover-lift"
                sx={{
                  p: 3,
                  backgroundColor: 'white',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, questionnaire.id)}
                    sx={{
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      },
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                        }}
                      >
                        {questionnaire.title.charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {questionnaire.title}
                        </Typography>
                        {questionnaire.isPublished && (
                          <Chip
                            label="已发布"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5, borderRadius: 1.5 }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box mt={1.5} component="div" display="block">
                      <Typography variant="caption" color="text.secondary" component="span" display="block">
                        创建于 {new Date(questionnaire.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5} component="span">
                        <Chip
                          label={`${questionnaire.questions.length} 个问题`}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1.5, height: 24 }}
                        />
                        {questionnaire.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }} component="span">
                            {questionnaire.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (selectedQuestionnaire) {
              handleOpenQuestionnaire(selectedQuestionnaire);
            }
            handleMenuClose();
          }}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
            },
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          编辑
        </MenuItem>
        <MenuItem
          onClick={handleDuplicate}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
            },
          }}
        >
          <CopyIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          复制
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          删除
        </MenuItem>
      </Menu>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            创建新问卷
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              autoFocus
              margin="dense"
              label="问卷标题"
              fullWidth
              variant="outlined"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNew();
                }
              }}
              sx={{ borderRadius: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            sx={{ borderRadius: 3, px: 3 }}
          >
            取消
          </Button>
          <Button
            onClick={handleCreateNew}
            variant="contained"
            disabled={!newTitle.trim()}
            sx={{ borderRadius: 3, px: 3 }}
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>

      <ImportDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

export default QuestionnaireList;

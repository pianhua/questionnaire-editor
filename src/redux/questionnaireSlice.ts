import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Questionnaire, Question, Theme, Answer, Template } from '../types/questionnaire';
import { v4 as uuidv4 } from 'uuid';

interface QuestionnaireState {
  questionnaires: Questionnaire[];
  currentQuestionnaireId: string | null;
  answers: Answer[];
  templates: Template[];
  loading: boolean;
  error: string | null;
  previewMode: boolean;
  currentView: 'editor' | 'preview' | 'publish' | 'analysis' | 'templates';
}

const initialState: QuestionnaireState = {
  questionnaires: [],
  currentQuestionnaireId: null,
  answers: [],
  templates: [],
  loading: false,
  error: null,
  previewMode: false,
  currentView: 'editor',
};

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    // 创建新问卷
    createQuestionnaire: (state, action: PayloadAction<{ title: string; description?: string } | Questionnaire>) => {
      let newQuestionnaire: Questionnaire;
      
      // 检查是否是完整的问卷对象
      if ('id' in action.payload && 'questions' in action.payload) {
        // 使用完整的问卷对象（用于导入）
        newQuestionnaire = action.payload as Questionnaire;
      } else {
        // 创建新问卷
        newQuestionnaire = {
          id: uuidv4(),
          title: (action.payload as { title: string }).title,
          description: (action.payload as { title: string; description?: string }).description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          questions: [],
          theme: {
            primaryColor: '#4285F4',
            secondaryColor: '#34A853',
            backgroundColor: '#FFFFFF',
            textColor: '#202124',
            font: 'Arial, sans-serif',
          },
          isPublished: false,
        };
      }
      
      state.questionnaires.push(newQuestionnaire);
      state.currentQuestionnaireId = newQuestionnaire.id;
      state.currentView = 'editor';
    },

    // 复制问卷
    duplicateQuestionnaire: (state, action: PayloadAction<string>) => {
      const original = state.questionnaires.find(q => q.id === action.payload);
      if (original) {
        const duplicate: Questionnaire = {
          ...JSON.parse(JSON.stringify(original)),
          id: uuidv4(),
          title: `${original.title} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: false,
          shareLink: undefined,
          qrCode: undefined,
        };
        state.questionnaires.push(duplicate);
      }
    },

    // 删除问卷
    removeQuestionnaire: (state, action: PayloadAction<string>) => {
      state.questionnaires = state.questionnaires.filter(q => q.id !== action.payload);
      if (state.currentQuestionnaireId === action.payload) {
        state.currentQuestionnaireId = state.questionnaires.length > 0 ? state.questionnaires[0].id : null;
      }
    },

    // 更新问卷信息
    updateQuestionnaireInfo: (state, action: PayloadAction<{ title?: string; description?: string }>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        if (action.payload.title) questionnaire.title = action.payload.title;
        if (action.payload.description !== undefined) questionnaire.description = action.payload.description;
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 设置当前问卷
setCurrentQuestionnaire: (state, action: PayloadAction<string | null>) => {
  if (action.payload === null) {
    state.currentQuestionnaireId = null;
    state.currentView = 'templates';
  } else {
    state.currentQuestionnaireId = action.payload;
    state.currentView = 'editor';
  }
},

    // 添加问题
    addQuestion: (state, action: PayloadAction<Question>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        questionnaire.questions.push(action.payload);
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 更新问题
    updateQuestion: (state, action: PayloadAction<Question>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        const index = questionnaire.questions.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          questionnaire.questions[index] = action.payload;
          questionnaire.updatedAt = new Date().toISOString();
        }
      }
    },

    // 删除问题
    deleteQuestion: (state, action: PayloadAction<string>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        questionnaire.questions = questionnaire.questions.filter(q => q.id !== action.payload);
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 移动问题位置
    moveQuestion: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        const { fromIndex, toIndex } = action.payload;
        const [removed] = questionnaire.questions.splice(fromIndex, 1);
        questionnaire.questions.splice(toIndex, 0, removed);
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 更新问卷主题
    updateTheme: (state, action: PayloadAction<Theme>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        questionnaire.theme = action.payload;
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 发布问卷
    publishQuestionnaire: (state, action: PayloadAction<{ shareLink: string; qrCode: string }>) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        questionnaire.isPublished = true;
        questionnaire.shareLink = action.payload.shareLink;
        questionnaire.qrCode = action.payload.qrCode;
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 取消发布问卷
    unpublishQuestionnaire: (state) => {
      const questionnaire = state.questionnaires.find(q => q.id === state.currentQuestionnaireId);
      if (questionnaire) {
        questionnaire.isPublished = false;
        questionnaire.updatedAt = new Date().toISOString();
      }
    },

    // 加载问卷列表
    loadQuestionnaires: (state, action: PayloadAction<Questionnaire[]>) => {
      state.questionnaires = action.payload;
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 设置当前视图
    setCurrentView: (state, action: PayloadAction<'editor' | 'preview' | 'publish' | 'analysis' | 'templates'>) => {
      state.currentView = action.payload;
    },

    // 设置预览模式
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },

    // 添加回答
    addAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },

    // 加载回答
    loadAnswers: (state, action: PayloadAction<Answer[]>) => {
      state.answers = action.payload;
    },

    // 删除回答
    deleteAnswer: (state, action: PayloadAction<string>) => {
      state.answers = state.answers.filter(a => a.id !== action.payload);
    },

    // 加载模板
    loadTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },

    // 从模板创建问卷
    createFromTemplate: (state, action: PayloadAction<{ template: Template; title: string }>) => {
      const template = action.payload.template;
      const newQuestionnaire: Questionnaire = {
        id: uuidv4(),
        title: action.payload.title,
        description: template.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions: JSON.parse(JSON.stringify(template.questions)),
        theme: {
          primaryColor: '#4285F4',
          secondaryColor: '#34A853',
          backgroundColor: '#FFFFFF',
          textColor: '#202124',
          font: 'Arial, sans-serif',
        },
        isPublished: false,
      };
      state.questionnaires.push(newQuestionnaire);
      state.currentQuestionnaireId = newQuestionnaire.id;
      state.currentView = 'editor';
    },
  },
});

export const {
  createQuestionnaire,
  duplicateQuestionnaire,
  removeQuestionnaire,
  updateQuestionnaireInfo,
  setCurrentQuestionnaire,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  moveQuestion,
  updateTheme,
  publishQuestionnaire,
  unpublishQuestionnaire,
  loadQuestionnaires,
  setLoading,
  setError,
  setCurrentView,
  setPreviewMode,
  addAnswer,
  loadAnswers,
  deleteAnswer,
  loadTemplates,
  createFromTemplate,
} = questionnaireSlice.actions;

export default questionnaireSlice.reducer;

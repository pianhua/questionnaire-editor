import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import questionnaireReducer from '../../redux/questionnaireSlice';
import { EditorThemeProvider } from '../../components/EditorThemeProvider';
import { Questionnaire, Question, QuestionType } from '../../types/questionnaire';

// Mock react-dnd
jest.mock('react-dnd', () => ({
  useDrag: () => [{
    isDragging: false
  }, jest.fn(), jest.fn()],
  useDrop: () => [{}, jest.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));

// 创建默认问卷
export const createMockQuestionnaire = (overrides = {}): Questionnaire => ({
  id: 'test-questionnaire-id',
  title: '测试问卷',
  description: '测试问卷描述',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  questions: [],
  theme: {
    primaryColor: '#4285F4',
    secondaryColor: '#34A853',
    backgroundColor: '#FFFFFF',
    textColor: '#202124',
    font: 'Arial, sans-serif',
  },
  isPublished: false,
  ...overrides,
});

// 创建测试问题
export const createMockQuestion = (overrides = {}): Question => ({
  id: 'test-question-id',
  type: QuestionType.TEXT,
  title: '测试问题',
  description: '测试问题描述',
  required: false,
  ...overrides,
});

// 创建包含问题的问卷
export const createMockQuestionnaireWithQuestions = (
  questions: Question[] = [],
  overrides = {}
): Questionnaire => {
  const defaultQuestion = createMockQuestion();
  return createMockQuestionnaire({
    questions: questions.length > 0 ? questions : [defaultQuestion],
    ...overrides,
  });
};

// 创建mock store
export const createMockStore = (initialState = {}) => {
  const defaultState = {
    questionnaire: {
      questionnaires: [createMockQuestionnaire()],
      currentQuestionnaireId: 'test-questionnaire-id',
      answers: [],
      templates: [],
      loading: false,
      error: null,
      previewMode: false,
      currentView: 'editor' as const,
      ...initialState,
    },
  };

  return configureStore({
    reducer: {
      questionnaire: questionnaireReducer,
    },
    preloadedState: defaultState,
  });
};

// Mock EditorTheme
const mockEditorTheme = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  fonts: {
    family: 'Inter, sans-serif',
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};

// Mock EditorThemeProvider context
export const mockEditorThemeContextValue = {
  currentTheme: mockEditorTheme,
  setTheme: jest.fn(),
  resetTheme: jest.fn(),
};

// 自定义render函数，包含所有必要的provider
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    editorThemeValue = mockEditorThemeContextValue,
  }: {
    preloadedState?: object;
    store?: ReturnType<typeof configureStore>;
    editorThemeValue?: object;
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <EditorThemeProvider value={editorThemeValue}>
        {children}
      </EditorThemeProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper });
};

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import questionnaireReducer from '../../redux/questionnaireSlice';
import QuestionnaireEditor from '../../components/QuestionnaireEditor';
import { Question, QuestionType, Questionnaire } from '../../types/questionnaire';
import { EditorThemeProvider } from '../../components/EditorThemeProvider';
import { defaultEditorTheme } from '../../types/editorTheme';

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

// Mock 子组件
jest.mock('../../components/QuestionTypeSelector', () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (type: string) => void }) => (
    <div data-testid="question-type-selector">
      <button onClick={() => onSelect('text')}>选择文本题</button>
      <button onClick={() => onSelect('single_choice')}>选择单选题</button>
    </div>
  ),
}));

jest.mock('../../components/editors/QuestionEditor', () => ({
  __esModule: true,
  default: ({ question, onChange }: { question: Question; onChange: (q: Question) => void }) => (
    <div data-testid="question-editor">
      <span>编辑问题: {question.title}</span>
    </div>
  ),
}));

jest.mock('../../components/QuestionnairePreview', () => ({
  __esModule: true,
  default: () => <div data-testid="questionnaire-preview">预览视图</div>,
}));

jest.mock('../../components/PublishPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="publish-panel">发布面板</div>,
}));

jest.mock('../../components/AnalysisPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="analysis-panel">分析面板</div>,
}));

jest.mock('../../components/AIGeneratePanel', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="ai-generate-panel">
        AI生成面板
        <button onClick={onClose}>关闭</button>
      </div>
    ) : null,
}));

jest.mock('../../components/APIConfigDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="api-config-dialog">
        API配置对话框
        <button onClick={onClose}>关闭</button>
      </div>
    ) : null,
}));

jest.mock('../../components/ThemeCustomizer', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-customizer">主题定制器</div>,
}));

jest.mock('../../components/EditorThemeCustomizer', () => ({
  __esModule: true,
  default: () => <div data-testid="editor-theme-customizer">编辑器主题定制器</div>,
}));

jest.mock('../../services/exportService', () => ({
  exportQuestionnaire: jest.fn(),
}));

// 创建测试问题
const createMockQuestion = (overrides = {}): Question => ({
  id: 'test-question-id',
  type: QuestionType.TEXT,
  title: '测试问题标题',
  description: '测试问题描述',
  required: false,
  ...overrides,
});

// 创建测试问卷
const createMockQuestionnaire = (overrides = {}): Questionnaire => ({
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

// Mock EditorTheme context value
const mockEditorThemeContextValue = {
  currentTheme: defaultEditorTheme,
  setTheme: jest.fn(),
};

describe('QuestionnaireEditor', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    jest.clearAllMocks();

    // 创建新的 store
    store = configureStore({
      reducer: {
        questionnaire: questionnaireReducer,
      },
      preloadedState: {
        questionnaire: {
          questionnaires: [createMockQuestionnaire()],
          currentQuestionnaireId: 'test-questionnaire-id',
          answers: [],
          templates: [],
          loading: false,
          error: null,
          previewMode: false,
          currentView: 'editor' as const,
        },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <EditorThemeProvider value={mockEditorThemeContextValue}>
          {ui}
        </EditorThemeProvider>
      </Provider>
    );
  };

  test('组件能够正常渲染', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 验证问卷标题显示
    expect(screen.getByDisplayValue('测试问卷')).toBeInTheDocument();

    // 验证问卷描述显示
    expect(screen.getByDisplayValue('测试问卷描述')).toBeInTheDocument();

    // 验证添加问题按钮显示
    expect(screen.getByText('添加问题')).toBeInTheDocument();

    // 验证问题数量显示
    expect(screen.getByText('0 个问题')).toBeInTheDocument();
  });

  test('显示空状态提示', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 验证空状态提示
    expect(screen.getByText('问卷还没有问题')).toBeInTheDocument();
    expect(screen.getByText('添加第一个问题')).toBeInTheDocument();
  });

  test('测试添加问题功能', async () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击添加问题按钮
    fireEvent.click(screen.getByText('添加问题'));

    // 验证问题类型选择器显示
    expect(screen.getByTestId('question-type-selector')).toBeInTheDocument();

    // 选择文本题类型
    fireEvent.click(screen.getByText('选择文本题'));

    // 验证对话框关闭
    await waitFor(() => {
      expect(screen.queryByTestId('question-type-selector')).not.toBeInTheDocument();
    });

    // 验证问题数量更新
    expect(screen.getByText('1 个问题')).toBeInTheDocument();
  });

  test('测试删除问题功能', async () => {
    // 创建带有问题的问卷
    const questionnaireWithQuestion = createMockQuestionnaire({
      questions: [createMockQuestion()],
    });

    store = configureStore({
      reducer: {
        questionnaire: questionnaireReducer,
      },
      preloadedState: {
        questionnaire: {
          questionnaires: [questionnaireWithQuestion],
          currentQuestionnaireId: 'test-questionnaire-id',
          answers: [],
          templates: [],
          loading: false,
          error: null,
          previewMode: false,
          currentView: 'editor' as const,
        },
      },
    });

    renderWithProviders(<QuestionnaireEditor />);

    // 验证问题数量显示
    expect(screen.getByText('1 个问题')).toBeInTheDocument();

    // 打开问题卡片菜单
    const menuButton = screen.getByTestId('MoreVertIcon').parentElement;
    expect(menuButton).toBeInTheDocument();

    if (menuButton) {
      fireEvent.click(menuButton);

      // 点击删除问题
      fireEvent.click(screen.getByText('删除问题'));
    }

    // 验证问题数量更新
    expect(screen.getByText('0 个问题')).toBeInTheDocument();
  });

  test('测试视图切换功能 - 切换到预览', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击预览按钮
    fireEvent.click(screen.getByText('预览'));

    // 验证预览视图显示
    expect(screen.getByTestId('questionnaire-preview')).toBeInTheDocument();
  });

  test('测试视图切换功能 - 切换到发布', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击发布按钮
    fireEvent.click(screen.getByText('发布'));

    // 验证发布面板显示
    expect(screen.getByTestId('publish-panel')).toBeInTheDocument();
  });

  test('测试视图切换功能 - 切换到分析', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击分析按钮
    fireEvent.click(screen.getByText('分析'));

    // 验证分析面板显示
    expect(screen.getByTestId('analysis-panel')).toBeInTheDocument();
  });

  test('测试视图切换功能 - 切换到设置', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击设置按钮
    fireEvent.click(screen.getByText('设置'));

    // 验证设置视图显示（问卷主题或编辑器主题）
    expect(
      screen.getByText('问卷主题') || screen.getByText('编辑器主题')
    ).toBeInTheDocument();
  });

  test('测试返回按钮', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 查找并点击返回按钮（AppBar 中的返回按钮）
    const backButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg') !== null
    );

    expect(backButton).toBeDefined();
  });

  test('渲染带有问题的问卷', () => {
    const questionnaireWithQuestions = createMockQuestionnaire({
      questions: [
        createMockQuestion({ id: 'q1', title: '问题1' }),
        createMockQuestion({ id: 'q2', title: '问题2' }),
      ],
    });

    store = configureStore({
      reducer: {
        questionnaire: questionnaireReducer,
      },
      preloadedState: {
        questionnaire: {
          questionnaires: [questionnaireWithQuestions],
          currentQuestionnaireId: 'test-questionnaire-id',
          answers: [],
          templates: [],
          loading: false,
          error: null,
          previewMode: false,
          currentView: 'editor' as const,
        },
      },
    });

    renderWithProviders(<QuestionnaireEditor />);

    // 验证问题数量
    expect(screen.getByText('2 个问题')).toBeInTheDocument();

    // 验证问题标题显示
    expect(screen.getByText('问题1')).toBeInTheDocument();
    expect(screen.getByText('问题2')).toBeInTheDocument();
  });

  test('测试问卷标题修改', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 获取标题输入框并修改
    const titleInput = screen.getByDisplayValue('测试问卷');
    fireEvent.change(titleInput, { target: { value: '新问卷标题' } });

    // 验证输入值变化（这会触发 onChange）
    expect((titleInput as HTMLInputElement).value).toBe('新问卷标题');
  });

  test('测试问卷描述修改', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 获取描述输入框并修改
    const descInput = screen.getByDisplayValue('测试问卷描述');
    fireEvent.change(descInput, { target: { value: '新描述' } });

    // 验证输入值变化
    expect((descInput as HTMLInputElement).value).toBe('新描述');
  });

  test('渲染无问卷时的提示', () => {
    // 创建空的 store（没有问卷）
    store = configureStore({
      reducer: {
        questionnaire: questionnaireReducer,
      },
      preloadedState: {
        questionnaire: {
          questionnaires: [],
          currentQuestionnaireId: null,
          answers: [],
          templates: [],
          loading: false,
          error: null,
          previewMode: false,
          currentView: 'templates' as const,
        },
      },
    });

    renderWithProviders(<QuestionnaireEditor />);

    // 验证提示信息
    expect(screen.getByText('请选择一个问卷进行编辑，或创建新问卷')).toBeInTheDocument();
  });

  test('测试 AI 生成面板打开', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击 AI 生成按钮
    fireEvent.click(screen.getByText('AI生成'));

    // 验证 AI 生成面板显示
    expect(screen.getByTestId('ai-generate-panel')).toBeInTheDocument();
  });

  test('测试导出对话框打开', () => {
    renderWithProviders(<QuestionnaireEditor />);

    // 点击导出按钮
    fireEvent.click(screen.getByText('导出'));

    // 验证导出对话框显示
    expect(screen.getByText('导出问卷')).toBeInTheDocument();
  });
});

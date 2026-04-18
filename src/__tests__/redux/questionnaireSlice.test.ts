import questionnaireReducer, {
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
} from '../../redux/questionnaireSlice';
import { QuestionnaireState, Question, QuestionType, Theme, Answer, Template } from '../../types/questionnaire';

// Mock uuid - 每次调用返回不同的 UUID
const mockUuid = {
  callCount: 0,
  v4: function() {
    return `mock-uuid-${++this.callCount}`;
  }
};

jest.mock('uuid', () => ({
  v4: () => mockUuid.v4(),
}));

describe('questionnaireSlice', () => {
  // 初始状态
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

  // 测试问题
  const createTestQuestion = (id: string, title: string, type: QuestionType = QuestionType.TEXT): Question => ({
    id,
    type,
    title,
    description: `问题描述-${id}`,
    required: false,
  });

  // 测试问卷
  const createTestQuestionnaire = (id: string, title: string, questions: Question[] = []): Questionnaire => ({
    id,
    title,
    description: `问卷描述-${id}`,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    questions,
    theme: {
      primaryColor: '#4285F4',
      secondaryColor: '#34A853',
      backgroundColor: '#FFFFFF',
      textColor: '#202124',
      font: 'Arial, sans-serif',
    },
    isPublished: false,
  });

  // 测试主题
  const createTestTheme = (): Theme => ({
    primaryColor: '#FF5733',
    secondaryColor: '#33FF57',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    font: 'Times New Roman',
  });

  // ============================================
  // 1. 测试初始状态
  // ============================================
  describe('初始状态', () => {
    test('应该返回正确的初始状态', () => {
      const state = questionnaireReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    test('初始状态应该包含所有必要的属性', () => {
      const state = questionnaireReducer(undefined, { type: 'unknown' });
      expect(state.questionnaires).toEqual([]);
      expect(state.currentQuestionnaireId).toBeNull();
      expect(state.answers).toEqual([]);
      expect(state.templates).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.previewMode).toBe(false);
      expect(state.currentView).toBe('editor');
    });
  });

  // ============================================
  // 2. 测试问卷相关actions
  // ============================================
  describe('问卷管理 actions', () => {
    test('createQuestionnaire - 应该创建新问卷并设置为当前问卷', () => {
      const state = questionnaireReducer(
        initialState,
        createQuestionnaire({ title: '新问卷', description: '问卷描述' })
      );

      expect(state.questionnaires).toHaveLength(1);
      expect(state.questionnaires[0].title).toBe('新问卷');
      expect(state.questionnaires[0].description).toBe('问卷描述');
      // 验证 ID 格式（mock-uuid-数字）
      expect(state.questionnaires[0].id).toMatch(/^mock-uuid-\d+$/);
      expect(state.currentQuestionnaireId).toBe(state.questionnaires[0].id);
      expect(state.currentView).toBe('editor');
      expect(state.questionnaires[0].questions).toEqual([]);
      expect(state.questionnaires[0].isPublished).toBe(false);
      expect(state.questionnaires[0].theme.primaryColor).toBe('#4285F4');
    });

    test('createQuestionnaire - 应该支持完整的问卷对象（导入功能）', () => {
      const fullQuestionnaire: Questionnaire = {
        id: 'imported-id',
        title: '导入的问卷',
        description: '导入描述',
        createdAt: '2024-06-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
        questions: [createTestQuestion('q1', '导入问题')],
        theme: createTestTheme(),
        isPublished: true,
      };

      const state = questionnaireReducer(initialState, createQuestionnaire(fullQuestionnaire));

      expect(state.questionnaires).toHaveLength(1);
      expect(state.questionnaires[0].id).toBe('imported-id');
      expect(state.questionnaires[0].title).toBe('导入的问卷');
      expect(state.questionnaires[0].questions).toHaveLength(1);
      expect(state.questionnaires[0].theme.primaryColor).toBe('#FF5733');
    });

    test('duplicateQuestionnaire - 应该复制问卷', () => {
      const stateWithQuestionnaire: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('original-id', '原始问卷')],
        currentQuestionnaireId: 'original-id',
      };

      const state = questionnaireReducer(stateWithQuestionnaire, duplicateQuestionnaire('original-id'));

      expect(state.questionnaires).toHaveLength(2);
      expect(state.questionnaires[1].title).toBe('原始问卷 (副本)');
      // 验证副本ID格式
      expect(state.questionnaires[1].id).toMatch(/^mock-uuid-\d+$/);
      expect(state.questionnaires[1].isPublished).toBe(false);
      expect(state.questionnaires[1].shareLink).toBeUndefined();
    });

    test('duplicateQuestionnaire - 当问卷不存在时不应该修改状态', () => {
      const stateWithQuestionnaire: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('existing-id', '存在的问卷')],
      };

      const state = questionnaireReducer(stateWithQuestionnaire, duplicateQuestionnaire('non-existent-id'));

      expect(state.questionnaires).toHaveLength(1);
      expect(state.questionnaires[0].id).toBe('existing-id');
    });

    test('removeQuestionnaire - 应该删除问卷', () => {
      const stateWithQuestionnaires: QuestionnaireState = {
        ...initialState,
        questionnaires: [
          createTestQuestionnaire('id1', '问卷1'),
          createTestQuestionnaire('id2', '问卷2'),
        ],
        currentQuestionnaireId: 'id1',
      };

      const state = questionnaireReducer(stateWithQuestionnaires, removeQuestionnaire('id1'));

      expect(state.questionnaires).toHaveLength(1);
      expect(state.questionnaires[0].id).toBe('id2');
      expect(state.currentQuestionnaireId).toBe('id2');
    });

    test('removeQuestionnaire - 删除当前问卷后应该切换到剩余的第一个问卷', () => {
      const stateWithQuestionnaires: QuestionnaireState = {
        ...initialState,
        questionnaires: [
          createTestQuestionnaire('id1', '问卷1'),
          createTestQuestionnaire('id2', '问卷2'),
          createTestQuestionnaire('id3', '问卷3'),
        ],
        currentQuestionnaireId: 'id2',
      };

      const state = questionnaireReducer(stateWithQuestionnaires, removeQuestionnaire('id2'));

      expect(state.currentQuestionnaireId).toBe('id1');
    });

    test('removeQuestionnaire - 删除所有问卷后 currentQuestionnaireId 应该为 null', () => {
      const stateWithOneQuestionnaire: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('only-id', '唯一问卷')],
        currentQuestionnaireId: 'only-id',
      };

      const state = questionnaireReducer(stateWithOneQuestionnaire, removeQuestionnaire('only-id'));

      expect(state.questionnaires).toHaveLength(0);
      expect(state.currentQuestionnaireId).toBeNull();
    });

    test('updateQuestionnaireInfo - 应该更新问卷信息', () => {
      const stateWithQuestionnaire: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('id1', '原始标题')],
        currentQuestionnaireId: 'id1',
      };

      const state = questionnaireReducer(
        stateWithQuestionnaire,
        updateQuestionnaireInfo({ title: '新标题', description: '新描述' })
      );

      expect(state.questionnaires[0].title).toBe('新标题');
      expect(state.questionnaires[0].description).toBe('新描述');
    });

    test('updateQuestionnaireInfo - 只更新提供的字段', () => {
      const stateWithQuestionnaire: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('id1', '原始标题', [])],
        currentQuestionnaireId: 'id1',
      };

      const originalCreatedAt = stateWithQuestionnaire.questionnaires[0].createdAt;
      const state = questionnaireReducer(
        stateWithQuestionnaire,
        updateQuestionnaireInfo({ title: '只更新标题' })
      );

      expect(state.questionnaires[0].title).toBe('只更新标题');
      expect(state.questionnaires[0].description).toBe('问卷描述-id1');
    });

    test('setCurrentQuestionnaire - 应该设置当前问卷并切换到编辑器视图', () => {
      const state = questionnaireReducer(initialState, setCurrentQuestionnaire('questionnaire-id'));

      expect(state.currentQuestionnaireId).toBe('questionnaire-id');
      expect(state.currentView).toBe('editor');
    });

    test('setCurrentQuestionnaire - 传入 null 应该切换到模板视图', () => {
      const stateWithQuestionnaire: QuestionnaireState = {
        ...initialState,
        currentQuestionnaireId: 'some-id',
        currentView: 'editor',
      };

      const state = questionnaireReducer(stateWithQuestionnaire, setCurrentQuestionnaire(null));

      expect(state.currentQuestionnaireId).toBeNull();
      expect(state.currentView).toBe('templates');
    });

    test('loadQuestionnaires - 应该加载问卷列表', () => {
      const questionnaires = [
        createTestQuestionnaire('id1', '问卷1'),
        createTestQuestionnaire('id2', '问卷2'),
      ];

      const state = questionnaireReducer(initialState, loadQuestionnaires(questionnaires));

      expect(state.questionnaires).toHaveLength(2);
      expect(state.questionnaires).toEqual(questionnaires);
    });
  });

  // ============================================
  // 3. 测试问题相关actions
  // ============================================
  describe('问题管理 actions', () => {
    const stateWithQuestionnaire: QuestionnaireState = {
      ...initialState,
      questionnaires: [createTestQuestionnaire('qid', '问卷', [])],
      currentQuestionnaireId: 'qid',
    };

    test('addQuestion - 应该添加问题到当前问卷', () => {
      const question = createTestQuestion('q1', '新问题');
      const state = questionnaireReducer(stateWithQuestionnaire, addQuestion(question));

      expect(state.questionnaires[0].questions).toHaveLength(1);
      expect(state.questionnaires[0].questions[0]).toEqual(question);
    });

    test('addQuestion - 应该更新 updatedAt 时间戳', () => {
      const question = createTestQuestion('q1', '新问题');
      const originalUpdatedAt = stateWithQuestionnaire.questionnaires[0].updatedAt;

      const state = questionnaireReducer(stateWithQuestionnaire, addQuestion(question));

      expect(state.questionnaires[0].updatedAt).not.toBe(originalUpdatedAt);
    });

    test('addQuestion - 没有当前问卷时不应该添加问题', () => {
      const question = createTestQuestion('q1', '新问题');
      const state = questionnaireReducer(initialState, addQuestion(question));

      expect(state.questionnaires).toHaveLength(0);
    });

    test('updateQuestion - 应该更新问题', () => {
      const existingQuestion = createTestQuestion('q1', '原始问题');
      const stateWithQuestion: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', [existingQuestion])],
        currentQuestionnaireId: 'qid',
      };

      const updatedQuestion = { ...existingQuestion, title: '更新后的问题' };
      const state = questionnaireReducer(stateWithQuestion, updateQuestion(updatedQuestion));

      expect(state.questionnaires[0].questions[0].title).toBe('更新后的问题');
    });

    test('updateQuestion - 问题不存在时不应该修改状态', () => {
      const existingQuestion = createTestQuestion('q1', '原始问题');
      const stateWithQuestion: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', [existingQuestion])],
        currentQuestionnaireId: 'qid',
      };

      const nonExistentQuestion = createTestQuestion('non-existent', '不存在的问题');
      const state = questionnaireReducer(stateWithQuestion, updateQuestion(nonExistentQuestion));

      expect(state.questionnaires[0].questions).toHaveLength(1);
      expect(state.questionnaires[0].questions[0].id).toBe('q1');
    });

    test('deleteQuestion - 应该删除问题', () => {
      const questions = [
        createTestQuestion('q1', '问题1'),
        createTestQuestion('q2', '问题2'),
        createTestQuestion('q3', '问题3'),
      ];
      const stateWithQuestions: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      const state = questionnaireReducer(stateWithQuestions, deleteQuestion('q2'));

      expect(state.questionnaires[0].questions).toHaveLength(2);
      expect(state.questionnaires[0].questions.find(q => q.id === 'q2')).toBeUndefined();
    });

    test('deleteQuestion - 删除所有问题后问卷应该为空', () => {
      const questions = [createTestQuestion('q1', '唯一的问题')];
      const stateWithOneQuestion: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      const state = questionnaireReducer(stateWithOneQuestion, deleteQuestion('q1'));

      expect(state.questionnaires[0].questions).toHaveLength(0);
    });

    test('moveQuestion - 向前移动问题', () => {
      const questions = [
        createTestQuestion('q1', '问题1'),
        createTestQuestion('q2', '问题2'),
        createTestQuestion('q3', '问题3'),
      ];
      const stateWithQuestions: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      // 将问题从索引2移动到索引0
      const state = questionnaireReducer(stateWithQuestions, moveQuestion({ fromIndex: 2, toIndex: 0 }));

      expect(state.questionnaires[0].questions[0].id).toBe('q3');
      expect(state.questionnaires[0].questions[1].id).toBe('q1');
      expect(state.questionnaires[0].questions[2].id).toBe('q2');
    });

    test('moveQuestion - 向后移动问题', () => {
      const questions = [
        createTestQuestion('q1', '问题1'),
        createTestQuestion('q2', '问题2'),
        createTestQuestion('q3', '问题3'),
      ];
      const stateWithQuestions: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      // 将问题从索引0移动到索引2
      const state = questionnaireReducer(stateWithQuestions, moveQuestion({ fromIndex: 0, toIndex: 2 }));

      expect(state.questionnaires[0].questions[0].id).toBe('q2');
      expect(state.questionnaires[0].questions[1].id).toBe('q3');
      expect(state.questionnaires[0].questions[2].id).toBe('q1');
    });

    test('moveQuestion - 相同位置移动不应该改变顺序', () => {
      const questions = [
        createTestQuestion('q1', '问题1'),
        createTestQuestion('q2', '问题2'),
      ];
      const stateWithQuestions: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      const state = questionnaireReducer(stateWithQuestions, moveQuestion({ fromIndex: 0, toIndex: 0 }));

      expect(state.questionnaires[0].questions[0].id).toBe('q1');
      expect(state.questionnaires[0].questions[1].id).toBe('q2');
    });
  });

  // ============================================
  // 4. 测试主题和发布相关actions
  // ============================================
  describe('主题和发布 actions', () => {
    const stateWithQuestionnaire: QuestionnaireState = {
      ...initialState,
      questionnaires: [createTestQuestionnaire('qid', '问卷', [])],
      currentQuestionnaireId: 'qid',
    };

    test('updateTheme - 应该更新问卷主题', () => {
      const newTheme = createTestTheme();
      const state = questionnaireReducer(stateWithQuestionnaire, updateTheme(newTheme));

      expect(state.questionnaires[0].theme).toEqual(newTheme);
    });

    test('publishQuestionnaire - 应该发布问卷', () => {
      const state = questionnaireReducer(
        stateWithQuestionnaire,
        publishQuestionnaire({ shareLink: 'https://example.com/123', qrCode: 'qr-code-data' })
      );

      expect(state.questionnaires[0].isPublished).toBe(true);
      expect(state.questionnaires[0].shareLink).toBe('https://example.com/123');
      expect(state.questionnaires[0].qrCode).toBe('qr-code-data');
    });

    test('unpublishQuestionnaire - 应该取消发布问卷', () => {
      const publishedState: QuestionnaireState = {
        ...stateWithQuestionnaire,
        questionnaires: [{
          ...stateWithQuestionnaire.questionnaires[0],
          isPublished: true,
          shareLink: 'https://example.com/123',
          qrCode: 'qr-code-data',
        }],
      };

      const state = questionnaireReducer(publishedState, unpublishQuestionnaire());

      expect(state.questionnaires[0].isPublished).toBe(false);
      // 注意: reducer 只设置 isPublished 为 false，不会删除 shareLink 和 qrCode
    });
  });

  // ============================================
  // 5. 测试UI状态相关actions
  // ============================================
  describe('UI状态 actions', () => {
    test('setLoading - 应该设置加载状态', () => {
      const state = questionnaireReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);

      const state2 = questionnaireReducer(state, setLoading(false));
      expect(state2.loading).toBe(false);
    });

    test('setError - 应该设置错误信息', () => {
      const state = questionnaireReducer(initialState, setError('发生错误'));
      expect(state.error).toBe('发生错误');

      const state2 = questionnaireReducer(state, setError(null));
      expect(state2.error).toBeNull();
    });

    test('setCurrentView - 应该设置当前视图', () => {
      const state = questionnaireReducer(initialState, setCurrentView('preview'));
      expect(state.currentView).toBe('preview');
    });

    test('setPreviewMode - 应该设置预览模式', () => {
      const state = questionnaireReducer(initialState, setPreviewMode(true));
      expect(state.previewMode).toBe(true);

      const state2 = questionnaireReducer(state, setPreviewMode(false));
      expect(state2.previewMode).toBe(false);
    });
  });

  // ============================================
  // 6. 测试回答相关actions
  // ============================================
  describe('回答管理 actions', () => {
    test('addAnswer - 应该添加回答', () => {
      const answer: Answer = {
        id: 'answer-id',
        questionnaireId: 'questionnaire-id',
        submittedAt: '2024-01-01T00:00:00.000Z',
        responses: { q1: '回答内容' },
      };

      const state = questionnaireReducer(initialState, addAnswer(answer));

      expect(state.answers).toHaveLength(1);
      expect(state.answers[0]).toEqual(answer);
    });

    test('loadAnswers - 应该加载回答列表', () => {
      const answers: Answer[] = [
        {
          id: 'answer1',
          questionnaireId: 'q1',
          submittedAt: '2024-01-01T00:00:00.000Z',
          responses: {},
        },
        {
          id: 'answer2',
          questionnaireId: 'q1',
          submittedAt: '2024-01-02T00:00:00.000Z',
          responses: {},
        },
      ];

      const state = questionnaireReducer(initialState, loadAnswers(answers));

      expect(state.answers).toHaveLength(2);
      expect(state.answers).toEqual(answers);
    });

    test('deleteAnswer - 应该删除回答', () => {
      const stateWithAnswers: QuestionnaireState = {
        ...initialState,
        answers: [
          { id: 'a1', questionnaireId: 'q1', submittedAt: '2024-01-01', responses: {} },
          { id: 'a2', questionnaireId: 'q1', submittedAt: '2024-01-02', responses: {} },
        ],
      };

      const state = questionnaireReducer(stateWithAnswers, deleteAnswer('a1'));

      expect(state.answers).toHaveLength(1);
      expect(state.answers[0].id).toBe('a2');
    });
  });

  // ============================================
  // 7. 测试模板相关actions
  // ============================================
  describe('模板管理 actions', () => {
    test('loadTemplates - 应该加载模板列表', () => {
      const templates: Template[] = [
        {
          id: 't1',
          title: '模板1',
          description: '模板描述1',
          questions: [],
          category: '调查',
        },
        {
          id: 't2',
          title: '模板2',
          description: '模板描述2',
          questions: [],
          category: '问卷',
        },
      ];

      const state = questionnaireReducer(initialState, loadTemplates(templates));

      expect(state.templates).toHaveLength(2);
      expect(state.templates).toEqual(templates);
    });

    test('createFromTemplate - 应该从模板创建问卷', () => {
      const template: Template = {
        id: 'template-id',
        title: '模板标题',
        description: '模板描述',
        questions: [
          createTestQuestion('tq1', '模板问题1'),
          createTestQuestion('tq2', '模板问题2'),
        ],
        category: '调查',
      };

      const state = questionnaireReducer(
        initialState,
        createFromTemplate({ template, title: '新问卷标题' })
      );

      expect(state.questionnaires).toHaveLength(1);
      expect(state.questionnaires[0].title).toBe('新问卷标题');
      expect(state.questionnaires[0].description).toBe('模板描述');
      expect(state.questionnaires[0].questions).toHaveLength(2);
      expect(state.questionnaires[0].questions[0].title).toBe('模板问题1');
      // 验证 ID 格式
      expect(state.questionnaires[0].id).toMatch(/^mock-uuid-\d+$/);
      expect(state.currentQuestionnaireId).toBe(state.questionnaires[0].id);
      expect(state.currentView).toBe('editor');
      expect(state.questionnaires[0].isPublished).toBe(false);
    });
  });

  // ============================================
  // 8. 测试复杂场景
  // ============================================
  describe('复杂场景测试', () => {
    test('创建问卷 -> 添加多个问题 -> 排序 -> 删除中间问题', () => {
      // 步骤1: 创建问卷
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '复杂测试问卷' }));
      const questionnaireId = state.currentQuestionnaireId;

      expect(state.questionnaires).toHaveLength(1);

      // 步骤2: 添加多个问题
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q1', '问题1')));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q2', '问题2')));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q3', '问题3')));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q4', '问题4')));

      expect(state.questionnaires[0].questions).toHaveLength(4);

      // 步骤3: 移动问题排序 (把q4移到最前面)
      state = questionnaireReducer(state, moveQuestion({ fromIndex: 3, toIndex: 0 }));

      expect(state.questionnaires[0].questions[0].id).toBe('q4');
      expect(state.questionnaires[0].questions[1].id).toBe('q1');
      expect(state.questionnaires[0].questions[2].id).toBe('q2');
      expect(state.questionnaires[0].questions[3].id).toBe('q3');

      // 步骤4: 删除中间问题 (q2)
      state = questionnaireReducer(state, deleteQuestion('q2'));

      expect(state.questionnaires[0].questions).toHaveLength(3);
      expect(state.questionnaires[0].questions.find(q => q.id === 'q2')).toBeUndefined();

      // 验证最终顺序
      expect(state.questionnaires[0].questions[0].id).toBe('q4');
      expect(state.questionnaires[0].questions[1].id).toBe('q1');
      expect(state.questionnaires[0].questions[2].id).toBe('q3');
    });

    test('创建多个问卷 -> 切换当前问卷 -> 在当前问卷添加问题', () => {
      // 步骤1: 创建多个问卷
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '问卷A' }));
      const questionnaireAId = state.currentQuestionnaireId;
      state = questionnaireReducer(state, createQuestionnaire({ title: '问卷B' }));
      state = questionnaireReducer(state, createQuestionnaire({ title: '问卷C' }));
      const questionnaireCId = state.currentQuestionnaireId;

      expect(state.questionnaires).toHaveLength(3);
      expect(state.currentQuestionnaireId).toBe(questionnaireCId); // 最后创建的是C

      // 步骤2: 切换到问卷A
      state = questionnaireReducer(state, setCurrentQuestionnaire(questionnaireAId));
      expect(state.currentQuestionnaireId).toBe(questionnaireAId);

      // 步骤3: 在问卷A中添加问题
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q1', '问卷A的问题')));

      // 验证只有问卷A有这个问题
      const questionnaireA = state.questionnaires.find(q => q.id === questionnaireAId);
      const questionnaireB = state.questionnaires.find(q => q.id !== questionnaireAId && q.id !== questionnaireCId);

      expect(questionnaireA?.questions).toHaveLength(1);
      expect(questionnaireB?.questions).toHaveLength(0);
    });

    test('创建问卷 -> 发布 -> 取消发布 -> 更新主题', () => {
      // 步骤1: 创建问卷
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '发布测试' }));

      // 步骤2: 发布
      state = questionnaireReducer(
        state,
        publishQuestionnaire({ shareLink: 'http://test.com/abc', qrCode: 'qr' })
      );
      expect(state.questionnaires[0].isPublished).toBe(true);
      expect(state.questionnaires[0].shareLink).toBe('http://test.com/abc');

      // 步骤3: 取消发布
      state = questionnaireReducer(state, unpublishQuestionnaire());
      expect(state.questionnaires[0].isPublished).toBe(false);

      // 步骤4: 更新主题
      const newTheme = createTestTheme();
      state = questionnaireReducer(state, updateTheme(newTheme));
      expect(state.questionnaires[0].theme).toEqual(newTheme);
    });

    test('复制问卷 -> 验证副本与原版独立', () => {
      // 创建带问题的问卷
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '原始问卷' }));
      const originalId = state.currentQuestionnaireId;
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q1', '原始问题')));

      // 复制问卷
      state = questionnaireReducer(state, duplicateQuestionnaire(originalId));

      const original = state.questionnaires.find(q => q.title === '原始问卷');
      const duplicate = state.questionnaires.find(q => q.title === '原始问卷 (副本)');

      // 验证副本与原版数据独立
      expect(original?.id).not.toBe(duplicate?.id);
      expect(original?.questions).toHaveLength(1);
      expect(duplicate?.questions).toHaveLength(1);
      expect(duplicate?.isPublished).toBe(false);

      // 验证修改副本不影响原版
      state = questionnaireReducer(state, setCurrentQuestionnaire(duplicate!.id));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q2', '副本新增问题')));

      // 重新从最新state获取副本和原版
      const updatedOriginal = state.questionnaires.find(q => q.title === '原始问卷');
      const updatedDuplicate = state.questionnaires.find(q => q.title === '原始问卷 (副本)');

      expect(updatedDuplicate?.questions).toHaveLength(2);
      expect(updatedOriginal?.questions).toHaveLength(1);
    });

    test('添加问题 -> 更新问题内容 -> 验证更新', () => {
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '更新测试' }));

      // 添加问题
      const originalQuestion = createTestQuestion('q1', '原始标题');
      state = questionnaireReducer(state, addQuestion(originalQuestion));

      // 更新问题
      const updatedQuestion = {
        ...originalQuestion,
        title: '更新后的标题',
        description: '更新后的描述',
        required: true,
      };
      state = questionnaireReducer(state, updateQuestion(updatedQuestion));

      const question = state.questionnaires[0].questions[0];
      expect(question.title).toBe('更新后的标题');
      expect(question.description).toBe('更新后的描述');
      expect(question.required).toBe(true);
    });

    test('完整的工作流: 创建 -> 添加问题 -> 排序 -> 发布', () => {
      // 1. 创建问卷
      let state = questionnaireReducer(initialState, createQuestionnaire({ title: '工作流测试' }));

      // 2. 添加不同类型的问题
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q1', '文本题', QuestionType.TEXT)));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q2', '单选题', QuestionType.SINGLE_CHOICE)));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q3', '多选题', QuestionType.MULTIPLE_CHOICE)));
      state = questionnaireReducer(state, addQuestion(createTestQuestion('q4', '评分题', QuestionType.RATING)));

      expect(state.questionnaires[0].questions).toHaveLength(4);
      expect(state.questionnaires[0].questions[0].type).toBe(QuestionType.TEXT);
      expect(state.questionnaires[0].questions[3].type).toBe(QuestionType.RATING);

      // 3. 移动排序
      state = questionnaireReducer(state, moveQuestion({ fromIndex: 0, toIndex: 3 }));
      expect(state.questionnaires[0].questions[0].type).toBe(QuestionType.SINGLE_CHOICE);
      expect(state.questionnaires[0].questions[3].type).toBe(QuestionType.TEXT);

      // 4. 发布
      state = questionnaireReducer(
        state,
        publishQuestionnaire({ shareLink: 'http://workflow.test', qrCode: 'workflow-qr' })
      );
      expect(state.questionnaires[0].isPublished).toBe(true);
      expect(state.questionnaires[0].shareLink).toBe('http://workflow.test');
    });
  });

  // ============================================
  // 9. 测试 Immer 不可变性
  // ============================================
  describe('Immer 不可变性验证', () => {
    test('原始状态不应该被修改', () => {
      const originalState = { ...initialState };
      const state = questionnaireReducer(
        initialState,
        createQuestionnaire({ title: 'Immutable Test' })
      );

      // 验证原始状态没有被修改
      expect(initialState.questionnaires).toEqual([]);
      expect(initialState.currentQuestionnaireId).toBeNull();
      expect(state).not.toBe(initialState);
    });

    test('问题数组操作不应该修改原始数组', () => {
      const questions = [
        createTestQuestion('q1', '问题1'),
        createTestQuestion('q2', '问题2'),
      ];
      const stateWithQuestions: QuestionnaireState = {
        ...initialState,
        questionnaires: [createTestQuestionnaire('qid', '问卷', questions)],
        currentQuestionnaireId: 'qid',
      };

      const originalQuestions = [...stateWithQuestions.questionnaires[0].questions];
      const state = questionnaireReducer(stateWithQuestions, addQuestion(createTestQuestion('q3', '问题3')));

      // 验证原始数组没有被修改
      expect(stateWithQuestions.questionnaires[0].questions).toEqual(originalQuestions);
      expect(state.questionnaires[0].questions).toHaveLength(3);
    });
  });

  // ============================================
  // 10. Selectors 模拟测试
  // ============================================
  describe('Selectors (手动实现)', () => {
    const stateWithData: QuestionnaireState = {
      questionnaires: [
        createTestQuestionnaire('q1', '问卷1', [createTestQuestion('q1q1', '问题1')]),
        createTestQuestionnaire('q2', '问卷2', [createTestQuestion('q2q1', '问题2')]),
      ],
      currentQuestionnaireId: 'q1',
      answers: [
        { id: 'a1', questionnaireId: 'q1', submittedAt: '2024-01-01', responses: {} },
        { id: 'a2', questionnaireId: 'q2', submittedAt: '2024-01-02', responses: {} },
      ],
      templates: [],
      loading: false,
      error: null,
      previewMode: false,
      currentView: 'editor',
    };

    test('selectCurrentQuestionnaire - 获取当前问卷', () => {
      const currentQuestionnaire = stateWithData.questionnaires.find(
        q => q.id === stateWithData.currentQuestionnaireId
      );
      expect(currentQuestionnaire?.title).toBe('问卷1');
    });

    test('selectPublishedQuestionnaires - 获取已发布的问卷', () => {
      const publishedQuestionnaires = stateWithData.questionnaires.filter(q => q.isPublished);
      expect(publishedQuestionnaires).toHaveLength(0);
    });

    test('selectAnswersByQuestionnaireId - 获取指定问卷的回答', () => {
      const questionnaireId = 'q1';
      const answers = stateWithData.answers.filter(a => a.questionnaireId === questionnaireId);
      expect(answers).toHaveLength(1);
      expect(answers[0].id).toBe('a1');
    });

    test('selectQuestionnaireById - 通过ID获取问卷', () => {
      const questionnaire = stateWithData.questionnaires.find(q => q.id === 'q2');
      expect(questionnaire?.title).toBe('问卷2');
    });

    test('selectAllQuestionnaireTitles - 获取所有问卷标题列表', () => {
      const titles = stateWithData.questionnaires.map(q => q.title);
      expect(titles).toEqual(['问卷1', '问卷2']);
    });

    test('selectQuestionCount - 获取当前问卷的问题数量', () => {
      const currentQuestionnaire = stateWithData.questionnaires.find(
        q => q.id === stateWithData.currentQuestionnaireId
      );
      expect(currentQuestionnaire?.questions.length).toBe(1);
    });
  });
});
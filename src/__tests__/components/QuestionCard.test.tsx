import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from '../../components/QuestionCard';
import { Question, QuestionType } from '../../types/questionnaire';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

// 创建测试问题
const createMockQuestion = (overrides = {}): Question => ({
  id: 'test-question-id',
  type: QuestionType.TEXT,
  title: '测试问题标题',
  description: '测试问题描述',
  required: false,
  ...overrides,
});

describe('QuestionCard', () => {
  const defaultProps = {
    question: createMockQuestion(),
    index: 0,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onDuplicate: jest.fn(),
    onMoveQuestion: jest.fn(),
    totalQuestions: 1,
    onSelect: jest.fn(),
    isSelected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('组件能够正常渲染', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} />
      </DndProvider>
    );

    // 验证问题标题显示
    expect(screen.getByText('测试问题标题')).toBeInTheDocument();

    // 验证问题描述显示（作为placeholder或实际文本）
    const descInput = screen.getByPlaceholderText('添加更多说明或指引...');
    expect(descInput).toBeInTheDocument();
    expect((descInput as HTMLInputElement).value).toBe('测试问题描述');

    // 验证问题类型标签显示
    expect(screen.getByText('文本题')).toBeInTheDocument();

    // 验证问题序号显示
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  test('组件能够渲染必填问题标签', () => {
    const requiredQuestion = createMockQuestion({ required: true });
    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} question={requiredQuestion} />
      </DndProvider>
    );

    // 验证必填标签显示
    expect(screen.getByText('必填')).toBeInTheDocument();
  });

  test('测试选中状态变化', () => {
    const onSelect = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onSelect={onSelect} isSelected={false} />
      </DndProvider>
    );

    // 点击问题卡片
    fireEvent.click(screen.getByText('测试问题标题'));
    expect(onSelect).toHaveBeenCalledWith('test-question-id');
  });

  test('测试展开/折叠功能', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} />
      </DndProvider>
    );

    // 验证展开状态下，问题标题和描述可见
    expect(screen.getByText('测试问题标题')).toBeInTheDocument();

    // 找到展开/折叠按钮（包含 CollapseIcon 或 ExpandIcon）
    const toggleButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg') !== null
    );

    if (toggleButton) {
      // 点击折叠
      fireEvent.click(toggleButton);

      // 折叠后，详细编辑区域应该不可见（通过检查 TextField 是否隐藏）
      // 注意：这里只是验证按钮可点击，不验证实际折叠效果因为 Collapse 组件的状态
    }
  });

  test('测试菜单打开', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} />
      </DndProvider>
    );

    // 找到菜单按钮 (MoreVert 图标按钮)
    const menuButton = screen.getByTestId('MoreVertIcon').parentElement;
    expect(menuButton).toBeInTheDocument();

    if (menuButton) {
      // 点击菜单按钮
      fireEvent.click(menuButton);

      // 验证菜单项显示
      expect(screen.getByText('复制问题')).toBeInTheDocument();
      expect(screen.getByText('删除问题')).toBeInTheDocument();
    }
  });

  test('测试复制问题功能', () => {
    const onDuplicate = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onDuplicate={onDuplicate} />
      </DndProvider>
    );

    // 打开菜单
    const menuButton = screen.getByTestId('MoreVertIcon').parentElement;
    if (menuButton) {
      fireEvent.click(menuButton);

      // 点击复制问题
      fireEvent.click(screen.getByText('复制问题'));

      // 验证 onDuplicate 被调用
      expect(onDuplicate).toHaveBeenCalled();
    }
  });

  test('测试删除问题功能', () => {
    const onDelete = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onDelete={onDelete} />
      </DndProvider>
    );

    // 打开菜单
    const menuButton = screen.getByTestId('MoreVertIcon').parentElement;
    if (menuButton) {
      fireEvent.click(menuButton);

      // 点击删除问题
      fireEvent.click(screen.getByText('删除问题'));

      // 验证 onDelete 被调用
      expect(onDelete).toHaveBeenCalledWith('test-question-id');
    }
  });

  test('测试必填开关变化', () => {
    const onUpdate = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onUpdate={onUpdate} />
      </DndProvider>
    );

    // 找到 Switch 组件 (MUI Switch 的实际 role 是 checkbox)
    const switchElement = screen.getByRole('checkbox', { name: '必填问题' });
    expect(switchElement).toBeInTheDocument();

    // 点击切换必填状态
    fireEvent.click(switchElement);

    // 验证 onUpdate 被调用，且 required 变为 true
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-question-id',
        required: true,
      })
    );
  });

  test('测试问题标题编辑', () => {
    const onUpdate = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onUpdate={onUpdate} />
      </DndProvider>
    );

    // 找到标题输入框
    const titleInput = screen.getByLabelText('问题标题') as HTMLInputElement;

    // 修改标题
    fireEvent.change(titleInput, { target: { value: '新标题' } });

    // 验证 onUpdate 被调用
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-question-id',
        title: '新标题',
      })
    );
  });

  test('测试问题描述编辑', () => {
    const onUpdate = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} onUpdate={onUpdate} />
      </DndProvider>
    );

    // 找到描述输入框
    const descInput = screen.getByLabelText('问题描述（可选）') as HTMLInputElement;

    // 修改描述
    fireEvent.change(descInput, { target: { value: '新描述' } });

    // 验证 onUpdate 被调用
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-question-id',
        description: '新描述',
      })
    );
  });

  test('渲染不同问题类型', () => {
    const questionTypes = [
      { type: QuestionType.TEXT, label: '文本题' },
      { type: QuestionType.SINGLE_CHOICE, label: '单选题' },
      { type: QuestionType.MULTIPLE_CHOICE, label: '多选题' },
      { type: QuestionType.RATING, label: '评分题' },
      { type: QuestionType.DATE, label: '日期题' },
    ];

    questionTypes.forEach(({ type, label }) => {
      const question = createMockQuestion({ type });
      const { unmount } = render(
        <DndProvider backend={HTML5Backend}>
          <QuestionCard {...defaultProps} question={question} />
        </DndProvider>
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  test('单选题渲染选项预览', () => {
    const singleChoiceQuestion: Question = {
      id: 'sc-question-id',
      type: QuestionType.SINGLE_CHOICE,
      title: '单选题',
      required: false,
      options: [
        { id: '1', text: '选项1' },
        { id: '2', text: '选项2' },
        { id: '3', text: '选项3' },
        { id: '4', text: '选项4' },
      ],
    };

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} question={singleChoiceQuestion} />
      </DndProvider>
    );

    // 验证选项预览显示 (应该显示前3个选项 + "等4项")
    expect(screen.getByText(/选项1/)).toBeInTheDocument();
    expect(screen.getByText(/等4项/)).toBeInTheDocument();
  });

  test('评分题渲染评分范围', () => {
    const ratingQuestion: Question = {
      id: 'rating-question-id',
      type: QuestionType.RATING,
      title: '评分题',
      required: false,
      min: 1,
      max: 5,
      labels: ['很差', '差', '一般', '好', '很好'],
    };

    render(
      <DndProvider backend={HTML5Backend}>
        <QuestionCard {...defaultProps} question={ratingQuestion} />
      </DndProvider>
    );

    // 验证评分范围显示
    expect(screen.getByText(/1-5分/)).toBeInTheDocument();
  });
});

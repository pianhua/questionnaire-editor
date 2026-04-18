import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionTypeSelector from '../../components/QuestionTypeSelector';
import { QuestionType } from '../../types/questionnaire';

describe('QuestionTypeSelector', () => {
  const defaultProps = {
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('组件能够正常渲染', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 验证标题显示
    expect(screen.getByText('选择问题类型')).toBeInTheDocument();

    // 验证副标题显示
    expect(screen.getByText('点击下方卡片选择要添加的问题类型')).toBeInTheDocument();
  });

  test('渲染所有9种问题类型', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 验证所有问题类型标签显示
    expect(screen.getByText('文本题')).toBeInTheDocument();
    expect(screen.getByText('单选题')).toBeInTheDocument();
    expect(screen.getByText('多选题')).toBeInTheDocument();
    expect(screen.getByText('矩阵题')).toBeInTheDocument();
    expect(screen.getByText('排序题')).toBeInTheDocument();
    expect(screen.getByText('文件上传')).toBeInTheDocument();
    expect(screen.getByText('评分题')).toBeInTheDocument();
    expect(screen.getByText('日期题')).toBeInTheDocument();
    expect(screen.getByText('时间题')).toBeInTheDocument();
  });

  test('测试问题类型选择功能 - 选择文本题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击文本题卡片
    fireEvent.click(screen.getByText('文本题'));

    // 验证 onSelect 被调用，参数为文本题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.TEXT);
  });

  test('测试问题类型选择功能 - 选择单选题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击单选题卡片
    fireEvent.click(screen.getByText('单选题'));

    // 验证 onSelect 被调用，参数为单选题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.SINGLE_CHOICE);
  });

  test('测试问题类型选择功能 - 选择多选题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击多选题卡片
    fireEvent.click(screen.getByText('多选题'));

    // 验证 onSelect 被调用，参数为多选题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.MULTIPLE_CHOICE);
  });

  test('测试问题类型选择功能 - 选择矩阵题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击矩阵题卡片
    fireEvent.click(screen.getByText('矩阵题'));

    // 验证 onSelect 被调用，参数为矩阵题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.MATRIX);
  });

  test('测试问题类型选择功能 - 选择排序题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击排序题卡片
    fireEvent.click(screen.getByText('排序题'));

    // 验证 onSelect 被调用，参数为排序题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.RANKING);
  });

  test('测试问题类型选择功能 - 选择文件上传', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击文件上传卡片
    fireEvent.click(screen.getByText('文件上传'));

    // 验证 onSelect 被调用，参数为文件上传类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.FILE_UPLOAD);
  });

  test('测试问题类型选择功能 - 选择评分题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击评分题卡片
    fireEvent.click(screen.getByText('评分题'));

    // 验证 onSelect 被调用，参数为评分题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.RATING);
  });

  test('测试问题类型选择功能 - 选择日期题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击日期题卡片
    fireEvent.click(screen.getByText('日期题'));

    // 验证 onSelect 被调用，参数为日期题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.DATE);
  });

  test('测试问题类型选择功能 - 选择时间题', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击时间题卡片
    fireEvent.click(screen.getByText('时间题'));

    // 验证 onSelect 被调用，参数为时间题类型
    expect(defaultProps.onSelect).toHaveBeenCalledWith(QuestionType.TIME);
  });

  test('渲染问题类型描述', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 验证各问题类型的描述显示
    expect(screen.getByText('简短文本或段落回答')).toBeInTheDocument();
    expect(screen.getByText('从多个选项中选择一个')).toBeInTheDocument();
    expect(screen.getByText('从多个选项中选择多个')).toBeInTheDocument();
    expect(screen.getByText('行列矩阵选择题')).toBeInTheDocument();
    expect(screen.getByText('对选项进行排序')).toBeInTheDocument();
    expect(screen.getByText('上传文件或图片')).toBeInTheDocument();
    expect(screen.getByText('星级评分或数字评分')).toBeInTheDocument();
    expect(screen.getByText('选择日期')).toBeInTheDocument();
    expect(screen.getByText('选择时间')).toBeInTheDocument();
  });

  test('onSelect 只被调用一次', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 点击单选题
    fireEvent.click(screen.getByText('单选题'));

    // 验证 onSelect 只被调用一次
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  test('所有问题类型卡片都可点击', () => {
    render(<QuestionTypeSelector {...defaultProps} />);

    // 测试每种问题类型卡片都可点击
    const questionTypes = [
      { label: '文本题', type: QuestionType.TEXT },
      { label: '单选题', type: QuestionType.SINGLE_CHOICE },
      { label: '多选题', type: QuestionType.MULTIPLE_CHOICE },
      { label: '矩阵题', type: QuestionType.MATRIX },
      { label: '排序题', type: QuestionType.RANKING },
      { label: '文件上传', type: QuestionType.FILE_UPLOAD },
      { label: '评分题', type: QuestionType.RATING },
      { label: '日期题', type: QuestionType.DATE },
      { label: '时间题', type: QuestionType.TIME },
    ];

    questionTypes.forEach(({ label, type }) => {
      jest.clearAllMocks();
      fireEvent.click(screen.getByText(label));
      expect(defaultProps.onSelect).toHaveBeenCalledWith(type);
    });
  });
});

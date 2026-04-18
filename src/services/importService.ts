import { v4 as uuidv4 } from 'uuid';
import {
  Questionnaire,
  Question,
  QuestionType,
  Option
} from '../types/questionnaire';
import { isNetworkOffline } from '../utils/networkUtils';

// 导入格式接口
export interface ImportFormat {
  title: string;
  description?: string;
  questions: Array<{
    type: string;
    title: string;
    description?: string;
    required: boolean;
    placeholder?: string;
    multiline?: boolean;
    options?: Array<{ text: string }>;
    minSelections?: number;
    maxSelections?: number;
    randomizeOptions?: boolean;
    min?: number;
    max?: number;
    step?: number;
    labels?: string[];
    allowedExtensions?: string[];
    maxFileSize?: number;
    multiple?: boolean;
    minDate?: string;
    maxDate?: string;
    minTime?: string;
    maxTime?: string;
    rows?: Array<{ text: string }>;
    columns?: Array<{ text: string }>;
  }>;
}

// 导入结果接口
export interface ImportResult {
  success: boolean;
  questionnaire?: Questionnaire;
  error?: string;
  warnings?: string[];
}

// 导入错误类型
export class ImportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ImportError';
  }
}

// 获取友好的错误消息
const getFriendlyErrorMessage = (error: any): string => {
  if (error instanceof ImportError) {
    return error.message;
  }

  if (error instanceof SyntaxError) {
    // JSON解析错误
    const message = error.message;
    // 尝试提取有用的位置信息
    const positionMatch = message.match(/position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      return `JSON格式错误：第${position}个字符附近存在语法问题，请检查括号、引号是否匹配`;
    }
    return `JSON格式错误：${message}，请检查JSON语法是否正确`;
  }

  if (error instanceof TypeError) {
    return `数据类型错误：${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '导入失败，请检查文件格式';
};

/**
 * 验证导入格式
 */
export const validateImportFormat = (data: any): { valid: boolean; error?: string } => {
  // 空值检查
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '无效的数据格式，请确保导入的是有效的JSON对象' };
  }

  // 标题验证
  if (!data.title || typeof data.title !== 'string') {
    return { valid: false, error: '缺少或无效的问卷标题（title字段）' };
  }
  if (data.title.trim().length === 0) {
    return { valid: false, error: '问卷标题不能为空' };
  }
  if (data.title.length > 200) {
    return { valid: false, error: '问卷标题过长（最多200个字符）' };
  }

  // 问题列表验证
  if (!data.questions || !Array.isArray(data.questions)) {
    return { valid: false, error: '缺少或无效的问题列表（questions字段应为数组）' };
  }

  if (data.questions.length === 0) {
    return { valid: false, error: '问题列表不能为空' };
  }

  if (data.questions.length > 100) {
    return { valid: false, error: '问题数量过多（最多100个问题）' };
  }

  // 验证每个问题
  const validQuestionTypes = [
    'text', 'single_choice', 'multiple_choice', 'ranking',
    'rating', 'matrix', 'file_upload', 'date', 'time'
  ];

  for (let i = 0; i < data.questions.length; i++) {
    const question = data.questions[i];
    const questionIndex = i + 1;

    if (!question || typeof question !== 'object') {
      return { valid: false, error: `第${questionIndex}个问题格式无效（应为对象）` };
    }

    // 类型验证
    if (!question.type || typeof question.type !== 'string') {
      return { valid: false, error: `第${questionIndex}个问题缺少或无效的类型（type字段）` };
    }
    if (!validQuestionTypes.includes(question.type)) {
      return { valid: false, error: `第${questionIndex}个问题的类型"${question.type}"不受支持` };
    }

    // 标题验证
    if (!question.title || typeof question.title !== 'string') {
      return { valid: false, error: `第${questionIndex}个问题缺少或无效的标题（title字段）` };
    }
    if (question.title.trim().length === 0) {
      return { valid: false, error: `第${questionIndex}个问题的标题不能为空` };
    }

    // 必填字段验证
    if (typeof question.required !== 'boolean') {
      return { valid: false, error: `第${questionIndex}个问题的必填属性（required字段）应为true或false` };
    }

    // 验证特定类型的问题
    switch (question.type) {
      case 'single_choice':
      case 'multiple_choice':
      case 'ranking':
        if (!question.options || !Array.isArray(question.options)) {
          return { valid: false, error: `第${questionIndex}个问题缺少或无效的选项列表（options字段应为数组）` };
        }
        if (question.options.length === 0) {
          return { valid: false, error: `第${questionIndex}个问题的选项列表不能为空` };
        }
        if (question.options.length > 50) {
          return { valid: false, error: `第${questionIndex}个问题的选项过多（最多50个）` };
        }
        // 验证每个选项
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || typeof question.options[j] !== 'object') {
            return { valid: false, error: `第${questionIndex}个问题的第${j + 1}个选项格式无效` };
          }
          if (!question.options[j].text || typeof question.options[j].text !== 'string') {
            return { valid: false, error: `第${questionIndex}个问题的第${j + 1}个选项缺少或无效的文本` };
          }
        }
        break;

      case 'matrix':
        if (!question.rows || !Array.isArray(question.rows)) {
          return { valid: false, error: `第${questionIndex}个矩阵题缺少或无效的行选项（rows字段）` };
        }
        if (!question.columns || !Array.isArray(question.columns)) {
          return { valid: false, error: `第${questionIndex}个矩阵题缺少或无效的列选项（columns字段）` };
        }
        if (question.rows.length === 0) {
          return { valid: false, error: `第${questionIndex}个矩阵题的行选项不能为空` };
        }
        if (question.columns.length === 0) {
          return { valid: false, error: `第${questionIndex}个矩阵题的列选项不能为空` };
        }
        break;

      case 'rating':
        if (typeof question.min !== 'number' || typeof question.max !== 'number') {
          return { valid: false, error: `第${questionIndex}个评分题缺少或无效的评分范围（min和max字段）` };
        }
        if (question.min >= question.max) {
          return { valid: false, error: `第${questionIndex}个评分题的最小值必须小于最大值` };
        }
        if (question.min < 0 || question.max > 10) {
          return { valid: false, error: `第${questionIndex}个评分题的评分范围应在0-10之间` };
        }
        break;

      case 'text':
        if (question.maxLength !== undefined && typeof question.maxLength !== 'number') {
          return { valid: false, error: `第${questionIndex}个文本题的最大长度（maxLength字段）应为数字` };
        }
        break;
    }
  }

  return { valid: true };
};

/**
 * 转换导入格式为内部问卷格式
 */
export const convertToQuestionnaire = (data: ImportFormat): Questionnaire => {
  const now = new Date().toISOString();
  const questions: Question[] = data.questions.map(q => {
    const baseQuestion = {
      id: uuidv4(),
      type: q.type as QuestionType,
      title: q.title,
      description: q.description,
      required: q.required
    };

    switch (q.type) {
      case 'text':
        return {
          ...baseQuestion,
          type: QuestionType.TEXT,
          placeholder: q.placeholder,
          multiline: q.multiline
        };

      case 'single_choice':
        return {
          ...baseQuestion,
          type: QuestionType.SINGLE_CHOICE,
          options: (q.options || []).map(opt => ({
            id: uuidv4(),
            text: opt.text
          })),
          randomizeOptions: q.randomizeOptions
        };

      case 'multiple_choice':
        return {
          ...baseQuestion,
          type: QuestionType.MULTIPLE_CHOICE,
          options: (q.options || []).map(opt => ({
            id: uuidv4(),
            text: opt.text
          })),
          minSelections: q.minSelections,
          maxSelections: q.maxSelections,
          randomizeOptions: q.randomizeOptions
        };

      case 'matrix':
        return {
          ...baseQuestion,
          type: QuestionType.MATRIX,
          rows: (q.rows || []).map(row => ({
            id: uuidv4(),
            text: row.text
          })),
          columns: (q.columns || []).map(col => ({
            id: uuidv4(),
            text: col.text
          }))
        };

      case 'ranking':
        return {
          ...baseQuestion,
          type: QuestionType.RANKING,
          options: (q.options || []).map(opt => ({
            id: uuidv4(),
            text: opt.text
          }))
        };

      case 'file_upload':
        return {
          ...baseQuestion,
          type: QuestionType.FILE_UPLOAD,
          allowedExtensions: q.allowedExtensions,
          maxFileSize: q.maxFileSize,
          multiple: q.multiple
        };

      case 'rating':
        return {
          ...baseQuestion,
          type: QuestionType.RATING,
          min: q.min || 1,
          max: q.max || 5,
          step: q.step,
          labels: q.labels
        };

      case 'date':
        return {
          ...baseQuestion,
          type: QuestionType.DATE,
          minDate: q.minDate,
          maxDate: q.maxDate
        };

      case 'time':
        return {
          ...baseQuestion,
          type: QuestionType.TIME,
          minTime: q.minTime,
          maxTime: q.maxTime
        };

      default:
        return baseQuestion;
    }
  });

  return {
    id: uuidv4(),
    title: data.title,
    description: data.description,
    createdAt: now,
    updatedAt: now,
    questions,
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      font: 'Roboto, sans-serif'
    },
    isPublished: false
  };
};

/**
 * 导入问卷
 */
export const importQuestionnaire = (jsonString: string): ImportResult => {
  // 空字符串检查
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      success: false,
      error: '导入内容不能为空'
    };
  }

  // 去除首尾空白
  const trimmedString = jsonString.trim();

  // 空内容检查
  if (trimmedString.length === 0) {
    return {
      success: false,
      error: '导入内容不能为空'
    };
  }

  // 大小限制（最大5MB）
  const maxSize = 5 * 1024 * 1024;
  if (trimmedString.length > maxSize) {
    return {
      success: false,
      error: '文件内容过大，请确保文件小于5MB'
    };
  }

  try {
    const data = JSON.parse(trimmedString);
    const validation = validateImportFormat(data);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const questionnaire = convertToQuestionnaire(data as ImportFormat);
    return {
      success: true,
      questionnaire
    };
  } catch (error) {
    return {
      success: false,
      error: getFriendlyErrorMessage(error)
    };
  }
};

/**
 * 生成导入格式示例
 */
export const getImportFormatExample = (): string => {
  return JSON.stringify({
    title: '问卷标题',
    description: '问卷描述',
    questions: [
      {
        type: 'text',
        title: '问题标题',
        description: '问题描述',
        required: true,
        placeholder: '请输入...',
        multiline: true
      },
      {
        type: 'single_choice',
        title: '问题标题',
        required: true,
        options: [
          { text: '选项1' },
          { text: '选项2' }
        ]
      }
    ]
  }, null, 2);
};
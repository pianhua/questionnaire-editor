import { Questionnaire, Question } from '../types/questionnaire';

/**
 * 导出服务
 * 用于将问卷数据导出为JSON格式
 */

// 导出错误类型
export class ExportError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

// 验证问卷数据
const validateQuestionnaire = (questionnaire: Questionnaire): void => {
  if (!questionnaire) {
    throw new ExportError('问卷数据不能为空', 'EMPTY_DATA');
  }
  if (!questionnaire.title) {
    throw new ExportError('问卷标题不能为空', 'MISSING_TITLE');
  }
  if (!Array.isArray(questionnaire.questions)) {
    throw new ExportError('问卷问题列表格式无效', 'INVALID_QUESTIONS');
  }
};

export class ExportService {
  /**
   * 导出问卷为JSON文件
   * @param questionnaire 问卷数据
   * @param format 导出格式
   */
  static exportQuestionnaire(
    questionnaire: Questionnaire,
    format: 'standard' | 'simplified' = 'standard'
  ): void {
    try {
      // 验证数据
      validateQuestionnaire(questionnaire);

      // 转换数据
      const exportData = this.convertToExportFormat(questionnaire, format);

      // 生成JSON字符串
      const jsonString = JSON.stringify(exportData, null, 2);

      // 创建Blob
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${questionnaire.title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')}_${timestamp}.json`;

      // 触发下载
      this.downloadBlob(blob, filename);
    } catch (error) {
      if (error instanceof ExportError) {
        throw error;
      }
      throw new ExportError(
        '导出失败：' + (error instanceof Error ? error.message : '未知错误'),
        'EXPORT_FAILED'
      );
    }
  }

  /**
   * 转换为导出格式
   */
  private static convertToExportFormat(
    questionnaire: Questionnaire,
    format: 'standard' | 'simplified'
  ): any {
    const exportData: any = {
      title: questionnaire.title,
      description: questionnaire.description || ''
    };

    // 转换问题
    exportData.questions = questionnaire.questions.map((question) => {
      return this.convertQuestion(question, format);
    });

    return exportData;
  }

  /**
   * 转换单个问题
   */
  private static convertQuestion(
    question: Question,
    format: 'standard' | 'simplified'
  ): any {
    const converted: any = {
      type: question.type,
      title: question.title,
      required: question.required
    };

    // 添加可选字段
    if (question.description && format === 'standard') {
      converted.description = question.description;
    }

    // 根据问题类型添加特有字段
    switch (question.type) {
      case 'text':
        if (format === 'standard') {
          if (question.placeholder) converted.placeholder = question.placeholder;
          if (question.multiline !== undefined) converted.multiline = question.multiline;
          if (question.maxLength) converted.maxLength = question.maxLength;
        }
        break;

      case 'single_choice':
      case 'multiple_choice':
      case 'ranking':
        converted.options = question.options?.map(opt => ({ text: opt.text })) || [];
        if (format === 'standard') {
          if (question.randomizeOptions !== undefined) {
            converted.randomizeOptions = question.randomizeOptions;
          }
          if (question.minSelections !== undefined) {
            converted.minSelections = question.minSelections;
          }
          if (question.maxSelections !== undefined) {
            converted.maxSelections = question.maxSelections;
          }
        }
        break;

      case 'rating':
        if (format === 'standard') {
          if (question.min !== undefined) converted.min = question.min;
          if (question.max !== undefined) converted.max = question.max;
          if (question.step !== undefined) converted.step = question.step;
          if (question.labels) converted.labels = question.labels;
        } else {
          // 简化格式使用默认值
          converted.min = 1;
          converted.max = 5;
          converted.labels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];
        }
        break;

      case 'matrix':
        converted.rows = question.rows?.map(row => ({ text: row.text })) || [];
        converted.columns = question.columns?.map(col => ({ text: col.text })) || [];
        break;

      case 'file_upload':
        if (format === 'standard') {
          if (question.allowedExtensions) {
            converted.allowedExtensions = question.allowedExtensions;
          }
          if (question.maxFileSize !== undefined) {
            converted.maxFileSize = question.maxFileSize;
          }
          if (question.multiple !== undefined) {
            converted.multiple = question.multiple;
          }
        }
        break;

      case 'date':
        if (format === 'standard') {
          if (question.minDate) converted.minDate = question.minDate;
          if (question.maxDate) converted.maxDate = question.maxDate;
        }
        break;

      case 'time':
        if (format === 'standard') {
          if (question.minTime) converted.minTime = question.minTime;
          if (question.maxTime) converted.maxTime = question.maxTime;
        }
        break;

      default:
        break;
    }

    return converted;
  }

  /**
   * 下载Blob文件
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * 生成示例导出格式
   */
  static getExportFormatExample(): string {
    const example: Questionnaire = {
      id: 'example',
      title: '示例问卷',
      description: '这是一个示例问卷',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false,
      shareLink: '',
      responses: [],
      theme: {
        primaryColor: '#6366F1',
        secondaryColor: '#10B981',
        font: 'Arial',
        background: '#FFFFFF'
      },
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: '您的姓名',
          description: '请输入您的真实姓名',
          required: true,
          placeholder: '请输入姓名',
          multiline: false
        },
        {
          id: 'q2',
          type: 'single_choice',
          title: '您的性别',
          required: true,
          options: [
            { id: 'o1', text: '男' },
            { id: 'o2', text: '女' }
          ]
        }
      ]
    };

    return JSON.stringify(this.convertToExportFormat(example, 'standard'), null, 2);
  }
}

// 导出函数
export const exportQuestionnaire = (questionnaire: Questionnaire, format: 'standard' | 'simplified' = 'standard') => {
  return ExportService.exportQuestionnaire(questionnaire, format);
};

export const getExportFormatExample = () => {
  return ExportService.getExportFormatExample();
};
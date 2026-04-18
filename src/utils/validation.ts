import { Question, Questionnaire, QuestionType } from '../types/questionnaire';

// 问卷标题验证
export interface TitleValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateQuestionnaireTitle = (title: string): TitleValidationResult => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return {
      isValid: false,
      error: '问卷标题不能为空',
    };
  }

  if (trimmedTitle.length > 200) {
    return {
      isValid: false,
      error: '问卷标题不能超过200个字符',
    };
  }

  if (trimmedTitle.length < 2) {
    return {
      isValid: false,
      error: '问卷标题至少需要2个字符',
    };
  }

  return { isValid: true };
};

// 问题标题验证
export interface QuestionTitleValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateQuestionTitle = (title: string): QuestionTitleValidationResult => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return {
      isValid: false,
      error: '问题标题不能为空',
    };
  }

  if (trimmedTitle.length > 500) {
    return {
      isValid: false,
      error: '问题标题不能超过500个字符',
    };
  }

  return { isValid: true };
};

// 选项验证
export interface OptionValidationResult {
  isValid: boolean;
  error?: string;
  duplicateOptions?: string[];
}

export const validateOptions = (
  options: { id: string; text: string }[],
  minOptions: number = 2
): OptionValidationResult => {
  // 过滤空选项
  const nonEmptyOptions = options.filter(opt => opt.text.trim());

  if (nonEmptyOptions.length < minOptions) {
    return {
      isValid: false,
      error: `至少需要${minOptions}个有效选项`,
    };
  }

  // 检测重复选项
  const optionTexts = nonEmptyOptions.map(opt => opt.text.trim().toLowerCase());
  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (const text of optionTexts) {
    if (seen.has(text)) {
      duplicates.push(text);
    }
    seen.add(text);
  }

  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: '存在重复的选项',
      duplicateOptions: duplicates,
    };
  }

  // 检查是否有空选项
  const emptyOptions = options.filter(opt => !opt.text.trim());
  if (emptyOptions.length > 0) {
    return {
      isValid: false,
      error: '选项文本不能为空',
    };
  }

  return { isValid: true };
};

// 矩阵题验证
export interface MatrixValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateMatrixOptions = (
  rows: { id: string; text: string }[],
  columns: { id: string; text: string }[]
): MatrixValidationResult => {
  const nonEmptyRows = rows.filter(row => row.text.trim());
  const nonEmptyColumns = columns.filter(col => col.text.trim());

  if (nonEmptyRows.length < 1) {
    return {
      isValid: false,
      error: '矩阵题至少需要1行',
    };
  }

  if (nonEmptyColumns.length < 2) {
    return {
      isValid: false,
      error: '矩阵题至少需要2列',
    };
  }

  return { isValid: true };
};

// 评分题验证
export interface RatingValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRatingQuestion = (
  min: number,
  max: number
): RatingValidationResult => {
  if (min >= max) {
    return {
      isValid: false,
      error: '评分数值范围无效，最小值必须小于最大值',
    };
  }

  if (min < 0 || max > 10) {
    return {
      isValid: false,
      error: '评分数值范围应在0-10之间',
    };
  }

  return { isValid: true };
};

// 问卷完整验证
export interface QuestionnaireValidationResult {
  isValid: boolean;
  errors: string[];
  questionErrors?: { questionId: string; questionTitle: string; errors: string[] }[];
}

export const validateQuestionnaire = (
  questionnaire: Questionnaire
): QuestionnaireValidationResult => {
  const errors: string[] = [];
  const questionErrors: QuestionnaireValidationResult['questionErrors'] = [];

  // 验证问卷标题
  const titleValidation = validateQuestionnaireTitle(questionnaire.title);
  if (!titleValidation.isValid && titleValidation.error) {
    errors.push(titleValidation.error);
  }

  // 验证每个问题
  questionnaire.questions.forEach((question, index) => {
    const qErrors: string[] = [];

    // 验证问题标题
    const titleValidation = validateQuestionTitle(question.title);
    if (!titleValidation.isValid && titleValidation.error) {
      qErrors.push(titleValidation.error);
    }

    // 根据问题类型验证
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.RANKING:
        const optionsValidation = validateOptions(question.options);
        if (!optionsValidation.isValid && optionsValidation.error) {
          qErrors.push(optionsValidation.error);
        }
        break;

      case QuestionType.MATRIX:
        const matrixValidation = validateMatrixOptions(question.rows, question.columns);
        if (!matrixValidation.isValid && matrixValidation.error) {
          qErrors.push(matrixValidation.error);
        }
        break;

      case QuestionType.RATING:
        const ratingValidation = validateRatingQuestion(question.min, question.max);
        if (!ratingValidation.isValid && ratingValidation.error) {
          qErrors.push(ratingValidation.error);
        }
        break;
    }

    if (qErrors.length > 0) {
      questionErrors!.push({
        questionId: question.id,
        questionTitle: question.title || `问题 ${index + 1}`,
        errors: qErrors,
      });
    }
  });

  return {
    isValid: errors.length === 0 && questionErrors!.length === 0,
    errors,
    questionErrors,
  };
};

// 发布前验证
export interface PublishValidationResult {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

export const validateForPublish = (
  questionnaire: Questionnaire
): PublishValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本验证
  const basicValidation = validateQuestionnaire(questionnaire);
  errors.push(...basicValidation.errors);

  // 检查是否有问题
  if (questionnaire.questions.length === 0) {
    errors.push('问卷至少需要包含一个问题');
  }

  // 检查必填项
  const requiredQuestions = questionnaire.questions.filter(q => q.required);
  if (requiredQuestions.length > 0) {
    warnings.push(`该问卷包含 ${requiredQuestions.length} 个必填问题`);
  }

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
  };
};

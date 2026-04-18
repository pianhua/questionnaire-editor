// 问卷问题类型
export enum QuestionType {
  TEXT = 'text',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  MATRIX = 'matrix',
  RANKING = 'ranking',
  FILE_UPLOAD = 'file_upload',
  RATING = 'rating',
  DATE = 'date',
  TIME = 'time'
}

// 选项类型
export interface Option {
  id: string;
  text: string;
}

// 矩阵题选项
export interface MatrixOption {
  rowId: string;
  rowText: string;
  columnId: string;
  columnText: string;
}

// 逻辑条件
export interface LogicCondition {
  questionId: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

// 逻辑分支
export interface LogicBranch {
  conditions: LogicCondition[];
  nextQuestionId: string | null;
}

// 问题基础接口
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  logicBranches?: LogicBranch[];
}

// 文本题
export interface TextQuestion extends BaseQuestion {
  type: QuestionType.TEXT;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}

// 单选题
export interface SingleChoiceQuestion extends BaseQuestion {
  type: QuestionType.SINGLE_CHOICE;
  options: Option[];
  randomizeOptions?: boolean;
}

// 多选题
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: Option[];
  minSelections?: number;
  maxSelections?: number;
  randomizeOptions?: boolean;
}

// 矩阵题
export interface MatrixQuestion extends BaseQuestion {
  type: QuestionType.MATRIX;
  rows: Option[];
  columns: Option[];
}

// 排序题
export interface RankingQuestion extends BaseQuestion {
  type: QuestionType.RANKING;
  options: Option[];
}

// 文件上传题
export interface FileUploadQuestion extends BaseQuestion {
  type: QuestionType.FILE_UPLOAD;
  allowedExtensions?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

// 评分题
export interface RatingQuestion extends BaseQuestion {
  type: QuestionType.RATING;
  min: number;
  max: number;
  step?: number;
  labels?: string[];
}

// 日期题
export interface DateQuestion extends BaseQuestion {
  type: QuestionType.DATE;
  minDate?: string;
  maxDate?: string;
}

// 时间题
export interface TimeQuestion extends BaseQuestion {
  type: QuestionType.TIME;
  minTime?: string;
  maxTime?: string;
}

// 问卷问题联合类型
export type Question = 
  | TextQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | MatrixQuestion
  | RankingQuestion
  | FileUploadQuestion
  | RatingQuestion
  | DateQuestion
  | TimeQuestion;

// 问卷主题
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  font: string;
  logo?: string;
  backgroundImage?: string;
}

// 问卷
export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  theme: Theme;
  isPublished: boolean;
  shareLink?: string;
  qrCode?: string;
}

// 问卷回答
export interface Answer {
  id: string;
  questionnaireId: string;
  submittedAt: string;
  responses: Record<string, any>;
}

// 问卷模板
export interface Template {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  questions: Question[];
  category: string;
}
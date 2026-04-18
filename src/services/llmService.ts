import axios, { AxiosError } from 'axios';
import { Question, QuestionType } from '../types/questionnaire';
import { v4 as uuidv4 } from 'uuid';
import { getNetworkErrorMessage, isNetworkOffline } from '../utils/networkUtils';

// LLM提供商类型
export type LLMProvider = 'openai' | 'minimax';

// API配置接口
export interface APIConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL: string;
}

// LLM响应接口
export interface LLMResponse {
  title: string;
  description?: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{ text: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: Array<{ text: string }>;
  columns?: Array<{ text: string }>;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  minDate?: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
  allowedExtensions?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

// 错误类型
export class LLMServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMServiceError';
  }
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
};

// 计算重试延迟
const calculateRetryDelay = (retryCount: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// 延迟函数
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// 提示词模板
const PROMPT_TEMPLATE = `你是一个专业的问卷设计助手。请根据用户的需求描述，生成一份结构合理的问卷。

要求：
1. 问卷标题要简洁明了，能够准确反映问卷主题
2. 问题数量控制在5-15个之间
3. 问题类型要多样化，包括：单选题、多选题、评分题、文本题等
4. 选项要合理，符合实际场景
5. 每个问题都要标注是否必填

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "title": "问卷标题",
  "description": "问卷描述（可选）",
  "questions": [
    {
      "type": "single_choice",
      "title": "问题标题",
      "description": "问题描述（可选）",
      "required": true,
      "options": [
        {"text": "选项1"},
        {"text": "选项2"}
      ]
    },
    {
      "type": "multiple_choice",
      "title": "问题标题",
      "required": false,
      "options": [
        {"text": "选项1"},
        {"text": "选项2"}
      ]
    },
    {
      "type": "rating",
      "title": "问题标题",
      "required": true,
      "min": 1,
      "max": 5
    },
    {
      "type": "text",
      "title": "问题标题",
      "required": false,
      "placeholder": "请输入...",
      "multiline": true,
      "maxLength": 500
    }
  ]
}

支持的type类型：
- text: 文本题
- single_choice: 单选题
- multiple_choice: 多选题
- rating: 评分题
- ranking: 排序题
- matrix: 矩阵题
- file_upload: 文件上传题
- date: 日期题
- time: 时间题

用户需求：{description}`;

// 存储键名
const STORAGE_KEY = 'llm_api_config';

// LLM服务类
export class LLMService {
  private config: APIConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  // 从localStorage加载配置
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load LLM config:', error);
      this.config = null;
    }
  }

  // 保存配置到localStorage
  public saveConfig(config: APIConfig): void {
    this.config = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  // 获取当前配置
  public getConfig(): APIConfig | null {
    return this.config;
  }

  // 检查是否已配置
  public isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.baseURL);
  }

  // 验证API配置
  public async validateConfig(config: APIConfig): Promise<{ valid: boolean; error?: string }> {
    if (!config.apiKey || !config.baseURL) {
      return { valid: false, error: 'API Key和Base URL不能为空' };
    }

    try {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.provider === 'openai' ? 'gpt-3.5-turbo' : 'MiniMax-M2.7',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        return { valid: true };
      }

      return { valid: false, error: 'API验证失败' };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return { valid: false, error: 'API Key无效，请检查配置' };
        }
        if (error.response?.status === 404) {
          return { valid: false, error: 'API地址不正确，请检查Base URL' };
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return { valid: false, error: '连接超时，请检查网络后重试' };
        }
        if (isNetworkOffline()) {
          return { valid: false, error: '网络已断开，请检查网络连接' };
        }
        return { valid: false, error: getNetworkErrorMessage(error) };
      }
      return { valid: false, error: '配置验证失败，请重试' };
    }
  }

  // 将问题类型字符串转换为QuestionType枚举
  private mapQuestionType(typeStr: string): QuestionType {
    const typeMap: Record<string, QuestionType> = {
      'text': QuestionType.TEXT,
      'single_choice': QuestionType.SINGLE_CHOICE,
      'multiple_choice': QuestionType.MULTIPLE_CHOICE,
      'rating': QuestionType.RATING,
      'ranking': QuestionType.RANKING,
      'matrix': QuestionType.MATRIX,
      'file_upload': QuestionType.FILE_UPLOAD,
      'date': QuestionType.DATE,
      'time': QuestionType.TIME,
    };

    return typeMap[typeStr.toLowerCase()] || QuestionType.TEXT;
  }

  // 将生成的问题转换为标准Question格式
  private transformQuestion(genQ: GeneratedQuestion): Question {
    const baseQuestion = {
      id: uuidv4(),
      type: this.mapQuestionType(genQ.type),
      title: genQ.title,
      description: genQ.description,
      required: genQ.required ?? false,
    };

    switch (genQ.type.toLowerCase()) {
      case 'text':
        return {
          ...baseQuestion,
          type: QuestionType.TEXT,
          placeholder: genQ.placeholder || '',
          maxLength: genQ.maxLength || 500,
          multiline: genQ.multiline ?? true,
        };

      case 'single_choice':
      case 'multiple_choice':
      case 'ranking':
        return {
          ...baseQuestion,
          type: this.mapQuestionType(genQ.type),
          options: (genQ.options || []).map((opt) => ({
            id: uuidv4(),
            text: opt.text,
          })),
        };

      case 'rating':
        return {
          ...baseQuestion,
          type: QuestionType.RATING,
          min: genQ.min || 1,
          max: genQ.max || 5,
          step: genQ.step || 1,
        };

      case 'matrix':
        return {
          ...baseQuestion,
          type: QuestionType.MATRIX,
          rows: (genQ.rows || []).map((r) => ({ id: uuidv4(), text: r.text })),
          columns: (genQ.columns || []).map((c) => ({ id: uuidv4(), text: c.text })),
        };

      case 'file_upload':
        return {
          ...baseQuestion,
          type: QuestionType.FILE_UPLOAD,
          allowedExtensions: genQ.allowedExtensions || [],
          maxFileSize: genQ.maxFileSize || 10,
          multiple: genQ.multiple ?? false,
        };

      case 'date':
        return {
          ...baseQuestion,
          type: QuestionType.DATE,
          minDate: genQ.minDate,
          maxDate: genQ.maxDate,
        };

      case 'time':
        return {
          ...baseQuestion,
          type: QuestionType.TIME,
          minTime: genQ.minTime,
          maxTime: genQ.maxTime,
        };

      default:
        return {
          ...baseQuestion,
          type: QuestionType.TEXT,
        };
    }
  }

  // 自然语言描述转问卷（带重试机制）
  async generateQuestionnaireFromDescription(description: string): Promise<{
    title: string;
    description?: string;
    questions: Question[];
  }> {
    if (!this.config) {
      throw new LLMServiceError(
        '请先配置API密钥和地址',
        'NOT_CONFIGURED',
        false
      );
    }

    // 检查网络状态
    if (isNetworkOffline()) {
      throw new LLMServiceError(
        '网络已断开，请检查网络连接后重试',
        'NETWORK_OFFLINE',
        true
      );
    }

    const prompt = PROMPT_TEMPLATE.replace('{description}', description);
    let lastError: Error | null = null;

    // 重试循环
    for (let retryCount = 0; retryCount <= RETRY_CONFIG.maxRetries; retryCount++) {
      try {
        // 根据不同提供商使用不同的API格式
        let requestData: any;
        let messages: any[];

        if (this.config.provider === 'openai') {
          messages = [{ role: 'user', content: prompt }];
          requestData = {
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            max_tokens: 4000,
          };
        } else {
          // MiniMax格式
          messages = [{ role: 'user', content: prompt }];
          requestData = {
            model: 'MiniMax-M2.7',
            messages,
            temperature: 0.7,
            max_tokens: 4000,
          };
        }

        const response = await axios.post(
          `${this.config.baseURL}/chat/completions`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            timeout: 60000,
          }
        );

        // 解析API响应
        let content: string;
        // 统一处理OpenAI和MiniMax的响应格式
        content = response.data.choices[0].message.content;

        // 提取JSON（处理可能的markdown代码块）
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }

        // 找到JSON对象的开始和结束
        const startIdx = jsonStr.indexOf('{');
        const endIdx = jsonStr.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = jsonStr.substring(startIdx, endIdx + 1);
        }

        const parsed: LLMResponse = JSON.parse(jsonStr);

        // 转换问题
        const questions = parsed.questions.map((q) => this.transformQuestion(q));

        return {
          title: parsed.title || 'AI生成的问卷',
          description: parsed.description,
          questions,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // 判断错误是否可重试
        const isRetryable = this.isRetryableError(error);

        // 如果不是可重试的错误，或者已经到达最大重试次数，则直接抛出
        if (!isRetryable || retryCount >= RETRY_CONFIG.maxRetries) {
          throw this.handleGenerateError(error);
        }

        // 如果是最后一次重试，不再等待直接抛出
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delayMs = calculateRetryDelay(retryCount);
          await delay(delayMs);
        }
      }
    }

    // 理论上不会到达这里，但以防万一
    throw this.handleGenerateError(lastError);
  }

  // 判断错误是否可重试
  private isRetryableError(error: any): boolean {
    if (error instanceof AxiosError) {
      // 网络错误可重试
      if (!error.response) {
        return true;
      }
      // 服务器错误可重试（5xx）
      if (error.response.status >= 500) {
        return true;
      }
      // 限流错误可重试
      if (error.response.status === 429) {
        return true;
      }
    }
    // JSON解析错误不可重试
    if (error instanceof SyntaxError) {
      return false;
    }
    // 网络断开不可重试
    if (isNetworkOffline()) {
      return false;
    }
    return false;
  }

  // 处理生成过程中的错误
  private handleGenerateError(error: any): LLMServiceError {
    if (error instanceof LLMServiceError) {
      return error;
    }

    if (error instanceof AxiosError) {
      // 认证错误
      if (error.response?.status === 401) {
        return new LLMServiceError(
          'API Key无效或已过期，请检查配置',
          'INVALID_API_KEY',
          false
        );
      }

      // 限流错误
      if (error.response?.status === 429) {
        return new LLMServiceError(
          '请求过于频繁，AI服务已限流，请稍后重试',
          'RATE_LIMITED',
          true
        );
      }

      // 服务器错误
      if (error.response?.status && error.response.status >= 500) {
        return new LLMServiceError(
          'AI服务暂时不可用，请稍后重试',
          'SERVER_ERROR',
          true
        );
      }

      // 超时错误
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new LLMServiceError(
          '请求超时，请检查网络连接后重试',
          'TIMEOUT',
          true
        );
      }

      // 网络断开
      if (isNetworkOffline()) {
        return new LLMServiceError(
          '网络已断开，请检查网络连接',
          'NETWORK_OFFLINE',
          true
        );
      }
    }

    // JSON解析错误
    if (error instanceof SyntaxError) {
      return new LLMServiceError(
        'AI返回的数据格式有误，请重试',
        'PARSE_ERROR',
        false
      );
    }

    // 未知错误
    return new LLMServiceError(
      error?.message || '生成失败，请重试',
      'UNKNOWN',
      true
    );
  }

  // 获取默认配置
  public getDefaultConfig(): APIConfig {
    return {
      provider: 'minimax',
      apiKey: '',
      baseURL: 'https://api.minimax.io/v1',
    };
  }
}

// 导出单例
export const llmService = new LLMService();
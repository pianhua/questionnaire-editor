import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType } from '../types/questionnaire';

export interface QuestionCreator {
  create(): Question;
}

class TextQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.TEXT,
      title: '新问题',
      required: false,
      multiline: false,
      placeholder: '',
    };
  }
}

class SingleChoiceQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: '新问题',
      required: false,
      options: [{ id: uuidv4(), text: '选项 1' }],
    };
  }
}

class MultipleChoiceQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.MULTIPLE_CHOICE,
      title: '新问题',
      required: false,
      options: [{ id: uuidv4(), text: '选项 1' }],
    };
  }
}

class MatrixQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.MATRIX,
      title: '新问题',
      required: false,
      rows: [
        { id: uuidv4(), text: '行 1' },
        { id: uuidv4(), text: '行 2' },
      ],
      columns: [
        { id: uuidv4(), text: '列 1' },
        { id: uuidv4(), text: '列 2' },
        { id: uuidv4(), text: '列 3' },
      ],
    };
  }
}

class RankingQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.RANKING,
      title: '新问题',
      required: false,
      options: [{ id: uuidv4(), text: '选项 1' }],
    };
  }
}

class FileUploadQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.FILE_UPLOAD,
      title: '新问题',
      required: false,
      allowedExtensions: [],
      maxFileSize: 10,
      multiple: false,
    };
  }
}

class RatingQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.RATING,
      title: '新问题',
      required: false,
      min: 1,
      max: 5,
      step: 1,
    };
  }
}

class DateQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.DATE,
      title: '新问题',
      required: false,
    };
  }
}

class TimeQuestionCreator implements QuestionCreator {
  create(): Question {
    return {
      id: uuidv4(),
      type: QuestionType.TIME,
      title: '新问题',
      required: false,
    };
  }
}

class QuestionFactory {
  private static creators: Map<QuestionType, QuestionCreator> = new Map();

  static {
    this.creators.set(QuestionType.TEXT, new TextQuestionCreator());
    this.creators.set(QuestionType.SINGLE_CHOICE, new SingleChoiceQuestionCreator());
    this.creators.set(QuestionType.MULTIPLE_CHOICE, new MultipleChoiceQuestionCreator());
    this.creators.set(QuestionType.MATRIX, new MatrixQuestionCreator());
    this.creators.set(QuestionType.RANKING, new RankingQuestionCreator());
    this.creators.set(QuestionType.FILE_UPLOAD, new FileUploadQuestionCreator());
    this.creators.set(QuestionType.RATING, new RatingQuestionCreator());
    this.creators.set(QuestionType.DATE, new DateQuestionCreator());
    this.creators.set(QuestionType.TIME, new TimeQuestionCreator());
  }

  static createQuestion(type: QuestionType): Question {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`不支持的问题类型: ${type}`);
    }
    return creator.create();
  }

  static registerCreator(type: QuestionType, creator: QuestionCreator): void {
    this.creators.set(type, creator);
  }
}

export default QuestionFactory;
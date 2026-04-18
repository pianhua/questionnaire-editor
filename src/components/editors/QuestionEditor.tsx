import React from 'react';
import { Question, QuestionType } from '../../types/questionnaire';
import { Box, Paper, Typography, Divider } from '@mui/material';
import TextQuestionEditor from './TextQuestionEditor';
import SingleChoiceQuestionEditor from './SingleChoiceQuestionEditor';
import MultipleChoiceQuestionEditor from './MultipleChoiceQuestionEditor';
import MatrixQuestionEditor from './MatrixQuestionEditor';
import RankingQuestionEditor from './RankingQuestionEditor';
import FileUploadQuestionEditor from './FileUploadQuestionEditor';
import RatingQuestionEditor from './RatingQuestionEditor';
import DateQuestionEditor from './DateQuestionEditor';
import TimeQuestionEditor from './TimeQuestionEditor';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onChange }) => {
  const renderEditor = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return <TextQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.SINGLE_CHOICE:
        return <SingleChoiceQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoiceQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.MATRIX:
        return <MatrixQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.RANKING:
        return <RankingQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.FILE_UPLOAD:
        return <FileUploadQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.RATING:
        return <RatingQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.DATE:
        return <DateQuestionEditor question={question} onChange={onChange as any} />;
      case QuestionType.TIME:
        return <TimeQuestionEditor question={question} onChange={onChange as any} />;
      default:
        return <Typography>未知的问题类型</Typography>;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        问题设置
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {renderEditor()}
    </Paper>
  );
};

export default QuestionEditor;

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Question, QuestionType, Option } from '../types/questionnaire';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface QuestionAnalysisProps {
  question: Question;
  responses: Record<string, any>[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({ question, responses }) => {
  const answers = responses.map((r) => r[question.id]).filter(Boolean);

  const renderChart = () => {
    if (answers.length === 0) {
      return (
        <Typography color="text.secondary" textAlign="center" py={4}>
          暂无回答数据
        </Typography>
      );
    }

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE: {
        const optionCounts: Record<string, number> = {};
        question.options.forEach((opt: Option) => {
          optionCounts[opt.id] = 0;
        });

        answers.forEach((answer) => {
          if (Array.isArray(answer)) {
            answer.forEach((a) => {
              if (optionCounts[a] !== undefined) optionCounts[a]++;
            });
          } else if (optionCounts[answer] !== undefined) {
            optionCounts[answer]++;
          }
        });

        const data = question.options.map((opt: Option) => ({
          name: opt.text,
          value: optionCounts[opt.id] || 0,
        }));

        return (
          <Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="回答数" />
              </BarChart>
            </ResponsiveContainer>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>选项</TableCell>
                    <TableCell align="right">回答数</TableCell>
                    <TableCell align="right">占比</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                      <TableCell align="right">
                        {((row.value / answers.length) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      }

      case QuestionType.RATING: {
        const ratingData: Record<number, number> = {};
        for (let i = question.min; i <= question.max; i += question.step || 1) {
          ratingData[i] = 0;
        }

        answers.forEach((answer) => {
          const rating = Number(answer);
          if (ratingData[rating] !== undefined) {
            ratingData[rating]++;
          }
        });

        const data = Object.entries(ratingData).map(([rating, count]) => ({
          rating: Number(rating),
          count,
        }));

        return (
          <Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" name="回答数" />
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="body2" color="text.secondary" mt={2}>
              平均评分:{' '}
              {answers.length > 0
                ? (answers.reduce((a, b) => a + Number(b), 0) / answers.length).toFixed(2)
                : 'N/A'}
            </Typography>
          </Box>
        );
      }

      case QuestionType.TEXT: {
        const textResponses = answers.slice(0, 10);
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              共收到 {answers.length} 条文本回答
            </Typography>
            {textResponses.map((text, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  mb: 1,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  borderLeft: '3px solid primary.main',
                }}
              >
                <Typography variant="body2">{text}</Typography>
              </Box>
            ))}
            {answers.length > 10 && (
              <Typography variant="caption" color="text.secondary">
                还有 {answers.length - 10} 条回答未显示
              </Typography>
            )}
          </Box>
        );
      }

      case QuestionType.MATRIX: {
        const matrixData: { row: string; values: Record<string, number> }[] = [];

        question.rows.forEach((row: Option) => {
          const rowData: Record<string, number> = {};
          question.columns.forEach((col: Option) => {
            rowData[col.id] = 0;
          });

          answers.forEach((answer) => {
            if (answer && typeof answer === 'object') {
              const cellValue = answer[`${row.id}`];
              if (cellValue && rowData[cellValue] !== undefined) {
                rowData[cellValue]++;
              }
            }
          });

          matrixData.push({ row: row.text, values: rowData });
        });

        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>问题/选项</TableCell>
                  {question.columns.map((col: Option) => (
                    <TableCell key={col.id} align="center">
                      {col.text}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {matrixData.map((rowData, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{rowData.row}</TableCell>
                    {question.columns.map((col: Option) => (
                      <TableCell key={col.id} align="center">
                        {rowData.values[col.id] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }

      case QuestionType.RANKING: {
        const rankingCount: Record<string, Record<number, number>> = {};

        question.options.forEach((opt: Option) => {
          rankingCount[opt.id] = {};
          answers.forEach((_, idx) => {
            rankingCount[opt.id][idx + 1] = 0;
          });
        });

        answers.forEach((answer) => {
          if (Array.isArray(answer)) {
            answer.forEach((optId, rank) => {
              if (rankingCount[optId]) {
                rankingCount[optId][rank + 1]++;
              }
            });
          }
        });

        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>选项</TableCell>
                  {question.options.map((_: Option, idx) => (
                    <TableCell key={idx} align="center">
                      第{idx + 1}位
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {question.options.map((opt: Option) => (
                  <TableRow key={opt.id}>
                    <TableCell>{opt.text}</TableCell>
                    {Object.values(rankingCount[opt.id] || {}).map((count, idx) => (
                      <TableCell key={idx} align="center">
                        {count}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }

      default:
        return (
          <Typography color="text.secondary">
            该问题类型暂不支持可视化分析
          </Typography>
        );
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {question.title}
          {question.required && (
            <Typography component="span" color="error" variant="caption">
              *
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          类型: {question.type} | 回答数: {answers.length}
        </Typography>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

const AnalysisPanel: React.FC = () => {
  const { questionnaires, currentQuestionnaireId, answers } = useSelector(
    (state: RootState) => state.questionnaire
  );
  const currentQuestionnaire = questionnaires.find((q) => q.id === currentQuestionnaireId);

  const questionnaireAnswers = useMemo(() => {
    if (!currentQuestionnaireId) return [];
    return answers.filter((a) => a.questionnaireId === currentQuestionnaireId);
  }, [answers, currentQuestionnaireId]);

  if (!currentQuestionnaire) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary" textAlign="center">
          请先选择一个问卷查看分析
        </Typography>
      </Paper>
    );
  }

  const { theme, title, questions } = currentQuestionnaire;

  return (
    <Paper elevation={3} sx={{ p: 4, backgroundColor: theme.backgroundColor }}>
      <Box mb={4}>
        <Typography
          variant="h5"
          sx={{ color: theme.primaryColor, mb: 1 }}
          style={{ fontFamily: theme.font }}
        >
          {title} - 数据分析
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共收到 {questionnaireAnswers.length} 份回答
        </Typography>
      </Box>

      {questionnaireAnswers.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无回答数据
          </Typography>
          <Typography variant="body2" color="text.secondary">
            发布问卷后，等待受访者提交回答，即可在此处查看数据分析
          </Typography>
        </Box>
      ) : questions.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            问卷暂无问题
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  回答概览
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip label={`总回答数: ${questionnaireAnswers.length}`} color="primary" />
                  <Chip label={`问题数: ${questions.length}`} />
                  <Chip
                    label={`平均完成率: ${
                      questionnaireAnswers.length > 0
                        ? (
                            questionnaireAnswers.reduce(
                              (acc, a) => acc + Object.keys(a.responses).length,
                              0
                            ) /
                            (questionnaireAnswers.length * questions.length)
                          ).toFixed(1)
                        : 0
                    }%`}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            {questions.map((question: Question) => (
              <QuestionAnalysis
                key={question.id}
                question={question}
                responses={questionnaireAnswers.map((a) => a.responses)}
              />
            ))}
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default AnalysisPanel;

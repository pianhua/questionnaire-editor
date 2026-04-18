import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import QuestionnaireList from './components/QuestionnaireList';
import QuestionnaireEditor from './components/QuestionnaireEditor';
import { EditorThemeProvider } from './components/EditorThemeProvider';
import './App.css';

const AppContent: React.FC = () => {
  const { currentQuestionnaireId, currentView } = useSelector((state: RootState) => state.questionnaire);

  const showEditor = currentQuestionnaireId !== null && currentView !== 'templates';

  return (
    <Box 
      className="app"
      sx={{
        overflowX: 'hidden',
        '& .app-header': {
          overflow: 'hidden',
        },
        '& .app-main': {
          overflowX: 'hidden',
        }
      }}
    >
      <Box className="app-header">
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          px={{ xs: 2, md: 3 }} 
          py={{ xs: 1, md: 1.5 }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }}>
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E"
              alt="Logo"
              sx={{ width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 } }}
            />
            <Box
              component="h1"
              sx={{ 
                m: 0, 
                fontSize: { xs: '1.1rem', md: '1.6rem' }, 
                fontWeight: 700, 
                color: 'white', 
                letterSpacing: '-0.01em' 
              }}
            >
              问卷编辑器
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="app-main" sx={{ overflowX: 'hidden' }}>
        <Box className="page-transition">
          {showEditor ? <QuestionnaireEditor /> : <QuestionnaireList />}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <Provider store={store}>
      <EditorThemeProvider>
        <CssBaseline />
        <AppContent />
      </EditorThemeProvider>
    </Provider>
  );
}

export default App;

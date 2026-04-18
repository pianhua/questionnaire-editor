import { Questionnaire } from '../types/questionnaire';

const STORAGE_KEY = 'questionnaires';

export class StorageService {
  // 保存问卷列表
  saveQuestionnaires(questionnaires: Questionnaire[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questionnaires));
    } catch (error) {
      console.error('Error saving questionnaires:', error);
    }
  }

  // 加载问卷列表
  loadQuestionnaires(): Questionnaire[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      return [];
    }
  }

  // 保存单个问卷
  saveQuestionnaire(questionnaire: Questionnaire): void {
    try {
      const questionnaires = this.loadQuestionnaires();
      const index = questionnaires.findIndex(q => q.id === questionnaire.id);
      
      if (index !== -1) {
        questionnaires[index] = questionnaire;
      } else {
        questionnaires.push(questionnaire);
      }
      
      this.saveQuestionnaires(questionnaires);
    } catch (error) {
      console.error('Error saving questionnaire:', error);
    }
  }

  // 删除问卷
  deleteQuestionnaire(questionnaireId: string): void {
    try {
      const questionnaires = this.loadQuestionnaires();
      const filtered = questionnaires.filter(q => q.id !== questionnaireId);
      this.saveQuestionnaires(filtered);
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
    }
  }

  // 导出问卷为JSON
  exportQuestionnaire(questionnaire: Questionnaire): string {
    return JSON.stringify(questionnaire, null, 2);
  }

  // 导入问卷从JSON
  importQuestionnaire(json: string): Questionnaire | null {
    try {
      const questionnaire = JSON.parse(json);
      // 验证问卷结构
      if (questionnaire.id && questionnaire.title && Array.isArray(questionnaire.questions)) {
        return questionnaire;
      }
      return null;
    } catch (error) {
      console.error('Error importing questionnaire:', error);
      return null;
    }
  }
}
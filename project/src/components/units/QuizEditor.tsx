import { useEffect, useState } from 'react';
import { unitService } from '../../services/unitService';
import { quizService } from '../../services/quizService';
import { Quiz, Question, QuestionType } from '../../types';
import { ArrowLeft, Plus, Save, Trash2, GripVertical } from 'lucide-react';

interface QuizEditorProps {
  unitId: string;
  onNavigate: (page: string, data?: any) => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'multiple_answer', label: 'Multiple Answer' },
  { value: 'true_false', label: 'True/False' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' },
  { value: 'free_text', label: 'Free Text' }
];

export function QuizEditor({ unitId, onNavigate }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSettings, setQuizSettings] = useState({
    time_limit: 0,
    passing_score: 70,
    attempts_allowed: 1,
    show_answers: false,
    randomize_questions: false,
    mandatory_completion: false
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizData();
  }, [unitId]);

  const loadQuizData = async () => {
    try {
      const quizData = await unitService.getQuiz(unitId);
      if (quizData) {
        setQuiz(quizData);
        setQuizSettings({
          time_limit: quizData.time_limit || 0,
          passing_score: quizData.passing_score,
          attempts_allowed: quizData.attempts_allowed,
          show_answers: quizData.show_answers,
          randomize_questions: quizData.randomize_questions,
          mandatory_completion: quizData.mandatory_completion
        });

        const questionsData = await quizService.getQuestions(quizData.id);
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuizSettings = async () => {
    try {
      if (quiz) {
        await unitService.updateQuiz(quiz.id, quizSettings);
      } else {
        const newQuiz = await unitService.createQuiz({
          unit_id: unitId,
          ...quizSettings
        });
        setQuiz(newQuiz);
      }
      alert('Quiz settings saved');
      loadQuizData();
    } catch (error) {
      console.error('Error saving quiz settings:', error);
      alert('Failed to save quiz settings');
    }
  };

  const handleAddQuestion = async (type: QuestionType) => {
    if (!quiz) {
      alert('Please save quiz settings first');
      return;
    }

    try {
      const newQuestion = await quizService.createQuestion({
        quiz_id: quiz.id,
        type,
        text: 'New question',
        options: type === 'multiple_choice' || type === 'multiple_answer' ? ['Option 1', 'Option 2'] : [],
        correct_answer: null,
        points: 1,
        order: questions.length
      });
      setQuestions([...questions, newQuestion]);
      setShowAddQuestion(false);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;

    try {
      await quizService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz/Test Editor</h1>
          <p className="text-gray-600 mt-1">Configure quiz settings and questions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Quiz Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes, 0 = unlimited)
            </label>
            <input
              type="number"
              value={quizSettings.time_limit}
              onChange={(e) => setQuizSettings({ ...quizSettings, time_limit: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={quizSettings.passing_score}
              onChange={(e) => setQuizSettings({ ...quizSettings, passing_score: parseInt(e.target.value) || 70 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attempts Allowed
            </label>
            <input
              type="number"
              value={quizSettings.attempts_allowed}
              onChange={(e) => setQuizSettings({ ...quizSettings, attempts_allowed: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={quizSettings.show_answers}
              onChange={(e) => setQuizSettings({ ...quizSettings, show_answers: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Show Answers After Completion</p>
              <p className="text-sm text-gray-600">Display correct answers to learners</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={quizSettings.randomize_questions}
              onChange={(e) => setQuizSettings({ ...quizSettings, randomize_questions: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Randomize Questions</p>
              <p className="text-sm text-gray-600">Show questions in random order</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={quizSettings.mandatory_completion}
              onChange={(e) => setQuizSettings({ ...quizSettings, mandatory_completion: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Mandatory Completion</p>
              <p className="text-sm text-gray-600">Learners must pass to proceed</p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSaveQuizSettings}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          <span className="font-medium">Save Quiz Settings</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Questions ({questions.length})</h2>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Question</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions yet. Click "Add Question" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">Q{index + 1}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                        {question.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {question.points} points
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{question.text}</p>
                    {question.options && question.options.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {question.options.map((option: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600">• {option}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Question</h2>
              <p className="text-gray-600 mt-1">Choose a question type</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddQuestion(type.value)}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-500 border-2 border-transparent transition-all text-left"
                >
                  <span className="font-medium text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  type: 'text' | 'rating' | 'choice' | 'multiple';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyEditorProps {
  unitId: string;
  initialData?: {
    questions?: SurveyQuestion[];
    allow_anonymous?: boolean;
  };
  onChange: (data: any) => void;
}

export function SurveyEditor({ unitId, initialData, onChange }: SurveyEditorProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialData?.questions || []);
  const [allowAnonymous, setAllowAnonymous] = useState(initialData?.allow_anonymous ?? false);

  const handleChange = (updatedQuestions: SurveyQuestion[], updatedAnonymous?: boolean) => {
    onChange({
      questions: updatedQuestions,
      allow_anonymous: updatedAnonymous !== undefined ? updatedAnonymous : allowAnonymous
    });
  };

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: false
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    handleChange(updated);
  };

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    );
    setQuestions(updated);
    handleChange(updated);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    handleChange(updated);
  };

  const addOption = (questionId: string) => {
    const updated = questions.map(q => {
      if (q.id === questionId) {
        const options = q.options || [];
        return { ...q, options: [...options, ''] };
      }
      return q;
    });
    setQuestions(updated);
    handleChange(updated);
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const updated = questions.map(q => {
      if (q.id === questionId && q.options) {
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      }
      return q;
    });
    setQuestions(updated);
    handleChange(updated);
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const updated = questions.map(q => {
      if (q.id === questionId && q.options) {
        const options = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options };
      }
      return q;
    });
    setQuestions(updated);
    handleChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClipboardList className="h-4 w-4" />
          <span>Survey configuration</span>
        </div>
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Add Question
        </button>
      </div>

      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={allowAnonymous}
          onChange={(e) => {
            setAllowAnonymous(e.target.checked);
            handleChange(questions, e.target.checked);
          }}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Allow Anonymous Responses</span>
      </label>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No questions yet</p>
            <p className="text-xs text-gray-500">Click "Add Question" to get started</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="border border-gray-300 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, { type: e.target.value as SurveyQuestion['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Text Answer</option>
                  <option value="rating">Rating (1-5)</option>
                  <option value="choice">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your question..."
                />
              </div>

              {(q.type === 'choice' || q.type === 'multiple') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <button
                      onClick={() => addOption(q.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(q.options || []).map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          onClick={() => removeOption(q.id, optIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

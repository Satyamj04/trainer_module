import { useState } from 'react';
import { FileText, Calendar } from 'lucide-react';

interface AssignmentEditorProps {
  unitId: string;
  initialData?: {
    submission_type?: 'file' | 'text' | 'both';
    due_date?: string;
    max_score?: number;
    instructions?: string;
  };
  onChange: (data: any) => void;
}

export function AssignmentEditor({ unitId, initialData, onChange }: AssignmentEditorProps) {
  const [submissionType, setSubmissionType] = useState(initialData?.submission_type || 'both');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [maxScore, setMaxScore] = useState(initialData?.max_score || 100);
  const [instructions, setInstructions] = useState(initialData?.instructions || '');

  const handleChange = (updates: Partial<typeof initialData>) => {
    const data = {
      submission_type: submissionType,
      due_date: dueDate,
      max_score: maxScore,
      instructions,
      ...updates
    };
    onChange(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <FileText className="h-4 w-4" />
        <span>Assignment configuration</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Submission Type
        </label>
        <select
          value={submissionType}
          onChange={(e) => {
            const value = e.target.value as typeof submissionType;
            setSubmissionType(value);
            handleChange({ submission_type: value });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="both">File Upload & Text</option>
          <option value="file">File Upload Only</option>
          <option value="text">Text Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          Due Date (Optional)
        </label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => {
            setDueDate(e.target.value);
            handleChange({ due_date: e.target.value });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Score
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={maxScore}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 100;
            setMaxScore(value);
            handleChange({ max_score: value });
          }}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={instructions}
          onChange={(e) => {
            setInstructions(e.target.value);
            handleChange({ instructions: e.target.value });
          }}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter detailed assignment instructions...&#10;&#10;Include:&#10;- What students need to submit&#10;- Grading criteria&#10;- Any specific requirements"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Assignment Summary</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Submission: {submissionType === 'both' ? 'File & Text' : submissionType === 'file' ? 'File Only' : 'Text Only'}</li>
          <li>Max Score: {maxScore} points</li>
          {dueDate && <li>Due: {new Date(dueDate).toLocaleString()}</li>}
        </ul>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Type } from 'lucide-react';

interface TextUnitEditorProps {
  unitId: string;
  initialData?: {
    content?: string;
  };
  onChange: (data: any) => void;
}

export function TextUnitEditor({ unitId, initialData, onChange }: TextUnitEditorProps) {
  const [content, setContent] = useState(initialData?.content || '');

  const handleContentChange = (value: string) => {
    setContent(value);
    onChange({ content: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
        <Type className="h-4 w-4" />
        <span>Plain text content for learners</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        placeholder="Enter your text content here...&#10;&#10;You can add multiple paragraphs, instructions, or any learning material."
      />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{content.length} characters</span>
        <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
      </div>
    </div>
  );
}

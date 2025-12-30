import { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface PageBlock {
  type: 'heading' | 'paragraph' | 'image' | 'list';
  content: string;
  level?: number;
}

interface PageUnitEditorProps {
  unitId: string;
  initialData?: {
    content?: PageBlock[];
    version?: number;
  };
  onChange: (data: any) => void;
}

export function PageUnitEditor({ unitId, initialData, onChange }: PageUnitEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialData?.content || []);

  const addBlock = (type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      type,
      content: '',
      level: type === 'heading' ? 1 : undefined
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    onChange({ content: updatedBlocks, version: (initialData?.version || 0) + 1 });
  };

  const updateBlock = (index: number, updates: Partial<PageBlock>) => {
    const updatedBlocks = blocks.map((block, i) =>
      i === index ? { ...block, ...updates } : block
    );
    setBlocks(updatedBlocks);
    onChange({ content: updatedBlocks, version: (initialData?.version || 0) + 1 });
  };

  const removeBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);
    onChange({ content: updatedBlocks, version: (initialData?.version || 0) + 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Rich content page with multiple blocks</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => addBlock('heading')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Heading
          </button>
          <button
            onClick={() => addBlock('paragraph')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Paragraph
          </button>
          <button
            onClick={() => addBlock('list')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            List
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No content blocks yet</p>
            <p className="text-xs text-gray-500">Click the buttons above to add content</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {block.type}
                  </span>
                  {block.type === 'heading' && (
                    <select
                      value={block.level || 1}
                      onChange={(e) => updateBlock(index, { level: parseInt(e.target.value) })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                    </select>
                  )}
                </div>
                <button
                  onClick={() => removeBlock(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {block.type === 'heading' ? (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                  placeholder="Enter heading text..."
                />
              ) : block.type === 'list' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Enter list items (one per line)..."
                />
              ) : (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter paragraph text..."
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

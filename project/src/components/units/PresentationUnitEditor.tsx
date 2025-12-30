import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface PresentationUnitEditorProps {
  unitId: string;
  initialData?: {
    file_url?: string;
    file_storage_path?: string;
    slide_count?: number;
  };
  onChange: (data: any) => void;
}

export function PresentationUnitEditor({ unitId, initialData, onChange }: PresentationUnitEditorProps) {
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || '');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [slideCount, setSlideCount] = useState(initialData?.slide_count || 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFileName(file.name);

      const { url, path } = await storageService.uploadPresentation(file);

      setFileUrl(url);
      onChange({
        file_url: url,
        file_storage_path: path,
        slide_count: slideCount
      });
    } catch (error) {
      console.error('Error uploading presentation:', error);
      alert('Failed to upload presentation');
    } finally {
      setUploading(false);
    }
  };

  const handleSlideCountChange = (count: number) => {
    setSlideCount(count);
    onChange({
      file_url: fileUrl,
      file_storage_path: initialData?.file_storage_path,
      slide_count: count
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        {fileUrl ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{fileName || 'Presentation file'}</p>
                <p className="text-sm text-gray-500">Click to download or view</p>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View
              </a>
              <button
                onClick={() => {
                  setFileUrl('');
                  setFileName('');
                  onChange({ file_url: '', file_storage_path: '', slide_count: 0 });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Slides
              </label>
              <input
                type="number"
                min="0"
                value={slideCount}
                onChange={(e) => handleSlideCountChange(parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="presentation-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {uploading ? 'Uploading...' : 'Upload Presentation'}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  PDF, PPT, PPTX up to 100MB
                </span>
              </label>
              <input
                id="presentation-upload"
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Upload className="h-4 w-4" />
        <span>Supported formats: PDF, PowerPoint (PPT, PPTX)</span>
      </div>
    </div>
  );
}

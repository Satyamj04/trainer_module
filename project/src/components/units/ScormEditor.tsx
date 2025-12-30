import { useState } from 'react';
import { Upload, Package } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ScormEditorProps {
  unitId: string;
  initialData?: {
    package_type?: 'scorm_1_2' | 'scorm_2004' | 'xapi';
    file_url?: string;
    file_storage_path?: string;
    version?: string;
    completion_tracking?: boolean;
    score_tracking?: boolean;
  };
  onChange: (data: any) => void;
}

export function ScormEditor({ unitId, initialData, onChange }: ScormEditorProps) {
  const [packageType, setPackageType] = useState(initialData?.package_type || 'scorm_2004');
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || '');
  const [fileName, setFileName] = useState('');
  const [version, setVersion] = useState(initialData?.version || '');
  const [completionTracking, setCompletionTracking] = useState(initialData?.completion_tracking ?? true);
  const [scoreTracking, setScoreTracking] = useState(initialData?.score_tracking ?? true);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file containing the SCORM package');
      return;
    }

    try {
      setUploading(true);
      setFileName(file.name);

      const { url, path } = await storageService.uploadScormPackage(file);

      setFileUrl(url);
      onChange({
        package_type: packageType,
        file_url: url,
        file_storage_path: path,
        version,
        completion_tracking: completionTracking,
        score_tracking: scoreTracking
      });
    } catch (error) {
      console.error('Error uploading SCORM package:', error);
      alert('Failed to upload SCORM package');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (updates: Partial<typeof initialData>) => {
    const data = {
      package_type: packageType,
      file_url: fileUrl,
      file_storage_path: initialData?.file_storage_path,
      version,
      completion_tracking: completionTracking,
      score_tracking: scoreTracking,
      ...updates
    };
    onChange(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Package className="h-4 w-4" />
        <span>SCORM/xAPI package configuration</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Package Type
        </label>
        <select
          value={packageType}
          onChange={(e) => {
            const value = e.target.value as typeof packageType;
            setPackageType(value);
            handleChange({ package_type: value });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="scorm_1_2">SCORM 1.2</option>
          <option value="scorm_2004">SCORM 2004</option>
          <option value="xapi">xAPI (Tin Can)</option>
        </select>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        {fileUrl ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Package className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{fileName || 'SCORM Package'}</p>
                <p className="text-sm text-gray-500">Package uploaded successfully</p>
              </div>
              <button
                onClick={() => {
                  setFileUrl('');
                  setFileName('');
                  handleChange({ file_url: '', file_storage_path: '' });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="scorm-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {uploading ? 'Uploading...' : 'Upload SCORM Package'}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  ZIP file up to 200MB
                </span>
              </label>
              <input
                id="scorm-upload"
                type="file"
                className="hidden"
                accept=".zip,application/zip"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Package Version (Optional)
        </label>
        <input
          type="text"
          value={version}
          onChange={(e) => {
            setVersion(e.target.value);
            handleChange({ version: e.target.value });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 1.0.0"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={completionTracking}
            onChange={(e) => {
              setCompletionTracking(e.target.checked);
              handleChange({ completion_tracking: e.target.checked });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enable Completion Tracking</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={scoreTracking}
            onChange={(e) => {
              setScoreTracking(e.target.checked);
              handleChange({ score_tracking: e.target.checked });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enable Score Tracking</span>
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">SCORM Package Requirements</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Package must be a valid ZIP file</li>
          <li>Must contain imsmanifest.xml at root level</li>
          <li>All assets should be properly referenced</li>
          <li>Test your package before uploading</li>
        </ul>
      </div>
    </div>
  );
}

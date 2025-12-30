import { useEffect, useState } from 'react';
import { unitService } from '../../services/unitService';
import { storageService } from '../../services/storageService';
import { VideoUnit } from '../../types';
import { Upload, Save, ArrowLeft } from 'lucide-react';

interface VideoUnitEditorProps {
  unitId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function VideoUnitEditor({ unitId, onNavigate }: VideoUnitEditorProps) {
  const [videoUnit, setVideoUnit] = useState<VideoUnit | null>(null);
  const [formData, setFormData] = useState({
    completion_type: 'full' as 'full' | 'percentage',
    required_watch_percentage: 100,
    allow_skip: false,
    allow_rewind: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVideoUnit();
  }, [unitId]);

  const loadVideoUnit = async () => {
    try {
      const data = await unitService.getVideoUnit(unitId);
      if (data) {
        setVideoUnit(data);
        setFormData({
          completion_type: data.completion_type,
          required_watch_percentage: data.required_watch_percentage,
          allow_skip: data.allow_skip,
          allow_rewind: data.allow_rewind
        });
      }
    } catch (error) {
      console.error('Error loading video unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;

    try {
      setSaving(true);
      const { url, path } = await storageService.uploadVideo(videoFile, setUploadProgress);

      if (videoUnit) {
        await unitService.updateVideoUnit(videoUnit.id, {
          video_url: url,
          video_storage_path: path
        });
      } else {
        await unitService.createVideoUnit({
          unit_id: unitId,
          video_url: url,
          video_storage_path: path,
          ...formData
        });
      }

      alert('Video uploaded successfully');
      loadVideoUnit();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    } finally {
      setSaving(false);
      setVideoFile(null);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (videoUnit) {
        await unitService.updateVideoUnit(videoUnit.id, formData);
      } else {
        await unitService.createVideoUnit({
          unit_id: unitId,
          ...formData
        });
      }
      alert('Settings saved successfully');
      loadVideoUnit();
    } catch (error) {
      console.error('Error saving video unit:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Video Unit Editor</h1>
          <p className="text-gray-600 mt-1">Configure video settings</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Video Upload</h2>

        {videoUnit?.video_url && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Video</p>
            <video src={videoUnit.video_url} controls className="w-full rounded-lg" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Video or Embed URL
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Select Video File</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {videoFile && (
              <div className="flex-1">
                <p className="text-sm text-gray-700">{videoFile.name}</p>
                <button
                  onClick={handleVideoUpload}
                  disabled={saving}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Completion Rules</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Completion Type
          </label>
          <select
            value={formData.completion_type}
            onChange={(e) => setFormData({ ...formData, completion_type: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="full">Watch Full Video</option>
            <option value="percentage">Watch Percentage</option>
          </select>
        </div>

        {formData.completion_type === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Watch Percentage: {formData.required_watch_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.required_watch_percentage}
              onChange={(e) => setFormData({ ...formData, required_watch_percentage: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allow_rewind}
              onChange={(e) => setFormData({ ...formData, allow_rewind: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Allow Rewind</p>
              <p className="text-sm text-gray-600">Learners can rewind the video</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allow_skip}
              onChange={(e) => setFormData({ ...formData, allow_skip: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Allow Skip</p>
              <p className="text-sm text-gray-600">Learners can skip ahead in the video</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span className="font-medium">{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}

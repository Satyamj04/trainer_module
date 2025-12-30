import { useState } from 'react';
import { Upload, Music } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface AudioUnitEditorProps {
  unitId: string;
  initialData?: {
    audio_url?: string;
    audio_storage_path?: string;
    duration?: number;
  };
  onChange: (data: any) => void;
}

export function AudioUnitEditor({ unitId, initialData, onChange }: AudioUnitEditorProps) {
  const [audioUrl, setAudioUrl] = useState(initialData?.audio_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [duration, setDuration] = useState(initialData?.duration || 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration));
      };

      const { url, path } = await storageService.uploadAudio(file);

      setAudioUrl(url);
      onChange({
        audio_url: url,
        audio_storage_path: path,
        duration: Math.floor(audio.duration)
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        {audioUrl ? (
          <div className="space-y-4">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
              <button
                onClick={() => {
                  setAudioUrl('');
                  onChange({ audio_url: '', audio_storage_path: '', duration: 0 });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="audio-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {uploading ? 'Uploading...' : 'Upload Audio File'}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  MP3, WAV, OGG up to 100MB
                </span>
              </label>
              <input
                id="audio-upload"
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Upload className="h-4 w-4" />
        <span>Audio file will be stored securely and streamed to learners</span>
      </div>
    </div>
  );
}

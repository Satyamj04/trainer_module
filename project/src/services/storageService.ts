import { supabase, STORAGE_BUCKETS } from '../lib/supabase';

const BUCKET = STORAGE_BUCKETS.COURSE_MEDIA;

async function uploadFile(file: File, folder: string, onProgress?: (progress: number) => void): Promise<{ url: string; path: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  await supabase.from('media_metadata').insert({
    storage_path: filePath,
    file_name: file.name,
    file_type: folder,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: user.id
  });

  return { url: publicUrl, path: filePath };
}

export const storageService = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'videos', onProgress);
  },

  async uploadAudio(file: File): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'audio');
  },

  async uploadPresentation(file: File): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'presentations');
  },

  async uploadScormPackage(file: File): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'scorm');
  },

  async uploadThumbnail(file: File): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'thumbnails');
  },

  async uploadAssignment(file: File): Promise<{ url: string; path: string }> {
    return uploadFile(file, 'assignments');
  },

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (error) throw error;

    await supabase
      .from('media_metadata')
      .delete()
      .eq('storage_path', path);
  }
};

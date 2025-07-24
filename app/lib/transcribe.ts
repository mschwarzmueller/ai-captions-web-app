import { getDownloadPresignedUrl } from './upload';

export interface TranscriptionResult {
  [key: string]: any; // Adjust this based on your actual transcription API response
}

/**
 * Start transcription for an uploaded video file
 */
export async function startTranscription(
  key: string,
  fileName: string
): Promise<TranscriptionResult> {
  // Get download URL for the uploaded file
  const downloadResult = await getDownloadPresignedUrl(key);

  // Start transcription
  const transcribeFormData = new FormData();
  transcribeFormData.append('downloadUrl', downloadResult.presignedUrl);
  transcribeFormData.append('fileName', fileName);

  const transcribeResponse = await fetch('/api/transcribe', {
    method: 'POST',
    body: transcribeFormData,
  });

  const transcribeResult = await transcribeResponse.json();
  

  if (!transcribeResponse.ok) {
    throw new Error(transcribeResult.error || 'Transcription failed');
  }

  return transcribeResult;
}

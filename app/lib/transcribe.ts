import { getDownloadPresignedUrl } from './upload';

export interface TranscriptionResult {
  language_code: string;
  language_probability: number;
  text: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    speaker_id: string;
    logprob: number;
  }>;
  additional_formats: Array<{
    requested_format: string;
    file_extension: string;
    content_type: string;
    is_base64_encoded: boolean;
    content: string;
  }>;
}

export interface ExtractedFiles {
  transcript: string;
  words: string;
  srt: string;
  uploadedFiles: {
    transcriptUrl?: string;
    wordsUrl?: string;
    srtUrl?: string;
  };
  keys: {
    transcriptKey?: string;
    wordsKey?: string;
    srtKey?: string;
  };
}

/**
 * Generate presigned URL for uploading content to R2
 */
async function getUploadPresignedUrl(fileName: string, contentType: string): Promise<{
  presignedUrl: string;
  key: string;
}> {
  const formData = new FormData();
  formData.append('action', 'upload');
  formData.append('fileName', fileName);
  formData.append('fileType', contentType);

  const response = await fetch('/api/presign', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get presigned URL');
  }

  return result;
}

/**
 * Upload content to R2 using presigned URL
 */
async function uploadContent(content: string, presignedUrl: string, contentType: string): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: content,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status: ${response.status}`);
  }
}

/**
 * Extract transcription data and upload files to R2
 */
export async function extractAndUploadTranscriptionFiles(
  transcriptionResult: TranscriptionResult,
  videoKey: string
): Promise<ExtractedFiles> {
  try {
    // Extract the base filename from video key (remove path and extension)
    const baseFileName = videoKey.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'unknown';
    
    // Extract transcript text
    const transcript = transcriptionResult.text;
    console.log(transcript);
    
    // Extract words as JSON
    const words = JSON.stringify(transcriptionResult.words, null, 2);
    
    // Extract SRT content
    const srtFormat = transcriptionResult.additional_formats?.find(
      format => format.requested_format === 'srt'
    );
    const srt = srtFormat?.content || '';

    if (!srt) {
      throw new Error('SRT format not found in transcription result');
    }

    const uploadedFiles: ExtractedFiles['uploadedFiles'] = {};
    const keys: ExtractedFiles['keys'] = {};

    // Upload transcript
    if (transcript) {
      const transcriptFileName = `generated/${baseFileName}.transcript.txt`;
      const transcriptUpload = await getUploadPresignedUrl(transcriptFileName, 'text/plain');
      await uploadContent(transcript, transcriptUpload.presignedUrl, 'text/plain');
      const transcriptDownload = await getDownloadPresignedUrl(transcriptUpload.key);
      uploadedFiles.transcriptUrl = transcriptDownload.presignedUrl;
      keys.transcriptKey = transcriptUpload.key;
    }

    // Upload words JSON
    if (words) {
      const wordsFileName = `generated/${baseFileName}.words.json`;
      const wordsUpload = await getUploadPresignedUrl(wordsFileName, 'application/json');
      await uploadContent(words, wordsUpload.presignedUrl, 'application/json');
      const wordsDownload = await getDownloadPresignedUrl(wordsUpload.key);
      uploadedFiles.wordsUrl = wordsDownload.presignedUrl;
      keys.wordsKey = wordsUpload.key;
    }

    // Upload SRT
    if (srt) {
      const srtFileName = `generated/${baseFileName}.captions.srt`;
      const srtUpload = await getUploadPresignedUrl(srtFileName, 'text/srt');
      await uploadContent(srt, srtUpload.presignedUrl, 'text/srt');
      const srtDownload = await getDownloadPresignedUrl(srtUpload.key);
      uploadedFiles.srtUrl = srtDownload.presignedUrl;
      keys.srtKey = srtUpload.key;
    }

    return {
      transcript,
      words,
      srt,
      uploadedFiles,
      keys,
    };
  } catch (error) {
    console.error('Error extracting and uploading transcription files:', error);
    throw new Error(`Failed to extract and upload transcription files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

  return transcribeResult.transcription;
}

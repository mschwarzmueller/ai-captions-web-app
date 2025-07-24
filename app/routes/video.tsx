import { useState } from 'react';
import { redirect } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import type { Route } from './+types/video';
import { auth } from '~/lib/auth';
import { userContext } from '~/context';
import { getUploadPresignedUrl, uploadFileWithProgress } from '~/lib/upload';
import { startTranscription, extractAndUploadTranscriptionFiles, type ExtractedFiles } from '~/lib/transcribe';
import {
  DragDropArea,
  EmptyState,
  FileStatus,
  StatusIcon,
  UploadProgress,
} from '~/components/video';

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  async ({ request, context }) => {
    const authData = await auth.api.getSession(request);

    const session = authData?.session;

    if (!authData || !session) {
      throw redirect('/');
    }
    context.set(userContext, { uid: session.userId });
  },
];

export default function VideoRoute() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const [transcriptionSuccess, setTranscriptionSuccess] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(
    null
  );
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFiles | null>(null);
  const [extractingFiles, setExtractingFiles] = useState(false);

  function handleFileSelect(file: File) {
    setSelectedFile(file);
    resetUploadState();
  }

  function removeFile() {
    setSelectedFile(null);
    resetUploadState();
  }

  function resetUploadState() {
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    setTranscribing(false);
    setTranscriptionError(null);
    setTranscriptionSuccess(false);
    setTranscriptionResult(null);
    setExtractedFiles(null);
    setExtractingFiles(false);
  }

  async function transcribe(key: string) {
    setTranscribing(true);
    setTranscriptionError(null);

    try {
      const transcribeResult = await startTranscription(
        key,
        selectedFile?.name || 'video.mp4'
      );

      setTranscriptionSuccess(true);
      setTranscriptionResult(transcribeResult.text);
      
      // Extract and upload transcription files
      setExtractingFiles(true);
      try {
        const extracted = await extractAndUploadTranscriptionFiles(transcribeResult, key);
        setExtractedFiles(extracted);
        console.log('Successfully extracted and uploaded files:', extracted.uploadedFiles);
      } catch (extractError) {
        console.error('Error extracting files:', extractError);
      } finally {
        setExtractingFiles(false);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionError(
        error instanceof Error ? error.message : 'Transcription failed'
      );
    } finally {
      setTranscribing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const result = await getUploadPresignedUrl(
        selectedFile.name,
        selectedFile.type
      );

      await uploadFileWithProgress(
        selectedFile,
        result.presignedUrl,
        (progress) => setUploadProgress(progress)
      );

      if (!result.key) {
        throw new Error('Upload failed');
      }

      setUploadSuccess(true);
      console.log('File uploaded successfully:', result.uploadUrl);

      setUploading(false);
      await transcribe(result.key);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  const showFileActions = !uploading && !transcribing && !uploadSuccess && !extractingFiles;
  const showUploadButton =
    selectedFile && !uploading && !uploadSuccess && !transcribing && !extractingFiles;

  return (
    <>
      <form
        className="max-w-2xl mx-auto p-6"
        onSubmit={handleSubmit}
      >
        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Video
            </h2>
            <p className="text-gray-600">
              Upload an MP4 file to get started with video captioning
            </p>
          </div>

          <DragDropArea
            selectedFile={selectedFile}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
            transcriptionSuccess={transcriptionSuccess}
            transcriptionError={transcriptionError}
            onFileSelect={handleFileSelect}
          >
            {({ openFileDialog }) =>
              selectedFile ? (
                <div className="space-y-4">
                  <StatusIcon
                    uploading={uploading}
                    uploadError={uploadError}
                    uploadSuccess={uploadSuccess}
                    transcribing={transcribing || extractingFiles}
                    transcriptionError={transcriptionError}
                    transcriptionSuccess={transcriptionSuccess && !extractingFiles}
                  />
                  <FileStatus
                    fileName={selectedFile.name}
                    fileSize={selectedFile.size}
                    uploading={uploading}
                    uploadError={uploadError}
                    uploadSuccess={uploadSuccess}
                    transcribing={transcribing || extractingFiles}
                    transcriptionError={transcriptionError}
                    transcriptionSuccess={transcriptionSuccess && !extractingFiles}
                  />

                  {extractingFiles && (
                    <div className="text-center text-sm text-gray-600">
                      Extracting and uploading transcription files...
                    </div>
                  )}

                  {showFileActions && (
                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFileDialog();
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Choose Different File
                      </Button>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState onOpenFileDialog={openFileDialog} />
              )
            }
          </DragDropArea>
          {uploading && <UploadProgress progress={uploadProgress} />}

          {showUploadButton && (
            <div className="mt-6 text-center">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={uploading}
              >
                Upload and Process Video
              </Button>
            </div>
          )}
        </Card>
      </form>
      {transcriptionResult && (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transcription
            </h2>
            <p className="text-gray-600">{transcriptionResult}</p>
          </Card>
          
          {extractedFiles && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generated Files
              </h2>
              <div className="space-y-3">
                {extractedFiles.uploadedFiles.transcriptUrl && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Transcript (.txt)</span>
                    <a
                      href={extractedFiles.uploadedFiles.transcriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download
                    </a>
                  </div>
                )}
                {extractedFiles.uploadedFiles.srtUrl && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">SRT Captions (.srt)</span>
                    <a
                      href={extractedFiles.uploadedFiles.srtUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download
                    </a>
                  </div>
                )}
                {extractedFiles.uploadedFiles.wordsUrl && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Word Timestamps (.json)</span>
                    <a
                      href={extractedFiles.uploadedFiles.wordsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

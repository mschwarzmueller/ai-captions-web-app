interface FileStatusProps {
  fileName: string;
  fileSize: number;
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
  transcribing: boolean;
  transcriptionError: string | null;
  transcriptionSuccess: boolean;
}

export function FileStatus({
  fileName,
  fileSize,
  uploading,
  uploadError,
  uploadSuccess,
  transcribing,
  transcriptionError,
  transcriptionSuccess,
}: FileStatusProps) {
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);

  let statusMessage = null;
  
  if (transcribing) {
    statusMessage = (
      <p className="text-sm text-blue-600 mt-2">
        Processing transcription...
      </p>
    );
  } else if (uploadError) {
    statusMessage = (
      <p className="text-sm text-red-600 mt-2">{uploadError}</p>
    );
  } else if (transcriptionError) {
    statusMessage = (
      <p className="text-sm text-red-600 mt-2">
        {transcriptionError}
      </p>
    );
  } else if (transcriptionSuccess) {
    statusMessage = (
      <p className="text-sm text-green-600 mt-2">
        Transcription completed successfully!
      </p>
    );
  } else if (uploadSuccess && !transcribing && !transcriptionSuccess && !transcriptionError) {
    statusMessage = (
      <p className="text-sm text-green-600 mt-2">
        Upload completed successfully!
      </p>
    );
  }

  return (
    <div>
      <p className="font-medium text-gray-900">{fileName}</p>
      <p className="text-sm text-gray-500">{fileSizeMB} MB</p>
      {statusMessage}
    </div>
  );
}
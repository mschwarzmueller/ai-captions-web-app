interface StatusIconProps {
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
  transcribing: boolean;
  transcriptionError: string | null;
  transcriptionSuccess: boolean;
}

export function StatusIcon({
  uploading,
  uploadError,
  uploadSuccess,
  transcribing,
  transcriptionError,
  transcriptionSuccess,
}: StatusIconProps) {
  let bgColorClass = 'bg-blue-100';
  
  if (transcriptionSuccess) {
    bgColorClass = 'bg-green-100';
  } else if (transcriptionError) {
    bgColorClass = 'bg-red-100';
  } else if (transcribing) {
    bgColorClass = 'bg-blue-100';
  } else if (uploadSuccess) {
    bgColorClass = 'bg-green-100';
  } else if (uploadError) {
    bgColorClass = 'bg-red-100';
  }

  const isLoading = uploading || transcribing;
  const isSuccess = transcriptionSuccess;
  const isError = transcriptionError || uploadError;

  return (
    <div
      className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full ${bgColorClass}`}
    >
      {isLoading ? (
        <svg
          className="animate-spin w-6 h-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : isSuccess ? (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : isError ? (
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      )}
    </div>
  );
}
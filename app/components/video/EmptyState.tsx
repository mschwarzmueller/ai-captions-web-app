import { Button } from '~/components/ui/button';

interface EmptyStateProps {
  onOpenFileDialog: () => void;
}

export function EmptyState({ onOpenFileDialog }: EmptyStateProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
        <svg
          className="w-6 h-6 text-gray-400"
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
      </div>
      <div>
        <p className="text-lg font-medium text-gray-900">
          Drop your MP4 file here
        </p>
        <p className="text-gray-500">or click to browse</p>
      </div>
      <Button
        type="button"
        onClick={onOpenFileDialog}
        className="mx-auto"
      >
        Choose File
      </Button>
    </div>
  );
}
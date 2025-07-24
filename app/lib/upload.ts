export interface PresignedUrlResult {
  presignedUrl: string;
  key?: string;
  uploadUrl?: string;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Get a presigned URL for uploading a file
 */
export async function getUploadPresignedUrl(
  fileName: string,
  fileType: string
): Promise<PresignedUrlResult> {
  const formData = new FormData();
  formData.append('fileName', fileName);
  formData.append('fileType', fileType);

  const response = await fetch('/api/presign', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get upload URL');
  }

  return result;
}

/**
 * Get a presigned URL for downloading a file
 */
export async function getDownloadPresignedUrl(key: string): Promise<PresignedUrlResult> {
  const formData = new FormData();
  formData.append('action', 'download');
  formData.append('key', key);

  const response = await fetch('/api/presign', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get download URL');
  }

  return result;
}

/**
 * Upload a file using XHR with progress tracking
 */
export async function uploadFileWithProgress(
  file: File,
  presignedUrl: string,
  onProgress?: UploadProgressCallback
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) {
          onProgress(100);
        }
        resolve();
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload was aborted'));
    };

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

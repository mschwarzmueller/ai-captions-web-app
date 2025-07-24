import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/auth.tsx'),
  route('video', 'routes/video.tsx'),
  route('api/auth/*', 'routes/api/auth.$.ts'),
  route('api/presign', 'routes/api/presign.ts'),
  route('api/transcribe', 'routes/api/transcribe.ts'),
  route('api/upload-complete', 'routes/api/upload-complete.ts'),
  route('api/transcription-complete', 'routes/api/transcription-complete.ts'),
] satisfies RouteConfig;

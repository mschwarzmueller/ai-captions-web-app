import type { Route } from './+types/transcription-complete';
import { db } from '~/lib/db';
import { artifacts } from '~/lib/db/schema';
import { auth } from '~/lib/auth';

export async function action({ request }: Route.ActionArgs) {
  const authData = await auth.api.getSession(request);
  
  if (!authData?.session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const videoId = formData.get('videoId') as string;
  const transcriptKey = formData.get('transcriptKey') as string;
  const wordsKey = formData.get('wordsKey') as string;
  const srtKey = formData.get('srtKey') as string;

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Video ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const artifactsToInsert = [];
    
    if (transcriptKey) {
      artifactsToInsert.push({
        id: crypto.randomUUID(),
        videoId,
        type: 'transcript' as const,
        r2Key: transcriptKey,
        createdAt: new Date(),
      });
    }

    if (wordsKey) {
      artifactsToInsert.push({
        id: crypto.randomUUID(),
        videoId,
        type: 'words' as const,
        r2Key: wordsKey,
        createdAt: new Date(),
      });
    }

    if (srtKey) {
      artifactsToInsert.push({
        id: crypto.randomUUID(),
        videoId,
        type: 'srt' as const,
        r2Key: srtKey,
        createdAt: new Date(),
      });
    }

    if (artifactsToInsert.length > 0) {
      await db.insert(artifacts).values(artifactsToInsert);
    }

    return new Response(JSON.stringify({ success: true, artifactsCreated: artifactsToInsert.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save artifacts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

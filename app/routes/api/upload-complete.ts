import type { Route } from './+types/upload-complete';
import { db } from '~/lib/db';
import { videos } from '~/lib/db/schema';
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
  const filename = formData.get('filename') as string;
  const r2Key = formData.get('r2Key') as string;
  const duration = parseInt(formData.get('duration') as string || '0');

  if (!filename || !r2Key) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate video ID on server side
  const videoId = crypto.randomUUID();

  try {
    await db.insert(videos).values({
      id: videoId,
      filename,
      duration,
      r2Key,
      userId: authData.session.userId,
    });

    return new Response(JSON.stringify({ success: true, videoId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save video' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

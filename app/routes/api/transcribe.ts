import fs from 'node:fs/promises';

import type { Route } from './+types/transcribe';

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const downloadUrl = formData.get('downloadUrl') as string;
    const fileName = formData.get('fileName') as string;

    console.log('Starting transcription for:', fileName);
    console.log('Download URL:', downloadUrl);

    if (!downloadUrl) {
      return new Response(JSON.stringify({ error: 'Missing download URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get ElevenLabs API key from environment variables
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare form data for ElevenLabs API
    const transcriptionFormData = new FormData();
    transcriptionFormData.append('cloud_storage_url', downloadUrl);
    transcriptionFormData.append('model_id', 'scribe_v1');
    transcriptionFormData.append('diarize', 'true');
    transcriptionFormData.append(
      'additional_formats',
      JSON.stringify([
        {
          format: 'srt',
        },
      ])
    );

    // Call ElevenLabs transcription API
    const response = await fetch(
      'https://api.elevenlabs.io/v1/speech-to-text',
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
        body: transcriptionFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: 'Transcription service error',
          details: `ElevenLabs API returned ${response.status}: ${errorText}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const transcriptionResult = await response.json();
    console.log('Transcription completed for:', fileName);

    await fs.writeFile(
      'transcription.json',
      JSON.stringify(transcriptionResult, null, 2)
    );

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        transcription: transcriptionResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Transcription error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown transcription error';

    return new Response(
      JSON.stringify({
        error: 'Transcription failed',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

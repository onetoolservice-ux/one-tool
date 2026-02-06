# Audio Transcription Feature - Setup Guide

## Overview

The Audio → Text & Idea Extraction feature is now implemented. This guide explains how to complete the setup and integrate a real transcription service.

## Completed Components

✅ **Database Schema** - `AUDIO_TRANSCRIPTION_SCHEMA.sql`
✅ **API Routes** - `/api/audio/transcribe`, `/api/audio/process`, `/api/audio/save`
✅ **Text Processing Utilities** - Cleaning, structuring, filler word removal
✅ **Idea Extraction** - Content ideas, hooks, quotes, talking points, action items
✅ **Output Generators** - YouTube Script, Podcast Show Notes, Blog Article, Twitter Thread, Instagram Caption, LinkedIn Post, Newsletter Draft
✅ **Main Component** - Full UI with recording, upload, processing, and results display

## Setup Steps

### 1. Run Database Schema

Execute `AUDIO_TRANSCRIPTION_SCHEMA.sql` in your Supabase SQL Editor to create the `audio_transcripts` table.

### 2. Integrate Transcription Service

The current implementation uses a mock transcription function. You need to integrate a real transcription service.

**Option A: OpenAI Whisper API** (Recommended)

1. Install OpenAI SDK:
```bash
npm install openai
```

2. Update `app/api/audio/transcribe/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeAudio(
  base64Audio: string,
  fileName: string,
  language: string
): Promise<string> {
  // Convert base64 to file buffer
  const audioBuffer = Buffer.from(base64Audio, 'base64');
  
  // Create a File-like object for OpenAI
  const file = new File([audioBuffer], fileName, {
    type: 'audio/mpeg', // Adjust based on file type
  });

  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: language !== 'auto' ? language : undefined,
    response_format: 'text',
  });

  return transcription as string;
}
```

**Option B: AssemblyAI**

1. Install AssemblyAI SDK:
```bash
npm install assemblyai
```

2. Update the transcription function:

```typescript
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

async function transcribeAudio(
  base64Audio: string,
  fileName: string,
  language: string
): Promise<string> {
  // Upload audio file
  const fileUrl = await uploadToAssemblyAI(base64Audio, fileName);
  
  // Start transcription
  const transcript = await client.transcripts.transcribe({
    audio: fileUrl,
    language_code: language !== 'auto' ? language : undefined,
    speaker_labels: true, // For speaker separation
  });

  return transcript.text;
}
```

**Option C: Google Speech-to-Text**

1. Install Google Cloud Speech SDK:
```bash
npm install @google-cloud/speech
```

2. Update the transcription function accordingly.

### 3. Environment Variables

Add to your `.env.local`:

```env
# For OpenAI Whisper
OPENAI_API_KEY=your_openai_api_key

# OR for AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# OR for Google Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### 4. Update File Size Limits

If needed, update `app/lib/constants.ts`:

```typescript
export const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

## Features

### Audio Input
- ✅ In-app voice recording
- ✅ Audio file upload (mp3, wav, m4a)
- ✅ Video upload (audio extracted)

### Processing
- ✅ High-accuracy transcription (once service integrated)
- ✅ Timestamped text
- ✅ Speaker separation support
- ✅ Filler word removal
- ✅ Sentence correction
- ✅ Natural paragraphing

### Structured Output
- ✅ Headings
- ✅ Paragraphs
- ✅ Bullet points
- ✅ Logical sections

### Creator Output Modes
- ✅ YouTube Script
- ✅ Podcast Show Notes
- ✅ Blog Article Draft
- ✅ Twitter/X Thread
- ✅ Instagram Caption
- ✅ LinkedIn Post
- ✅ Newsletter Draft

### Idea & Insight Extraction
- ✅ Content ideas (titles + angles)
- ✅ Hooks (first 3–5 seconds)
- ✅ Quotable lines
- ✅ Key talking points
- ✅ Action items

### Language & Style Controls
- ✅ Output language: English, Hindi, Hinglish
- ✅ Tone: Educational, Conversational, Authoritative, Viral

### Save & Export
- ✅ Save to One Tool
- ✅ Copy to clipboard
- ✅ Download as file

## Usage

1. Navigate to `/tools/creator/audio-transcription`
2. Choose input method:
   - Record audio using microphone
   - Upload audio/video file
3. Configure settings (language, speaker count, tone, output language)
4. Click "Process Audio"
5. View results in tabs:
   - **Transcript**: Clean, structured transcript
   - **Ideas & Insights**: Content ideas, hooks, quotes, talking points, action items
   - **Outputs**: Platform-specific content formats
6. Save, copy, or download results

## Database Schema

The `audio_transcripts` table stores:
- Audio metadata (file name, size, type, duration)
- Processing settings (language, speaker count)
- Transcripts (raw, clean, structured)
- Extracted insights (ideas, hooks, quotes, talking points, action items)
- Generated outputs (all platform formats)

All data is private and user-specific (RLS enabled).

## Future Enhancements

- Auto clip detection (viral moments)
- Content calendar integration
- Team workspaces
- AI-guided improvement suggestions
- Real-time transcription during recording
- Batch processing for multiple files

## Notes

- The mock transcription function returns placeholder text. Replace it with actual API integration.
- File size limits are set to 100MB by default. Adjust based on your transcription service limits.
- Speaker separation requires a transcription service that supports it (e.g., AssemblyAI).
- All processing happens server-side for security and performance.

import { NextRequest } from 'next/server';
import { streamGroqChat, isBookingRelated, SUGGESTED_QUESTIONS } from '@/lib/ai-chat';

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json();

    if (!messages?.length) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    if (lastUserMessage && !isBookingRelated(lastUserMessage.content)) {
      const rejection =
        "I'm here to help with bookings, hotels, rooms, payments, and related services on this platform. I can't assist with that topic. Is there something about your reservation I can help with?";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: rejection })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const groqResponse = await streamGroqChat(messages);
    const reader = groqResponse.body?.getReader();
    if (!reader) {
      return Response.json({ error: 'Stream unavailable' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content, sessionId })}\n\n`),
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[AI Chat]', error);
    return Response.json({ error: 'Chat service unavailable' }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ suggestedQuestions: SUGGESTED_QUESTIONS });
}

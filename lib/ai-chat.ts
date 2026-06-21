const SYSTEM_PROMPT = `You are an AI assistant for this booking platform.
You only answer questions related to:
- Hotels, guest houses, resorts, event centers, and car rentals
- Bookings and reservations
- Rooms and services
- Payments and refunds
- Reviews and ratings
- Business information and FAQs
- Customer support for this platform

Politely reject unrelated questions about politics, religion, hacking, general knowledge, coding, or anything outside the booking platform domain.
Keep responses concise, helpful, and professional.`;

const SUGGESTED_QUESTIONS = [
  'How do I make a booking?',
  'What payment methods are accepted?',
  'Can I cancel my reservation?',
  'How do I check room availability?',
  'What is your refund policy?',
];

export { SYSTEM_PROMPT, SUGGESTED_QUESTIONS };

export async function streamGroqChat(messages: { role: string; content: string }[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  return response;
}

export function isBookingRelated(message: string): boolean {
  const blocked = [
    /\b(hack|exploit|sql injection|xss)\b/i,
    /\b(politics|election|president|religion|god|allah|jesus)\b/i,
    /\b(write code|python|javascript|programming)\b/i,
    /\b(recipe|cook|weather forecast)\b/i,
  ];
  return !blocked.some((p) => p.test(message));
}

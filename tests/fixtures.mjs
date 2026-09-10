// Local contract-test responses. This module is never imported by the production server.
const encoder = new TextEncoder()
export const testEnv = {
  NODE_ENV: 'test',
  OPENAI_API_KEY: 'test-openai-only',
  ANTHROPIC_API_KEY: 'test-anthropic-only',
  GOOGLE_AI_API_KEY: 'test-google-only',
}
export function eventStream(events, fragmentSize = 17) {
  const bytes = encoder.encode(
    events.map((event) => `data: ${JSON.stringify(event)}\r\n\r\n`).join(''),
  )
  return new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < bytes.length; i += fragmentSize)
          controller.enqueue(bytes.slice(i, i + fragmentSize))
        controller.close()
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  )
}
export async function mockProvider(url, init) {
  const body = JSON.parse(init.body)
  const instructions =
    body.instructions ||
    body.system ||
    body.systemInstruction?.parts?.[0]?.text ||
    ''
  const text = instructions.includes('Evaluate the candidate excerpts')
    ? JSON.stringify({
        votedFor: 1,
        score: 8,
        reasoning: 'Verification fixture review, not a real model judgment.',
      })
    : `VERIFICATION FIXTURE — no live AI call.\n\nModel: ${body.model || 'Gemini'}\n\n1. Define the objective.\n2. Identify risks and dependencies.\n3. Complete and verify the next action.\n\nUnicode check: გამარჯობა · café.`
  if (url.includes('api.openai.com'))
    return body.stream
      ? eventStream([
          { type: 'response.output_text.delta', delta: text.slice(0, 40) },
          { type: 'response.output_text.delta', delta: text.slice(40) },
          {
            type: 'response.completed',
            response: {
              id: 'test_openai_response',
              usage: { input_tokens: 20, output_tokens: 40 },
            },
          },
        ])
      : Response.json({
          id: 'test_openai_response',
          status: 'completed',
          output: [
            { type: 'message', content: [{ type: 'output_text', text }] },
          ],
        })
  if (url.includes('api.anthropic.com'))
    return body.stream
      ? eventStream([
          { type: 'message_start', message: { id: 'test_anthropic_response' } },
          { type: 'content_block_delta', delta: { type: 'text_delta', text } },
          { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
          { type: 'message_stop' },
        ])
      : Response.json({
          id: 'test_anthropic_response',
          content: [{ type: 'text', text }],
          stop_reason: 'end_turn',
        })
  if (url.includes('generativelanguage.googleapis.com')) {
    const event = {
      responseId: 'test_google_response',
      candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
    }
    return url.includes('streamGenerateContent')
      ? eventStream([event])
      : Response.json(event)
  }
  return Response.json({ error: 'Unconfigured test provider' }, { status: 400 })
}

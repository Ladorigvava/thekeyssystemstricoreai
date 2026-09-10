// Decode complete SSE events across arbitrary byte, UTF-8, CRLF and frame boundaries.
export async function* readSSE(body) {
  if (!body) throw new Error('The provider returned an empty response stream.')
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true })
      let boundary
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index)
        buffer = buffer.slice(boundary.index + boundary[0].length)
        const data = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n')
        if (data && data !== '[DONE]') yield JSON.parse(data)
      }
      if (done) {
        if (buffer.trim() && !buffer.trim().startsWith(':'))
          throw new Error('The response stream ended before its final event.')
        break
      }
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

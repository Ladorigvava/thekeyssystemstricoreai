/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// GitHub Spark Runtime
interface Window {
  spark: {
    llm: (prompt: string, model: string) => Promise<string>
    [key: string]: any
  }
}

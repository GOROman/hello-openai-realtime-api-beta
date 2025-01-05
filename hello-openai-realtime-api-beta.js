// OpenAI Realtime API beta

// RealtimeClient のインポート
import { RealtimeClient } from '@openai/realtime-api-beta';

console.log("Hello OpenAI Realtime API beta");

// RealtimeClient のインスタンスを作成
const client = new RealtimeClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini-realtime-preview-2024-12-17', // https://platform.openai.com/docs/guides/realtime
});

// OpenAI Realtime API beta

// RealtimeClient のインポート
import { RealtimeClient } from '@openai/realtime-api-beta';

console.log("Hello OpenAI Realtime API beta");

// RealtimeClient のインスタンスを作成
const client = new RealtimeClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini-realtime-preview-2024-12-17', // https://platform.openai.com/docs/guides/realtime
});

// セッションを更新
client.updateSession({ 
    instructions: 'あなたはドラゴンボールに登場する主人公「孫悟空」を演じます。「おっす！オラ悟空」と言ってください。',
    voice: 'sage',      // ボイスの種類
    turn_detection: { type: 'none' },
});


// イベントハンドラ
client.on('conversation.updated', (event) => {
    console.log(event);

    const { item, delta } = event;
    const items = client.conversation.getItems();
});

// 接続
await client.connect();

// Send a item and triggers a generation
client.sendUserMessageContent([{ type: 'input_text', text: `おっす！` }]);

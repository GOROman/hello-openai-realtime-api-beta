// OpenAI Realtime API beta

// RealtimeClient のインポート
import { RealtimeClient } from '@openai/realtime-api-beta';
import Speaker from 'speaker';
import { PassThrough } from 'stream';

console.log("Hello OpenAI Realtime API beta");

// Spakerを作成
const speaker = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 24000,
});

// 音声のストリームを作成
const audioStream = new PassThrough();

//  音声のストリームをスピーカーに接続
audioStream.pipe(speaker);

// スピーカー終了時のイベントハンドラ
speaker.on('close', () => {
    console.log('再生が終了しました。');
    speaker.close();
    client.disconnect();
    process.exit(0);
});

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

    if (delta && delta.audio) {
        const buffer = Buffer.from(delta.audio.buffer);

        // スピーカーにデータを渡す
        audioStream.write(buffer);

    }
    // 応答が完了したら終了
    if (item.status == "completed" && item.role == "assistant") {
        console.log("応答が完了しました。接続を終了します...");
        audioStream.end();
    }
});

// 接続
await client.connect();

// Send a item and triggers a generation
client.sendUserMessageContent([{ type: 'input_text', text: `おっす！` }]);

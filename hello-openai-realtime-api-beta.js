// OpenAI Realtime API beta

// RealtimeClient のインポート
import { RealtimeClient } from '@openai/realtime-api-beta';
import Speaker from 'speaker';
import { PassThrough } from 'stream';

// RealtimeClient のインスタンスを作成
const client = new RealtimeClient({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini-realtime-preview-2024-12-17', // https://platform.openai.com/docs/guides/realtime
});

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

audioStream.on('end', () => {
    console.log('ストリーム終了しました。');
});

// スピーカー終了時のイベントハンドラ
speaker.on('close', () => {
    console.log('再生が終了しました。');

    speaker.close();
    client.disconnect();
    process.exit(0);
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

client.on('realtime.event', ({ time, source, event }) => {
    // time is an ISO timestamp
    // source is 'client' or 'server'
    // event is the raw event payload (json)

    // console.log インライン表示
    console.log(`${time} [${source}] ${event.type}`);
    if (source === 'server') {
        if (event.type === 'response.done') {
            console.log(event.response.usage);
        }
    }
});

// 接続
await client.connect();

// Send a item and triggers a generation
client.sendUserMessageContent([{ type: 'input_text', text: `おっす！` }]);

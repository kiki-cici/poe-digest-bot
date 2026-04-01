import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// 你的原始数据源地址
const FEED_X_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json';
const FEED_PODCASTS_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json';

app.post('/', async (req, res) => {
  // 满足 Poe 机器人的通信协议 (Server-Sent Events)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    // 1. 抓取最新数据
    const [feedXRes, feedPodRes] = await Promise.all([
      fetch(FEED_X_URL),
      fetch(FEED_PODCASTS_URL)
    ]);
    
    const feedX = await feedXRes.json();
    const feedPod = await feedPodRes.json();

    // 2. 将数据组装成让 AI 容易看懂的格式
    let promptText = "请帮我总结今天的科技圈动态，生成一份中文的 Daily Digest（每日摘要）。\n\n";
    
    promptText += "【今日推文更新】\n";
    if (feedX.x && feedX.x.length > 0) {
      feedX.x.forEach(user => {
        promptText += `- ${user.name} (@${user.handle}) 发了 ${user.tweets.length} 条推文。\n`;
        user.tweets.forEach(t => {
          promptText += `  内容: ${t.text}\n`;
        });
      });
    } else {
      promptText += "今日无推文更新。\n";
    }

    promptText += "\n【今日播客更新】\n";
    if (feedPod.podcasts && feedPod.podcasts.length > 0) {
      feedPod.podcasts.forEach(pod => {
        promptText += `- 播客名: ${pod.name}\n  标题: ${pod.title}\n  链接: ${pod.url}\n`;
        // 为了避免超出字数限制，只截取字幕的前 3000 个字符让 AI 总结核心内容
        const shortTranscript = pod.transcript ? pod.transcript.substring(0, 3000) + "..." : "无字幕";
        promptText += `  部分字幕内容: ${shortTranscript}\n`;
      });
    } else {
      promptText += "今日无播客更新。\n";
    }

    promptText += "\n请根据以上内容，写一篇排版精美、重点突出的中文总结。";

    // 3. 将组装好的提示词发送给 Poe
    // 注意：这里我们直接把组装好的数据发给用户，用户在 Poe 中使用时，Poe 的 AI 会看到这些文字并进行总结
    res.write(`event: text\ndata: ${JSON.stringify({ text: promptText })}\n\n`);

  } catch (error) {
    res.write(`event: text\ndata: ${JSON.stringify({ text: "抓取数据时发生错误: " + error.message })}\n\n`);
  }

  // 结束响应
  res.write(`event: done\ndata: {}\n\n`);
  res.end();
});

// 启动服务器，监听 3000 端口（云平台会自动分配端口）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Poe Server is running on port ${PORT}`);
});
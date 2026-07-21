export default async function handler(req, res) {

  try {

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    // 获取市场温度
    const marketRes = await fetch(
      `${protocol}://${host}/api/market`
    );

    const market = await marketRes.json();

    // 获取今日Top3
    const topRes = await fetch(
      `${protocol}://${host}/api/top3`
    );

    const top3 = await topRes.json();

    const prompt = `
你是一位专业A股分析师。

今天市场数据：

市场温度：${market.temperature}°
市场状态：${market.level}

上证指数评分：${market.score.shanghai}/20
深创指数评分：${market.score.sz}/20

今日AI推荐股票：

1.${top3[0].name}
2.${top3[1].name}
3.${top3[2].name}

请结合以上信息，

生成今天A股市场的一段观点。

要求：

1、80字以内。

2、不要输出标题。

3、不要输出序号。

4、不要输出免责声明。

5、不要使用Markdown。

6、语言自然，像专业投顾每日点评。
`;

    const aiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    const aiJson = await aiRes.json();

    const text =
      aiJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.status(200).json({
      success: true,
      text
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

}

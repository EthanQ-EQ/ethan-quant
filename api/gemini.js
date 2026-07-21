export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "缺少股票代码"
    });
  }

  try {

    // 获取当前网站地址
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    // 获取实时股票数据
    const stockRes = await fetch(
      `${protocol}://${host}/api/stock?code=${code}`
    );

    if (!stockRes.ok) {
      throw new Error("获取股票数据失败");
    }

    const stock = await stockRes.json();

    // 组织 Prompt
    const prompt = `
你是一位专业A股分析师。

请根据下面数据分析：

股票名称：${stock.name}
股票代码：${stock.code}
最新价：${stock.price}
涨跌额：${stock.change}
涨跌幅：${stock.changePercent}%
今开：${stock.open}
最高：${stock.high}
最低：${stock.low}

请严格按照下面格式回答：

🤖 AI深度分析

📊 AI综合评分：
（100分制，只输出一个分数）

📈 趋势判断：
（100字以内）

💰 资金分析：
（100字以内）

⚠ 风险提示：
（100字以内）

💡 操作建议：
（100字以内）

要求：

1. 不要输出 Markdown。
2. 不要输出任何横线（如：━━━━━━━━━━━━、----------）。
3. 不要输出"本分析仅供参考"等免责声明。
4. 不要输出任何结尾说明。
5. 每个模块之间空一行。
6. 内容简洁专业。
`;

    // 调用 Gemini
    const aiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const aiJson = await aiRes.json();

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        success: false,
        message: "Gemini接口调用失败",
        error: aiJson
      });
    }

    const analysis =
      aiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {
      return res.status(500).json({
        success: false,
        message: "Gemini没有返回分析结果",
        raw: aiJson
      });
    }

    return res.status(200).json({
      success: true,
      analysis
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
}

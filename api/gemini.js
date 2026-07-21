export default async function handler(req, res) {

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "缺少股票代码"
    });
  }

  try {

    // 获取股票实时数据
    const host =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const stockRes = await fetch(
      `${host}/api/stock?code=${code}`
    );

    const stock = await stockRes.json();

    const prompt = `
你是一名专业A股分析师。

请分析下面这只股票：

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

━━━━━━━━━━━━

AI综合评分：
（100分制）

趋势判断：
（100字以内）

资金分析：
（100字以内）

风险提示：
（100字以内）

操作建议：
（100字以内）

━━━━━━━━━━━━

最后补一句：

（本分析仅供参考，不构成投资建议）
`;

    const response = await fetch(
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

    const json = await response.json();

    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {

      return res.status(500).json({
        success: false,
        message: "Gemini返回为空",
        raw: json
      });

    }

    return res.status(200).json({
      success: true,
      analysis: text
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

}

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "缺少股票代码"
    });
  }

  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    // 获取股票数据（10秒超时）
    const stockRes = await fetch(
      `${protocol}://${host}/api/stock?code=${code}`,
      {
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!stockRes.ok) {
      throw new Error("获取股票数据失败");
    }

    const stock = await stockRes.json();

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
2. 不要输出横线。
3. 不要免责声明。
4. 不要结尾说明。
5. 每个模块空一行。
6. 内容专业简洁。
`;

    let aiRes;
    let aiJson;

    // 最多重试2次
    for (let i = 0; i < 2; i++) {

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      try {

        aiRes = await fetch(
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
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        console.log("Gemini HTTP状态：", aiRes.status);

        aiJson = await aiRes.json();

        console.log("Gemini返回：", JSON.stringify(aiJson));

        if (aiRes.ok) {
          break;
        }

        // 429 自动重试一次
        if (aiRes.status === 429 && i === 0) {
          console.log("429，1秒后自动重试...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        console.error("Gemini错误状态：", aiRes.status);
        console.error("Gemini错误内容：", JSON.stringify(aiJson));

        return res.status(aiRes.status).json({
          success: false,
          message: aiJson.error?.message || "Gemini接口调用失败",
          error: aiJson
        });

      } catch (err) {

        clearTimeout(timeout);

        console.error("Gemini异常：", err);

        if (err.name === "AbortError") {
          return res.status(408).json({
            success: false,
            message: "Gemini请求超时，请稍后重试。"
          });
        }

        if (i === 0) {
          console.log("请求异常，自动重试...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        throw err;
      }
    }

    const analysis =
      aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {

      console.error("Gemini返回空内容：", JSON.stringify(aiJson));

      return res.status(500).json({
        success: false,
        message: "Gemini没有返回分析内容。",
        raw: aiJson
      });
    }

    return res.status(200).json({
      success: true,
      analysis
    });

  } catch (err) {

    console.error("服务器错误：", err);

    return res.status(500).json({
      success: false,
      message: err.message || "服务器错误"
    });

  }
}

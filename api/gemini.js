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
        signal: AbortSignal.timeout(20000)
      }
    );

    if (!stockRes.ok) {
      throw new Error("获取股票数据失败");
    }

    const stock = await stockRes.json();

const prompt = `
你是一名拥有20年以上经验的A股顶级基金经理和量化分析师。

股票名称：${stock.name}
股票代码：${code}

当前价格：${stock.price}
涨跌幅：${stock.changePercent}%
今开：${stock.open}
最高：${stock.high}
最低：${stock.low}
成交量：${stock.volume}
成交额：${stock.amount}
换手率：${stock.turnoverRate}%
量比：${stock.volumeRatio}

请根据以上实时数据进行专业分析。
请严格按照下面格式回答，不要省略任何项目，不要输出Markdown表格。

━━━━━━━━━━━━━━━━

🤖 AI交易建议

操作建议：
（买入 / 持有 / 卖出）

建议仓位：

建议买入区间：

第一目标价：

止损价：

建议持有周期：

AI信心指数：
（0~100）

━━━━━━━━━━━━━━━━

📖 AI深度分析

1、为什么给出这个建议？

2、技术面分析
（趋势、均线、MACD、RSI、成交量等）

3、资金面分析
（主力资金、市场情绪等）

4、基本面分析
（行业、公司、业绩）

5、主要风险

6、最佳买点是什么？

7、哪个价格以上不建议追高？

8、短线策略

9、中线策略

10、长期观点

最后请给出一句总结。

要求：

分析必须专业。

不要模糊回答。

不要只说可能、或许。

请给出明确观点。
`;

    let aiRes;
    let aiJson;

    // 最多重试2次
   for (let i = 0; i < 2; i++) {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {

    const start = Date.now();

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

console.log("Gemini耗时：", Date.now() - start, "ms");

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

       // 配额限制
if (aiRes.status === 429) {
  return res.status(429).json({
    success: false,
    message: "🤖 AI服务当前较繁忙，请约40秒后再试。"
  });
}

// 其它错误
return res.status(aiRes.status).json({
  success: false,
  message: "AI分析暂时不可用，请稍后重试。"
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

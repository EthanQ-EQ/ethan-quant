export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "缺少 prompt"
      });
    }

    const MODELS = [
      "doubao-seed-evolving",
      "doubao-seed-2-1-turbo-260628"
    ];

    let lastError = "";

    for (const model of MODELS) {

      try {

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(
          "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${process.env.DOUBAO_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model,
              temperature: 0.4,
              max_tokens: 1800,
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ]
            })
          }
        );

        clearTimeout(timeout);

        const data = await response.json();

        if (response.ok && data.choices?.length) {

          console.log("✅ Doubao:", model);

          return res.json({
            success: true,
            model,
            content: data.choices[0].message.content
          });

        }

        console.log("❌ Doubao失败:", model, data);

        lastError = JSON.stringify(data);

      } catch (e) {

        console.log("❌ Doubao异常:", model, e.message);

        lastError = e.message;

      }

    }

    return res.status(500).json({
      success: false,
      message: lastError
    });

  } catch (e) {

    return res.status(500).json({
      success: false,
      message: e.message
    });

  }
}

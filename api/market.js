export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // 上证、深证、创业板
    const urls = [
      "https://push2.eastmoney.com/api/qt/stock/get?secid=1.000001&fields=f43,f170,f58",
      "https://push2.eastmoney.com/api/qt/stock/get?secid=0.399001&fields=f43,f170,f58",
      "https://push2.eastmoney.com/api/qt/stock/get?secid=0.399006&fields=f43,f170,f58"
    ];

    const [shRes, szRes, cybRes] =
      await Promise.all(urls.map(url => fetch(url)));

    const sh = (await shRes.json()).data;
    const sz = (await szRes.json()).data;
    const cyb = (await cybRes.json()).data;

    // 根据涨跌幅评分（0~20）
    function scoreIndex(percent) {
      if (percent >= 2) return 20;
      if (percent >= 1.5) return 18;
      if (percent >= 1) return 16;
      if (percent >= 0.5) return 14;
      if (percent >= 0) return 12;
      if (percent >= -0.5) return 10;
      if (percent >= -1) return 8;
      if (percent >= -2) return 5;
      return 2;
    }

    const shScore = scoreIndex(sh.f170 / 100);

    const szScore = Math.round(
      (
        scoreIndex(sz.f170 / 100) +
        scoreIndex(cyb.f170 / 100)
      ) / 2
    );

    // 下一版接入真实数据
    const advanceScore = 10;
    const fundScore = 8;
    const emotionScore = 8;

    const temperature =
      shScore +
      szScore +
      advanceScore +
      fundScore +
      emotionScore;

    let level = "冰点";

    if (temperature >= 85) level = "极强";
    else if (temperature >= 70) level = "偏强";
    else if (temperature >= 55) level = "震荡";
    else if (temperature >= 40) level = "偏弱";

    res.status(200).json({
      success: true,

      temperature,
      level,

      score: {
        shanghai: shScore,
        sz: szScore,
        advance: advanceScore,
        fund: fundScore,
        emotion: emotionScore
      },

      market: {
        shanghai: {
          name: sh.f58,
          changePercent: sh.f170 / 100
        },

        shenzhen: {
          name: sz.f58,
          changePercent: sz.f170 / 100
        },

        chinext: {
          name: cyb.f58,
          changePercent: cyb.f170 / 100
        }
      }

    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "获取市场数据失败",
      error: err.message
    });

  }
}

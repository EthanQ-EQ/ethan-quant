export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "请提供股票代码"
    });
  }

  // 判断沪深市场
  let secid = "";

  if (
    code.startsWith("600") ||
    code.startsWith("601") ||
    code.startsWith("603") ||
    code.startsWith("605") ||
    code.startsWith("688")
  ) {
    secid = `1.${code}`; // 上海
  } else {
    secid = `0.${code}`; // 深圳
  }

  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f60,f71,f168,f170,f169,f50,f171,f162,f49,f55,f62,f135,f136`;

  try {
    const response = await fetch(url);
    const json = await response.json();

 const d = json.data;

if (!d) {
  return res.status(404).json({
    success: false,
    message: "东方财富未返回股票数据",
    raw: json
  });
}

res.status(200).json({
 code: d.f57,
name: d.f58,

price: d.f43 / 100,
open: d.f46 / 100,
high: d.f44 / 100,
low: d.f45 / 100,
yesterday: d.f60 / 100,

change: d.f169 / 100,
changePercent: d.f170 / 100,

volume: d.f47,
amount: d.f48,

averagePrice: d.f71 / 100,
turnoverRate: d.f168 / 100,
volumeRatio: (d.f50 / 100).toFixed(2),
amplitude: d.f171 / 100,
pe: d.f162 / 100,
outsideVolume: d.f49,

limitUp: d.f51 / 100,

limitDown: d.f52 / 100,

pe: d.f162 / 100,
});
} catch (err) {

  console.error("东方财富错误：", err);

  res.status(500).json({
    success: false,
    message: "获取东方财富数据失败",
    error: err.message,
    stack: err.stack
  });

}
}

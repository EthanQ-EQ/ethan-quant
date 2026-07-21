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

  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f60,f169,f170`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "获取东方财富数据失败",
      error: err.message
    });
  }
}

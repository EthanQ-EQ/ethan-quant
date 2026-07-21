export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).json({
    success: true,

    temperature: 86,
    level: "偏强",

    score: {
      shanghai: 18,
      sz: 17,
      advance: 20,
      amount: 12,
      fund: 11,
      emotion: 8
    },

    detail: {
      shanghai: "上证指数表现良好",
      sz: "深创指数强势",
      advance: "上涨家数占优",
      amount: "成交额保持活跃",
      fund: "主力资金净流入",
      emotion: "市场情绪偏积极"
    }
  });
}

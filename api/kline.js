export default async function handler(req, res) {

  const { code, type = "day" } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "缺少股票代码"
    });
  }

  let secid = "";

  if (
    code.startsWith("600") ||
    code.startsWith("601") ||
    code.startsWith("603") ||
    code.startsWith("605") ||
    code.startsWith("688")
  ) {
    secid = `1.${code}`;
  } else {
    secid = `0.${code}`;
  }

  let klt = "101";

  switch (type) {
    case "week":
      klt = "102";
      break;
    case "month":
      klt = "103";
      break;
    default:
      klt = "101";
  }

  const url =
`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&klt=${klt}&fqt=1&lmt=300&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61`;

  try {

    const response = await fetch(url);

    const json = await response.json();

    if (!json.data || !json.data.klines) {

      return res.status(404).json({
        success:false,
        message:"没有K线数据"
      });

    }

    const list = json.data.klines.map(item=>{

      const i=item.split(",");

      return{

        date:i[0],

        open:Number(i[1]),

        close:Number(i[2]),

        high:Number(i[3]),

        low:Number(i[4]),

        volume:Number(i[5]),

        amount:Number(i[6])

      };

    });

    res.status(200).json({

      success:true,

      data:list

    });

  } catch(err){

    res.status(500).json({

      success:false,

      message:err.message

    });

  }

}

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

  if (type === "week") klt = "102";
  if (type === "month") klt = "103";

  const url =
`https://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&beg=19000101&end=20500101&rtntype=6&secid=${secid}&klt=${klt}&fqt=1&ut=fa5fd1943c7b386f172d6893dbfba10b`;

  try {

    const response = await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://quote.eastmoney.com/",
        "Accept":"application/json,text/plain,*/*"
      }
    });

    const json = await response.json();

    if (!json.data || !json.data.klines) {

      return res.status(200).json({
        success:false,
        debug:json
      });

    }

    const data = json.data.klines.map(item=>{

      const i=item.split(",");

      return{

        date:i[0],

        open:Number(i[1]),

        close:Number(i[2]),

        high:Number(i[3]),

        low:Number(i[4]),

        volume:Number(i[5]),

        amount:Number(i[6]),

        amplitude:Number(i[7]),

        changePercent:Number(i[8]),

        change:Number(i[9]),

        turnover:Number(i[10])

      };

    });

    res.status(200).json({

      success:true,

      name:json.data.name,

      code:json.data.code,

      data

    });

  } catch(e){

    res.status(500).json({

      success:false,

      message:e.message

    });

  }

}

export default async function handler(req, res) {

    const pool = [
        "300308",
        "300502",
        "300394",
        "002463",
        "002371",
        "603986",
        "688256",
        "688041",
        "601138",
        "300750",
        "600111",
        "002428",
        "002475",
        "600519",
        "000858"
    ];

    const list = [];

    for (const code of pool) {

        try {

            const response = await fetch(
                `https://qt.gtimg.cn/q=${code.startsWith("6") ? "sh" : "sz"}${code}`
            );

            const text = await response.text();

            const data = text.split("~");

            if (data.length < 40) continue;

            const name = data[1];
            const price = Number(data[3]);
            const yesterday = Number(data[4]);

            const changePercent =
                ((price - yesterday) / yesterday) * 100;

            // 第一版 EQ Score（后面继续升级）
            let score = 50;

            score += changePercent * 8;

            if (changePercent > 0)
                score += 10;

            if (changePercent > 3)
                score += 10;

            score = Math.max(
                0,
                Math.min(100, Math.round(score))
            );

            list.push({
                code,
                name,
                score,
                price,
                changePercent
            });

        } catch (e) {}

    }

    list.sort((a, b) => b.score - a.score);

    res.status(200).json(
        list.slice(0, 3)
    );

}

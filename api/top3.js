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

    const result = [];

    await Promise.all(

        pool.map(async (code) => {

            try {

                const api =
                    `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/stock?code=${code}`;

                const response = await fetch(api);

                const stock = await response.json();

                if (!stock.code) return;

                let score = 50;

                const change =
                    Number(stock.changePercent);

                score += change * 8;

                if (change > 0)
                    score += 10;

                if (change > 3)
                    score += 10;

                score = Math.max(
                    0,
                    Math.min(100, Math.round(score))
                );

                result.push({
                    code: stock.code,
                    name: stock.name,
                    score,
                    price: stock.price,
                    change: stock.changePercent
                });

            } catch (e) {}

        })

    );

    result.sort((a, b) => b.score - a.score);

    res.status(200).json(
        result.slice(0, 3)
    );

}

// Ethan Quant V0.6 实时行情开发
async function searchStock() {
    const code = document.getElementById("stockCode").value;
    const result = document.getElementById("result");

    try {
        result.innerHTML = "⏳ 正在获取实时行情...";

        const stocks = {
            "002428": {
                name: "东山精密",
                score: 88,
                advice: "继续观察",
                reason: "PCB、消费电子和新能源业务布局较完善，需关注成交量和业绩表现。"
            },
            "600519": {
                name: "贵州茅台",
                score: 95,
                advice: "长期关注",
                reason: "白酒龙头，盈利能力强，长期价值突出。"
            },
            "000858": {
                name: "五粮液",
                score: 91,
                advice: "继续持有",
                reason: "业绩稳定，高端白酒需求较强。"
            }
        };

        if (stocks[code]) {
            const stock = stocks[code];

            result.innerHTML = `
                <h3>${stock.name}（${code}）</h3>
                <p>🤖 AI评分：${stock.score}分</p>
                <p>📈 建议：${stock.advice}</p>
                <p>💡 理由：${stock.reason}</p>
                <p>🕒 更新时间：${new Date().toLocaleString()}</p>
                <button onclick="addFavorite('${code}')">⭐ 加入自选</button>
                
            `;
        } else {
            result.innerHTML = "❌ 未找到该股票";
        }

    } catch (error) {
        result.innerHTML = "❌ 获取实时行情失败";
        console.error(error);
    }
}

function handleKey(event) {
    if (event.key === "Enter") {
        searchStock();
    }
}
function addFavorite(code) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(code)) {
        favorites.push(code);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showFavorites();
        alert("⭐ 已加入自选");
    } else {
        alert("这只股票已经在自选中了");
    }
}
function showFavorites() {
    const favoritesDiv = document.getElementById("favorites");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        favoritesDiv.innerHTML = "暂无自选股票";
        return;
    }

    favoritesDiv.innerHTML = favorites
        .map(code => `<p>⭐ ${code}</p>`)
        .join("");
}
showFavorites();

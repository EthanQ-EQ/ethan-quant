// Ethan Quant V0.6 实时行情开发

async function searchStock() {
    const code = document.getElementById("stockCode").value.trim();
    const result = document.getElementById("result");

    try {
        result.innerHTML = "⏳ 正在获取实时行情...";

        const response = await fetch(`/api/stock?code=${code}`);
        const stock = await response.json();

        if (stock.code) {

            result.innerHTML = `
                <h3>${stock.name} (${stock.code})</h3>

                <p>💰 最新价：¥${stock.price}</p>
                <p>📈 涨跌额：${stock.change}</p>
                <p>📊 涨跌幅：${stock.changePercent}%</p>

                <p>🌅 今开：${stock.open}</p>
                <p>📈 最高：${stock.high}</p>
                <p>📉 最低：${stock.low}</p>

                <p>⏰ 更新时间：${new Date().toLocaleString()}</p>

                <button onclick="addFavorite('${stock.code}')">
                    ⭐ 加入自选
                </button>
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

    const names = {
        "600519": "贵州茅台",
        "002428": "东山精密",
        "000858": "五粮液"
    };

    favoritesDiv.innerHTML = favorites
        .map(code => `<p>⭐ ${names[code] || "未知股票"}（${code}）</p>`)
        .join("");
}

showFavorites();

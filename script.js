// =========================================
// Ethan Quant V0.7
// 实时搜索 + 实时自选
// =========================================

// 搜索股票
async function searchStock() {
    const code = document.getElementById("stockCode").value.trim();
    const result = document.getElementById("result");

    if (!code) {
        result.innerHTML = "请输入股票代码";
        return;
    }

    result.innerHTML = "⏳ 正在获取实时行情...";

    try {
        const response = await fetch(`/api/stock?code=${code}`);
        const stock = await response.json();

        if (!stock.code) {
            result.innerHTML = "❌ 未找到该股票";
            return;
        }

        const color =
            Number(stock.change) >= 0 ? "#ef4444" : "#22c55e";

        result.innerHTML = `
            <h3>${stock.name} (${stock.code})</h3>

            <p>💰 最新价：
                <span style="color:${color};font-weight:bold;">
                    ¥${stock.price}
                </span>
            </p>

            <p style="color:${color};">
                📈 涨跌额：${stock.change}
            </p>

            <p style="color:${color};">
                📊 涨跌幅：${stock.changePercent}%
            </p>

            <p>🌅 今开：${stock.open}</p>
            <p>📈 最高：${stock.high}</p>
            <p>📉 最低：${stock.low}</p>

            <p style="margin-top:10px;color:#888;">
                更新时间：${new Date().toLocaleString()}
            </p>

            <button onclick="addFavorite('${stock.code}')">
                ⭐ 加入自选
            </button>
        `;

    } catch (err) {
        console.error(err);
        result.innerHTML = "❌ 获取实时行情失败";
    }
}

// Enter 查询
function handleKey(event) {
    if (event.key === "Enter") {
        searchStock();
    }
}

// 添加自选
function addFavorite(code) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(code)) {
        alert("这只股票已经在自选中了");
        return;
    }

    favorites.push(code);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();

    alert("⭐ 已加入自选");
}

// 删除自选
function removeFavorite(code) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(item => item !== code);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}

// 加载自选（实时）
async function loadFavorites() {

    const favoritesDiv =
        document.getElementById("favorites");

    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        favoritesDiv.innerHTML = "暂无自选股票";
        return;
    }

    favoritesDiv.innerHTML = "⏳ 正在加载实时行情...";

    let html = "";

    for (const code of favorites) {

        try {

            const response =
                await fetch(`/api/stock?code=${code}`);

            const stock =
                await response.json();

            const color =
                Number(stock.change) >= 0
                    ? "#ef4444"
                    : "#22c55e";

            html += `
                <div class="favorite-card">

                    <div class="favorite-top">

                        <div>

                            <div class="favorite-name">
                                ⭐ ${stock.name}
                            </div>

                            <div class="favorite-code">
                                ${stock.code}
                            </div>

                        </div>

                        <button
                            onclick="removeFavorite('${stock.code}')"
                            class="delete-btn">
                            删除
                        </button>

                    </div>

                    <div
                        class="favorite-price"
                        style="color:${color};">

                        ¥${stock.price}

                    </div>

                  <div
    class="favorite-change"
    style="color:${color};">

    ${stock.change}
    (${stock.changePercent}%)

</div>

<button
    class="ai-btn"
    onclick="deepAnalyze('${stock.code}')">

    🤖 AI深度分析

</button>

</div>
            `;

        } catch (err) {

            html += `
                <div class="favorite-card">

                    <div class="favorite-name">

                        ${code}

                    </div>

                    <div style="color:#999;">
                        获取失败
                    </div>

                </div>
            `;

        }

    }

    favoritesDiv.innerHTML = html;

}

// 页面打开立即加载
loadFavorites();
// ==============================
// V0.8 市场温度
// ==============================

async function loadMarket() {

    try {

        const res = await fetch("/api/market");
        const data = await res.json();

      const temp = document.getElementById("marketTemp");
const level = document.getElementById("marketLevel");

temp.innerHTML = data.temperature + "°";
level.innerHTML = "今日市场：" + data.level;

// A股：好=红，不好=绿
if (data.temperature >= 60) {

    temp.style.color = "#ef4444";
    level.style.color = "#ef4444";

} else {

    temp.style.color = "#22c55e";
    level.style.color = "#22c55e";

}

        document.getElementById("score-shanghai").innerHTML =
            data.score.shanghai + " / 20";

        document.getElementById("score-sz").innerHTML =
            data.score.sz + " / 20";

    } catch (err) {

        console.error(err);

        document.getElementById("marketLevel").innerHTML =
            "获取市场数据失败";

    }

}

loadMarket();
// ==============================
// V0.9 今日AI推荐
// ==============================

async function loadTop3() {

    try {

        const res = await fetch("/api/top3");

        const list = await res.json();

        let html = "";

        list.forEach((stock, index) => {

            html += `
                <div class="stock">
                    <span>
                        ${index + 1}️⃣ ${stock.name}
                    </span>

                    <strong style="color:#ef4444;">
                        ${stock.score}分
                    </strong>
                </div>
            `;

        });

        document.getElementById("top3").innerHTML = html;

    } catch (err) {

        console.error(err);

        document.getElementById("top3").innerHTML =
            "AI推荐加载失败";

    }

}
loadTop3();
// ==============================
// Gemini 深度分析（V1.0）
// ==============================

// ==============================
// Gemini 深度分析（V1.0）
// ==============================

async function deepAnalyze(code) {

    try {

        const btn = event.target;
        const oldText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = "🤖 AI分析中...";

        const res = await fetch(`/api/gemini?code=${code}`);
const data = await res.json();

        btn.disabled = false;
        btn.innerHTML = oldText;

     if (!data.success) {

    let msg = data.message || "AI分析暂时不可用，请稍后重试。";

    // Gemini 配额限制
    if (
        msg.includes("quota") ||
        msg.includes("Quota") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("generate_content_free_tier_requests")
    ) {
        msg = "🤖 AI服务当前较繁忙，请约40秒后再试。";
    }

    showMsg(msg);
    return;
}

document.getElementById("aiModal").style.display = "flex";

document.getElementById("aiContent").innerText =
    data.analysis;
    } catch (err) {

        console.error(err);

        showMsg("AI分析失败，请稍后重试。");

    }

}
// ==============================
// AI弹窗
// ==============================

function closeAI() {

    document.getElementById("aiModal").style.display = "none";

}

// 点击遮罩关闭
document.addEventListener("click", function (e) {

    const modal = document.getElementById("aiModal");

    if (e.target === modal) {

        closeAI();

    }

});
async function loadDailyAI() {

    try {

        const res = await fetch("/api/daily");

        const data = await res.json();

        document.getElementById("dailyAI").innerHTML =
            data.text;

    } catch (e) {

        document.getElementById("dailyAI").innerHTML =
            "AI观点生成失败";

    }

}

loadDailyAI();
function showMsg(text) {

    document.getElementById("msgContent").innerText = text;
    document.getElementById("msgModal").style.display = "flex";

}

function closeMsg() {

    document.getElementById("msgModal").style.display = "none";

}

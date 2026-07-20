// Ethan Quant V0.6 实时行情开发
function searchStock() {
    const code = document.getElementById("stockCode").value;
    const result = document.getElementById("result");

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
        <button>⭐ 加入自选</button>
    `;
} else {
    result.innerHTML = "❌ 未找到该股票";
}
}
function handleKey(event) {
    if (event.key === "Enter") {
        searchStock();
    }
}

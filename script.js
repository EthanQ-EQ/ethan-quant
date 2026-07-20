function searchStock() {
    const code = document.getElementById("stockCode").value;
    const result = document.getElementById("result");

    if (code === "002428") {
        result.innerHTML = `
            <h3>东山精密（002428）</h3>
            <p>🤖 AI评分：88分</p>
            <p>📈 建议：继续观察</p>
            <p>💡 理由：PCB、消费电子和新能源业务布局较完善，需关注后续成交量和业绩表现。</p>
        `;
    } else {
        result.innerHTML = "未找到该股票（演示版）";
    }
}

const inputIds = ["price", "material", "outsourcing", "transport", "other", "workHours", "travelHours", "hourly", "targetMargin"];
const readNumber = (id) => { const value = Number(document.getElementById(id).value); return Number.isFinite(value) && value >= 0 ? value : 0; };
const yen = (value) => Number.isFinite(value) ? `${Math.round(value).toLocaleString("ja-JP")}円` : "—";
const percent = (value) => Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";
const setText = (id, value) => { document.getElementById(id).textContent = value; };

function calculate() {
	const price = readNumber("price"); const material = readNumber("material"); const outsourcing = readNumber("outsourcing"); const transport = readNumber("transport"); const other = readNumber("other");
	const workHours = readNumber("workHours"); const travelHours = readNumber("travelHours"); const hourly = readNumber("hourly"); const targetMargin = readNumber("targetMargin");
	const totalHours = workHours + travelHours; const cashCosts = material + outsourcing + transport + other; const grossProfit = price - cashCosts; const timeCost = totalHours * hourly; const netProfit = grossProfit - timeCost;
	const grossMargin = price > 0 ? grossProfit / price * 100 : NaN; const netMargin = price > 0 ? netProfit / price * 100 : NaN; const realHourly = totalHours > 0 ? grossProfit / totalHours : NaN;
	setText("price-result", yen(price)); setText("cash-costs", yen(cashCosts)); setText("gross-profit", yen(grossProfit)); setText("time-cost", yen(timeCost)); setText("net-profit", yen(netProfit)); setText("gross-margin", percent(grossMargin)); setText("net-margin", percent(netMargin)); setText("real-hourly", yen(realHourly)); setText("target-note", `判定基準：最低欲しい利益率 ${percent(targetMargin)}`);
	const statusArea = document.getElementById("status-area"); const status = document.getElementById("status"); const message = document.getElementById("message"); statusArea.className = "status-area";
	if (netProfit <= 0) { status.textContent = "🔴 赤字"; status.className = "status bad"; statusArea.classList.add("bad"); message.textContent = "時間コスト差引後の利益が0円以下です。"; }
	else if (!Number.isFinite(netMargin) || netMargin < targetMargin) { status.textContent = "🟡 条件見直し候補"; status.className = "status warning"; statusArea.classList.add("warning"); message.textContent = "利益はプラスですが、設定した最低利益率を下回っています。"; }
	else { status.textContent = "🟢 利益条件クリア"; status.className = "status good"; message.textContent = "設定した最低利益率を確保しています。"; }
	const targetRate = targetMargin / 100; const minimumPrice = targetRate < 1 ? (cashCosts + timeCost) / (1 - targetRate) : NaN; const discountProfit = price * 0.9 - cashCosts - timeCost; const materialRiseProfit = price - material * 1.2 - outsourcing - transport - other - timeCost; const delayProfit = price - cashCosts - (totalHours + 2) * hourly;
	setText("discount-profit", yen(discountProfit)); setText("material-rise-profit", yen(materialRiseProfit)); setText("delay-profit", yen(delayProfit)); setText("monthly-profit", yen(netProfit * 20)); setText("minimum-price", yen(minimumPrice));
}
inputIds.forEach((id) => document.getElementById(id).addEventListener("input", calculate));
calculate();

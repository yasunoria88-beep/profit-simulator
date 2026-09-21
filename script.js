const inputIds = [
    "price", "material", "outsourcing", "transport", "other", "workHours",
    "travelHours", "hourly", "targetMargin", "monthlyTarget", "workingDays", "dailyCases"
];

const readNumber = (id) => {
    const value = Number(document.getElementById(id).value);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
};

const yen = (value) => Number.isFinite(value) && Math.abs(value) < Number.MAX_SAFE_INTEGER
    ? `${Math.round(value).toLocaleString("ja-JP")}円`
    : "—";

const percent = (value) => Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";
const setText = (id, value) => { document.getElementById(id).textContent = value; };
const ceilYen = (value) => Number.isFinite(value) ? Math.ceil(value) : NaN;

function calculate() {
    const price = readNumber("price");
    const material = readNumber("material");
    const outsourcing = readNumber("outsourcing");
    const transport = readNumber("transport");
    const other = readNumber("other");
    const workHours = readNumber("workHours");
    const travelHours = readNumber("travelHours");
    const hourly = readNumber("hourly");
    const targetMargin = readNumber("targetMargin");
    const monthlyTarget = readNumber("monthlyTarget");
    const workingDays = readNumber("workingDays");
    const dailyCases = readNumber("dailyCases");

    const totalHours = workHours + travelHours;
    const cashCosts = material + outsourcing + transport + other;
    const grossProfit = price - cashCosts;
    const timeCost = totalHours * hourly;
    const netProfit = grossProfit - timeCost;
    const grossMargin = price > 0 ? grossProfit / price * 100 : NaN;
    const netMargin = price > 0 ? netProfit / price * 100 : NaN;
    const realHourly = totalHours > 0 ? grossProfit / totalHours : NaN;

    setText("price-result", yen(price));
    setText("cash-costs", yen(cashCosts));
    setText("gross-profit", yen(grossProfit));
    setText("time-cost", yen(timeCost));
    setText("net-profit", yen(netProfit));
    setText("gross-margin", percent(grossMargin));
    setText("net-margin", percent(netMargin));
    setText("real-hourly", yen(realHourly));
    setText("target-note", `判定基準：目標時給 ${yen(hourly)} ・最低利益率 ${percent(targetMargin)}`);

    const statusArea = document.getElementById("status-area");
    const status = document.getElementById("status");
    const message = document.getElementById("message");
    statusArea.className = "status-area";

    if (netProfit <= 0) {
        status.textContent = "🔴 この条件では要見直し";
        status.className = "status bad";
        statusArea.classList.add("bad");
        message.textContent = "時間コスト差引後利益が0円以下です。";
    } else if (!Number.isFinite(netMargin) || netMargin < targetMargin || realHourly < hourly) {
        status.textContent = "🟡 価格・条件を再検討";
        status.className = "status warning";
        statusArea.classList.add("warning");
        message.textContent = "利益はプラスですが、設定した目標条件を満たしていません。";
    } else {
        status.textContent = "🟢 この条件なら受注候補";
        status.className = "status good";
        message.textContent = "入力した目標時給と最低利益率の条件を満たしています。";
    }

    const marginRate = targetMargin / 100;
    const requiredByMargin = marginRate < 1 ? (cashCosts + timeCost) / (1 - marginRate) : NaN;
    const requiredByHourly = totalHours > 0 ? cashCosts + totalHours * hourly : NaN;
    const minimumPrice = ceilYen(Math.max(requiredByMargin, requiredByHourly));
    const extra = minimumPrice - price;
    setText("gap-message", Number.isFinite(minimumPrice) && extra > 0
        ? `あと ${yen(extra)} 上げると設定条件をクリア（最低必要見積額 ${yen(minimumPrice)})`
        : Number.isFinite(minimumPrice) && netProfit > 0 && netMargin >= targetMargin && realHourly >= hourly
            ? "設定した利益条件をクリアしています"
            : "現在の入力では設定条件を計算できません。金額と拘束時間を確認してください");

    const monthlyCases = workingDays * dailyCases;
    const monthlySales = price * monthlyCases;
    const monthlyGrossProfit = grossProfit * monthlyCases;
    const monthlyNetProfit = netProfit * monthlyCases;
    setText("monthly-cases", Number.isFinite(monthlyCases) ? `${Math.round(monthlyCases).toLocaleString("ja-JP")}件` : "—");
    setText("monthly-sales", yen(monthlySales));
    setText("monthly-gross-profit", yen(monthlyGrossProfit));
    setText("monthly-net-profit", yen(monthlyNetProfit));

    const monthlyGap = monthlyTarget - monthlyNetProfit;
    const goalMessage = document.getElementById("monthly-goal-message");
    goalMessage.className = "monthly-goal-message";
    if (monthlyGap > 0) {
        goalMessage.classList.add("short");
        goalMessage.textContent = `目標まであと ${yen(monthlyGap)}`;
    } else {
        goalMessage.textContent = "月間目標をクリア";
    }

    if (netProfit > 0) {
        const requiredCases = Math.ceil(monthlyTarget / netProfit);
        const requiredDailyCases = workingDays > 0 ? requiredCases / workingDays : NaN;
        setText("required-cases", `必要案件数：${requiredCases.toLocaleString("ja-JP")}件`);
        setText("required-daily-cases", `必要な1日平均案件数：${Number.isFinite(requiredDailyCases) ? requiredDailyCases.toFixed(1) : "—"}件`);
    } else {
        setText("required-cases", "現在の条件では案件数を増やしても目標達成を計算できません。");
        setText("required-daily-cases", "価格またはコスト条件を見直してください。");
    }

    const discountProfit = price * 0.9 - cashCosts - timeCost;
    const materialRiseProfit = price - material * 1.2 - outsourcing - transport - other - timeCost;
    const delayProfit = price - cashCosts - (totalHours + 2) * hourly;
    setText("discount-profit", yen(discountProfit));
    setText("material-rise-profit", yen(materialRiseProfit));
    setText("delay-profit", yen(delayProfit));
}

inputIds.forEach((id) => document.getElementById(id).addEventListener("input", calculate));
calculate();

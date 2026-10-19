// Steady Gains - progress: strength trend per main lift, weekly volume, and
// week 1 against now. Charts are inline SVG, one series each, with a hover /
// touch tooltip and a table alternative.

import { esc, shortDate, loadText } from "./dom.js";
import { getExercise } from "../library.js";
import { e1rmSeries, weeklyVolumes, totals, baselineComparison } from "../coach.js";

const MAIN_LIFTS = ["db_bench", "db_floor_press", "sa_db_bench", "db_hip_thrust", "glute_bridge", "prone_db_row", "prone_sa_row", "db_pullover", "kb_pullover"];

const W = 320, H = 132, PAD_L = 32, PAD_R = 10, PAD_T = 12, PAD_B = 22;

function niceRange(values) {
    let lo = Math.min(...values), hi = Math.max(...values);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.15;
    return [Math.max(0, Math.floor(lo - pad)), Math.ceil(hi + pad)];
}

function gridlines(lo, hi) {
    const ticks = [lo, (lo + hi) / 2, hi];
    const y = v => PAD_T + (H - PAD_T - PAD_B) * (1 - (v - lo) / (hi - lo));
    return { y, svg: ticks.map(t => `<line class="gridline" x1="${PAD_L}" x2="${W - PAD_R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>` +
        `<text class="axis" x="${PAD_L - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${Math.round(t)}</text>`).join("") };
}

function lineChart(points, label) {
    const [lo, hi] = niceRange(points.map(p => p.v));
    const { y, svg: grid } = gridlines(lo, hi);
    const n = points.length;
    const x = i => PAD_L + (W - PAD_L - PAD_R) * (n === 1 ? 0.5 : i / (n - 1));
    const d = points.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join(" ");
    const last = points[n - 1];
    const step = n > 1 ? (W - PAD_L - PAD_R) / (n - 1) : W;
    const hits = points.map((p, i) => `<rect class="hit" x="${(x(i) - step / 2).toFixed(1)}" y="0" width="${step.toFixed(1)}" height="${H}" data-i="${i}"/>`).join("");
    const tips = points.map(p => ({ x: 0, title: p.title, value: p.value }));
    points.forEach((p, i) => { tips[i].x = x(i) / W; tips[i].y = y(p.v) / H; });
    return `<div class="chart" data-tips='${esc(JSON.stringify(tips))}'>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
            ${grid}
            <text class="axis" x="${PAD_L}" y="${H - 6}">${esc(points[0].short)}</text>
            <text class="axis" x="${W - PAD_R}" y="${H - 6}" text-anchor="end">${esc(last.short)}</text>
            <path class="line" d="${d}"/>
            ${points.map((p, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4"/>`).join("")}
            <line class="cross" x1="0" x2="0" y1="${PAD_T}" y2="${H - PAD_B}" visibility="hidden"/>
            ${hits}
        </svg>
    </div>`;
}

function barChart(points, label) {
    const hi = Math.max(...points.map(p => p.v)) * 1.1 || 1;
    const { y, svg: grid } = gridlines(0, hi);
    const n = points.length;
    const slot = (W - PAD_L - PAD_R) / n;
    const bw = Math.max(2, Math.min(28, slot - 2)); // 2px surface gap between bars
    const r = Math.min(4, bw / 2);
    const base = y(0);
    const bars = points.map((p, i) => {
        const x0 = PAD_L + slot * i + (slot - bw) / 2;
        const top = Math.min(y(p.v), base - r);
        // Rounded top, square base anchored to the axis.
        return `<path class="bar" d="M${x0.toFixed(1)} ${base.toFixed(1)}V${(top + r).toFixed(1)}Q${x0.toFixed(1)} ${top.toFixed(1)} ${(x0 + r).toFixed(1)} ${top.toFixed(1)}H${(x0 + bw - r).toFixed(1)}Q${(x0 + bw).toFixed(1)} ${top.toFixed(1)} ${(x0 + bw).toFixed(1)} ${(top + r).toFixed(1)}V${base.toFixed(1)}Z"/>`;
    }).join("");
    const hits = points.map((p, i) => `<rect class="hit" x="${(PAD_L + slot * i).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${H}" data-i="${i}"/>`).join("");
    const tips = points.map((p, i) => ({ x: (PAD_L + slot * i + slot / 2) / W, y: y(p.v) / H, title: p.title, value: p.value }));
    return `<div class="chart" data-tips='${esc(JSON.stringify(tips))}'>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
            ${grid}${bars}
            <text class="axis" x="${PAD_L}" y="${H - 6}">${esc(points[0].short)}</text>
            <text class="axis" x="${W - PAD_R}" y="${H - 6}" text-anchor="end">${esc(points[n - 1].short)}</text>
            <line class="cross" x1="0" x2="0" y1="${PAD_T}" y2="${H - PAD_B}" visibility="hidden"/>
            ${hits}
        </svg>
    </div>`;
}

export function render({ app }) {
    const t = totals(app);
    const tiles = `<div class="tiles">
        <div class="tile"><div class="v">${t.sessions}</div><div class="k">sessions</div></div>
        <div class="tile"><div class="v">${t.sets}</div><div class="k">sets logged</div></div>
        <div class="tile"><div class="v">${t.prs}</div><div class="k">new bests</div></div>
    </div>`;

    if (t.sessions === 0) {
        return `<h1>Progress</h1><p class="sub">Your charts appear here after your first session.</p>${tiles}`;
    }

    const lifts = MAIN_LIFTS.map(id => ({ id, series: e1rmSeries(app, id) })).filter(l => l.series.length > 0);
    const liftCards = lifts.map(({ id, series }) => {
        const ex = getExercise(id);
        const r1 = v => Math.round(v * 10) / 10;
        const pts = series.map(s => ({ v: r1(s.e1rm), short: "Wk " + s.week, title: shortDate(s.date) + " · week " + s.week, value: r1(s.e1rm) + " kg" }));
        const first = r1(series[0].e1rm), last = r1(series[series.length - 1].e1rm);
        const delta = last - first;
        return `<div class="card">
            <div class="spread"><h3>${esc(ex.name)}</h3><span class="num"><strong>${last}</strong> kg${series.length > 1 ? ` <small>${delta >= 0 ? "+" : ""}${delta.toFixed(1)}</small>` : ""}</span></div>
            ${series.length > 1 ? lineChart(pts, ex.name + " estimated strength over time") : '<p class="hint">One more session for a trend line.</p>'}
        </div>`;
    }).join("");

    const vols = weeklyVolumes(app);
    const volCard = vols.length ? `<div class="card">
        <div class="spread"><h3>Weekly volume</h3><small>kg × reps, weights only</small></div>
        ${barChart(vols.map(v => ({ v: v.volume, short: "Wk " + v.week, title: "Week " + v.week, value: v.volume.toLocaleString() + " kg" })), "Weekly training volume")}
        <details class="cues"><summary>Show as table</summary>
            <table class="data"><thead><tr><th>Week</th><th>Volume (kg)</th></tr></thead><tbody>${vols.map(v => `<tr><td>${v.week}</td><td>${v.volume.toLocaleString()}</td></tr>`).join("")}</tbody></table>
        </details>
    </div>` : "";

    const base = baselineComparison(app);
    const baseCard = base.length ? `<div class="card">
        <h3>Week 1 vs now</h3>
        <table class="data"><thead><tr><th>Lift</th><th>Week 1</th><th>Now</th><th>Retest</th></tr></thead><tbody>
        ${base.map(b => `<tr><td>${esc(getExercise(b.exerciseId).name)}</td>
            <td>${esc(loadText(b.exerciseId, b.baseline.load, app.equipment))} × ${b.baseline.reps}</td>
            <td>${esc(loadText(b.exerciseId, b.load, app.equipment))}</td>
            <td>${b.retest ? b.retest.reps + " reps" : "wk 26"}</td></tr>`).join("")}
        </tbody></table>
        <p class="hint">Retest: as many reps as you can at your week-1 weight, in week 26.</p>
    </div>` : "";

    return `
<h1>Progress</h1>
<p class="sub">Strength is your estimated one-rep max (kg per dumbbell or bell), from the best set each session.</p>
${tiles}
<div style="margin-top:12px">${liftCards}${volCard}${baseCard}</div>`;
}

// Tooltips: one per chart, positioned from the precomputed tip list.
export function mount(root) {
    for (const chart of root.querySelectorAll(".chart[data-tips]")) {
        const tips = JSON.parse(chart.dataset.tips);
        const cross = chart.querySelector(".cross");
        const tip = document.createElement("div");
        tip.className = "tooltip";
        tip.hidden = true;
        chart.appendChild(tip);
        const show = i => {
            const t = tips[i];
            if (!t) return;
            tip.innerHTML = esc(t.title) + "<br><b>" + esc(t.value) + "</b>";
            tip.style.left = Math.min(85, Math.max(15, t.x * 100)) + "%";
            tip.style.top = (t.y * chart.clientHeight) + "px";
            tip.hidden = false;
            cross.setAttribute("x1", t.x * W);
            cross.setAttribute("x2", t.x * W);
            cross.setAttribute("visibility", "visible");
        };
        const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); };
        chart.addEventListener("pointermove", e => { const r = e.target.closest("[data-i]"); if (r) show(Number(r.dataset.i)); });
        chart.addEventListener("pointerdown", e => { const r = e.target.closest("[data-i]"); if (r) show(Number(r.dataset.i)); });
        chart.addEventListener("pointerleave", hide);
    }
}

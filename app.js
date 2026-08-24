/* PumpRoute — app logic. Vanilla JS, no dependencies, no server. */
'use strict';

/* PRO unlock codes. OWNER: change before promoting (see PAYMENTS.md). */
const PRO_CODES = ['PR-PRO-49-55D6-7BF4', 'PR-PRO-49-DEMO-1109-7C06'];
const FREE_CAP = 10;
const LS = { data: 'pr_data', pro: 'pr_pro' };
const SERVICES = ['Septic pump-out', 'Grease trap', 'Porta-john service', 'Effluent filter', 'Inspection', 'Other'];

/* demo data anchored to "today" so statuses show immediately */
const d = (offsetDays) => { const t = new Date(); t.setDate(t.getDate() + offsetDays); return t.toISOString().slice(0, 10); };
let customers = [
  { name: "Miller's Diner", loc: "481 Oak Ave · 555-0142", svc: 'Grease trap', interval: 90, last: d(-100) },
  { name: 'J. Family Residence', loc: "12 Ridge Rd · 555-0187", svc: 'Septic pump-out', interval: 365, last: d(-300) },
  { name: 'SunnyGas Station', loc: "Hwy 9 mile 4 · 555-0110", svc: 'Septic pump-out', interval: 180, last: d(-190) },
  { name: 'Riverside Campground', loc: "Lake Rd 7 · 555-0166", svc: 'Porta-john service', interval: 7, last: d(-3) }
];
let pro = localStorage.getItem(LS.pro) === '1';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => { const t = new Date(iso + 'T00:00:00'); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

/* ============ engine ============ */
function nextDue(c) { return c.last ? addDays(c.last, Number(c.interval) || 0) : null; }
function dueIn(c) { const nd = nextDue(c); return nd === null ? null : daysBetween(todayISO(), nd); }
function status(c) {
  const dd = dueIn(c);
  if (dd === null) return { cls: 'chip-ok', label: 'no date' };
  if (dd < 0) return { cls: 'chip-over', label: `${-dd}d OVERDUE` };
  if (dd <= 14) return { cls: 'chip-soon', label: dd === 0 ? 'due TODAY' : `due in ${dd}d` };
  return { cls: 'chip-ok', label: `due ${dd}d` };
}
function routeList() {
  return customers
    .map(c => ({ ...c, nd: nextDue(c), dd: dueIn(c) }))
    .filter(c => c.dd !== null && c.dd <= 14)
    .sort((a, b) => a.dd - b.dd);
}

/* ============ editor ============ */
function renderRows() {
  const wrap = $('rows');
  wrap.innerHTML = '';
  customers.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'cust-row';
    const svcOpts = SERVICES.map(s => `<option ${s === c.svc ? 'selected' : ''}>${s}</option>`).join('');
    row.innerHTML =
      `<input value="${esc(c.name)}" data-i="${i}" data-f="name" placeholder="Customer">` +
      `<input class="loc-i" value="${esc(c.loc)}" data-i="${i}" data-f="loc" placeholder="Address · phone">` +
      `<select class="svc-i" data-i="${i}" data-f="svc">${svcOpts}</select>` +
      `<input type="number" min="1" step="1" value="${c.interval}" data-i="${i}" data-f="interval" title="Days between services">` +
      `<input type="date" value="${c.last || ''}" data-i="${i}" data-f="last" title="Last service date">` +
      `<span class="status-chip ${status(c).cls}" id="chip-${i}">${status(c).label}</span>` +
      `<button class="done-btn" data-i="${i}" title="Mark serviced today">✓ done</button>` +
      `<button class="row-x" data-i="${i}" title="Remove">✕</button>`;
    wrap.appendChild(row);
  });
}

/* ============ render ============ */
function render() {
  const overdue = customers.filter(c => dueIn(c) !== null && dueIn(c) < 0).length;
  const week = customers.filter(c => { const dd = dueIn(c); return dd !== null && dd >= 0 && dd <= 14; }).length;
  const month = customers.filter(c => { const dd = dueIn(c); return dd !== null && dd >= 0 && dd <= 30; }).length;
  $('stOverdue').textContent = overdue;
  $('stWeek').textContent = week;
  $('stMonth').textContent = month;
  $('stTotal').textContent = customers.length;
  $('freeCap').textContent = pro ? '' :
    (customers.length >= FREE_CAP ? `Free tier holds ${FREE_CAP} customers — unlock PRO for unlimited.` : `Free tier: ${customers.length}/${FREE_CAP} customers.`);
  $('addRow').disabled = false; // keep clickable so the cap path can open the pay modal
  $('addRow').style.opacity = (!pro && customers.length >= FREE_CAP) ? .6 : 1;

  // route sheet
  $('p_date').textContent = 'Week of ' + todayISO();
  const tb = $('p_rows');
  tb.innerHTML = '';
  const list = routeList();
  if (!list.length) {
    tb.innerHTML = '<tr><td colspan="6" style="color:#667085">Nobody due within 14 days.</td></tr>';
  } else {
    list.forEach(c => {
      const dd = c.dd;
      const cls = dd < 0 ? 'due-over' : 'due-soon';
      const dueTxt = dd < 0 ? `${c.nd} (${-dd}d overdue)` : c.nd;
      tb.insertAdjacentHTML('beforeend',
        `<tr><td><span class="rd-box"></span></td><td><strong>${esc(c.name)}</strong></td>` +
        `<td>${esc(c.loc)}</td><td>${esc(c.svc)}</td><td class="rd-due ${cls}">${dueTxt}</td>` +
        `<td>${dd < 0 ? 'OVERDUE' : dd === 0 ? 'TODAY' : dd + 'd'}</td></tr>`);
    });
  }
  $('p_foot').textContent = pro ? 'PumpRoute PRO' : 'Made with PumpRoute — free pump-out scheduler';
  save();
}

/* ============ persistence ============ */
function save() { try { localStorage.setItem(LS.data, JSON.stringify(customers)); } catch (e) {} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(LS.data) || 'null');
    if (Array.isArray(d) && d.length) customers = d;
  } catch (e) {}
}

/* ============ PRO ============ */
function applyPro() {
  $('proBadge').classList.toggle('hidden', !pro);
  $('exportBtn').classList.toggle('hidden', !pro);
  $('importWrap').classList.toggle('hidden', !pro);
}
function exportCsv() {
  const rows = [['Name', 'Location/phone', 'Service', 'Interval days', 'Last service', 'Next due']]
    .concat(customers.map(c => [c.name, c.loc, c.svc, c.interval, c.last || '', nextDue(c) || '']));
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'pumproute-customers.csv';
  a.click();
}
function importCsv(text) {
  const lines = text.trim().split(/\r?\n/).slice(1);
  const added = [];
  lines.forEach(line => {
    const m = line.match(/^\s*"?(.*?)"?\s*,\s*"?(.*?)"?\s*,\s*"?(.*?)"?\s*,\s*"?(\d+)"?\s*,\s*"?([\d-]*)"?\s*/);
    if (m && m[1]) added.push({ name: m[1], loc: m[2] || '', svc: m[3] || SERVICES[0], interval: Number(m[4]) || 90, last: m[5] || '' });
  });
  if (added.length) { customers = customers.concat(added); renderRows(); render(); }
  alert(`Imported ${added.length} customers.`);
}

/* ============ wire-up ============ */
document.addEventListener('DOMContentLoaded', () => {
  load();
  renderRows();
  applyPro();
  render();

  $('rows').addEventListener('input', e => {
    const t = e.target, i = +t.dataset.i, f = t.dataset.f;
    if (f === undefined || Number.isNaN(i)) return;
    if (f === 'interval') customers[i][f] = Number(t.value) || 0; else customers[i][f] = t.value;
    render();
  });
  $('rows').addEventListener('click', e => {
    if (e.target.classList.contains('row-x')) {
      customers.splice(+e.target.dataset.i, 1); renderRows(); render();
    } else if (e.target.classList.contains('done-btn')) {
      const i = +e.target.dataset.i;
      customers[i].last = todayISO();
      renderRows(); render();
    }
  });
  $('addRow').addEventListener('click', () => {
    if (!pro && customers.length >= FREE_CAP) { $('proBtn').click(); return; }
    customers.push({ name: '', loc: '', svc: SERVICES[0], interval: 90, last: todayISO() });
    renderRows(); render();
    const inputs = $('rows').querySelectorAll('input[data-f="name"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
  $('printBtn').addEventListener('click', () => window.print());
  $('exportBtn').addEventListener('click', exportCsv);
  $('importFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => importCsv(String(r.result));
    r.readAsText(f);
  });

  // pay modal
  const openPay = () => { $('payModal').classList.remove('hidden'); $('codeMsg').textContent = ''; };
  $('proBtn').addEventListener('click', openPay);
  $('proBtn2').addEventListener('click', openPay);
  $('payClose').addEventListener('click', () => $('payModal').classList.add('hidden'));
  $('codeBtn').addEventListener('click', () => {
    const code = $('codeInput').value.trim().toUpperCase();
    if (PRO_CODES.map(c => c.toUpperCase()).includes(code)) {
      pro = true; localStorage.setItem(LS.pro, '1'); applyPro(); render();
      $('codeMsg').textContent = '✓ PRO unlocked — unlimited customers + CSV import/export.';
      $('codeMsg').className = 'code-msg ok';
      setTimeout(() => $('payModal').classList.add('hidden'), 1500);
    } else {
      $('codeMsg').textContent = 'Invalid code — check the code from your payment receipt.';
      $('codeMsg').className = 'code-msg bad';
    }
  });
  $('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('codeBtn').click(); });

  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));
});

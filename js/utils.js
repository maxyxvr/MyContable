/**
 * utils.js — Formateadores y helpers globales
 */

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function fmt(n) { return COP.format(Number(n) || 0); }
function fmtDate(d) { if (!d) return '—'; return new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
function today() { return new Date().toISOString().split('T')[0]; }
function initials(n) { return (n || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function avatarColor(n) {
    const colors = ['bg-blue-100 text-blue-900', 'bg-emerald-100 text-emerald-800', 'bg-purple-100 text-purple-800', 'bg-amber-100 text-amber-800', 'bg-red-100 text-red-800'];
    return colors[(n || '').charCodeAt(0) % colors.length];
}
function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / 86400000);
}
function statusBadge(status) {
    const map = {
        pending: 'bg-amber-100 text-amber-700',
        paid: 'bg-emerald-100 text-emerald-700',
        overdue: 'bg-red-100 text-red-700',
        declared: 'bg-emerald-100 text-emerald-700',
        urgent: 'bg-red-100 text-red-700',
    };
    const labels = { pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido', declared: 'Declarado', urgent: 'Urgente' };
    const cls = map[status] || 'bg-slate-100 text-slate-600';
    const lbl = labels[status] || status;
    return `<span class="px-3 py-1 rounded-full text-xs font-bold ${cls}">${lbl}</span>`;
}
function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    const color = type === 'success' ? 'bg-blue-900 text-white' : 'bg-red-600 text-white';
    t.className = `fixed bottom-6 right-6 z-[9999] ${color} px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
function confirm(msg, cb) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center';
    overlay.innerHTML = `
    <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
      <p class="text-slate-700 font-semibold mb-6">${msg}</p>
      <div class="flex gap-3 justify-end">
        <button id="_cancel" class="px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
        <button id="_ok" class="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700">Eliminar</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#_ok').onclick = () => { overlay.remove(); cb(); };
    overlay.querySelector('#_cancel').onclick = () => overlay.remove();
}

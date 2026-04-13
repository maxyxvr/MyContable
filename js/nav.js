/**
 * nav.js — Barra de navegación lateral compartida
 * Uso: <script src="../js/nav.js"></script>  (o "../js/nav.js" según nivel)
 * Agregar al body: <div id="nav-root"></div>
 */

(function () {
    const links = [
        { href: 'INDEX', icon: 'home', label: 'Inicio' },
        { href: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { href: 'invoice', icon: 'receipt', label: 'Facturación' },
        { href: 'expenses', icon: 'point_of_sale', label: 'Gastos' },
        { href: 'clients', icon: 'people', label: 'Terceros' },
        { href: 'suppliers', icon: 'handshake', label: 'Proveedores' },
        { href: 'catalog', icon: 'inventory_2', label: 'Catálogo' },
        { href: 'payroll', icon: 'badge', label: 'Nómina' },
        { href: 'reports', icon: 'bar_chart', label: 'Reportes' },
        { href: 'taxes', icon: 'account_balance', label: 'Impuestos' },
        { href: 'receivable', icon: 'arrow_downward', label: 'Por Cobrar' },
        { href: 'payable', icon: 'arrow_upward', label: 'Por Pagar' },
        { href: 'cashflow', icon: 'waterfall_chart', label: 'Flujo de Caja' },
        { href: 'reconciliation', icon: 'compare_arrows', label: 'Conciliación' },
        { href: 'settings', icon: 'settings', label: 'Configuración' },
    ];

    const isRoot = !window.location.pathname.includes('/screens/');
    const base = isRoot ? 'screens/' : '';
    const idx = isRoot ? 'index.html' : '../index.html';
    const current = window.location.pathname.split('/').pop().replace('.html', '');

    function resolve(href) {
        if (href === 'INDEX') return idx;
        return base + href + '.html';
    }
    function isActive(href) {
        if (href === 'INDEX') return current === 'index';
        return current === href;
    }

    const css = `
    <style>
      #mc-sidebar { position:fixed; top:0; left:0; height:100vh; width:220px; background:#00236f;
        display:flex; flex-direction:column; z-index:100; transform:translateX(0); transition:transform .25s; overflow-y:auto; }
      #mc-sidebar::-webkit-scrollbar { width:4px; }
      #mc-sidebar::-webkit-scrollbar-thumb { background:rgba(255,255,255,.2); border-radius:2px; }
      #mc-sidebar .brand { padding:20px 16px 12px; display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,.1); flex-shrink:0; }
      #mc-sidebar .brand span { font-family:Manrope,sans-serif; font-weight:800; color:#fff; font-size:17px; }
      #mc-sidebar nav { padding:12px 8px; flex:1; }
      #mc-sidebar a { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px;
        color:rgba(255,255,255,.65); text-decoration:none; font-size:13px; font-weight:500; transition:all .15s; margin-bottom:2px; }
      #mc-sidebar a:hover { background:rgba(255,255,255,.1); color:#fff; }
      #mc-sidebar a.active { background:rgba(255,255,255,.18); color:#fff; font-weight:700; }
      #mc-sidebar a .material-symbols-outlined { font-size:18px; width:18px; }
      #mc-toggle { position:fixed; top:14px; left:14px; z-index:101; background:#00236f; border:none;
        width:36px; height:36px; border-radius:8px; display:none; align-items:center; justify-content:center; cursor:pointer; }
      #mc-toggle .material-symbols-outlined { color:#fff; font-size:20px; }
      #mc-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; }
      body { margin-left:220px; }
      @media(max-width:768px){
        body { margin-left:0; }
        #mc-sidebar { transform:translateX(-100%); }
        #mc-sidebar.open { transform:translateX(0); }
        #mc-toggle { display:flex; }
        #mc-overlay.open { display:block; }
      }
    </style>`;

    const html = `${css}
    <button id="mc-toggle"><span class="material-symbols-outlined">menu</span></button>
    <div id="mc-overlay"></div>
    <aside id="mc-sidebar">
      <div class="brand">
        <span class="material-symbols-outlined" style="color:#7dd3fc;font-size:22px"></span>
        <span>MyContable</span>
      </div>
      <nav>
        ${links.map(l => `
          <a href="${resolve(l.href)}" class="${isActive(l.href) ? 'active' : ''}">
            <span class="material-symbols-outlined">${l.icon}</span>${l.label}
          </a>`).join('')}
        <div style="margin-top:20px; padding-top:12px; border-top:1px solid rgba(255,255,255,.1)">
          <a href="#" onclick="Auth.logout()" style="color:#fca5a5">
            <span class="material-symbols-outlined">logout</span>Cerrar sesión
          </a>
        </div>
      </nav>
    </aside>`;

    document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('nav-root');
        if (root) { root.innerHTML = html; } else {
            const d = document.createElement('div');
            d.innerHTML = html;
            document.body.prepend(d);
        }
        document.getElementById('mc-toggle').addEventListener('click', () => {
            document.getElementById('mc-sidebar').classList.toggle('open');
            document.getElementById('mc-overlay').classList.toggle('open');
        });
        document.getElementById('mc-overlay').addEventListener('click', () => {
            document.getElementById('mc-sidebar').classList.remove('open');
            document.getElementById('mc-overlay').classList.remove('open');
        });
    });
})();

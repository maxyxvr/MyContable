/**
 * db.js — Capa de datos localStorage para MyContable
 * Todas las entidades se persisten aquí.
 */

const DB_KEYS = {
    clients: 'mc_clients',
    products: 'mc_products',
    invoices: 'mc_invoices',
    expenses: 'mc_expenses',
    employees: 'mc_employees',
    taxes: 'mc_taxes',
    bankMoves: 'mc_bank_moves',
    settings: 'mc_settings',
};

/* ── Utilidades base con Cifrado AES-256 ───────────────────── */
function _get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    
    // Si parece JSON plano (migración), lo devolvemos y lo ciframos si hay llave
    if (raw.startsWith('[') || raw.startsWith('{')) {
        const data = JSON.parse(raw);
        const keyAuth = Auth.getSessionKey();
        if (keyAuth) _set(key, data); // Migrar a cifrado en caliente
        return data;
    }

    // Intentar descifrar
    const keyAuth = Auth.getSessionKey();
    if (!keyAuth) return []; // No hay llave = no hay acceso a datos cifrados

    try {
        const bytes = CryptoJS.AES.decrypt(raw, keyAuth);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted) || [];
    } catch (e) {
        console.error('Error descifrando ' + key, e);
        return [];
    }
}

function _getObj(key, def = {}) {
    const raw = localStorage.getItem(key);
    if (!raw) return def;
    
    if (raw.startsWith('{') || raw.startsWith('[')) {
        const data = JSON.parse(raw);
        const keyAuth = Auth.getSessionKey();
        if (keyAuth) _set(key, data);
        return data;
    }

    const keyAuth = Auth.getSessionKey();
    if (!keyAuth) return def;

    try {
        const bytes = CryptoJS.AES.decrypt(raw, keyAuth);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted) || def;
    } catch (e) {
        console.error('Error descifrando objeto ' + key, e);
        return def;
    }
}

function _set(key, val) {
    const keyAuth = Auth.getSessionKey();
    if (!keyAuth) {
        // Si no hay llave (ej: seed inicial), guardamos plano temporalmente
        // El primer login lo migrará.
        localStorage.setItem(key, JSON.stringify(val));
        return;
    }
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(val), keyAuth).toString();
    localStorage.setItem(key, encrypted);
}

function _id() { return '_' + Math.random().toString(36).slice(2, 10); }

/* ── Clientes / Terceros ────────────────────────────────────── */
const Clients = {
    all() { return _get(DB_KEYS.clients); },
    byId(id) { return this.all().find(c => c.id === id) || null; },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(c => c.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); list.push(data);
        }
        _set(DB_KEYS.clients, list);
        return data;
    },
    delete(id) { _set(DB_KEYS.clients, this.all().filter(c => c.id !== id)); },
    search(q) { q = q.toLowerCase(); return this.all().filter(c => c.name.toLowerCase().includes(q) || (c.nit || '').includes(q)); },
};

/* ── Productos / Servicios ──────────────────────────────────── */
const Products = {
    all() { return _get(DB_KEYS.products); },
    byId(id) { return this.all().find(p => p.id === id) || null; },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(p => p.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); list.push(data);
        }
        _set(DB_KEYS.products, list);
        return data;
    },
    delete(id) { _set(DB_KEYS.products, this.all().filter(p => p.id !== id)); },
    search(q) { q = q.toLowerCase(); return this.all().filter(p => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)); },
};

/* ── Facturas ───────────────────────────────────────────────── */
const Invoices = {
    all() { return _get(DB_KEYS.invoices); },
    byId(id) { return this.all().find(inv => inv.id === id) || null; },
    nextNumber() {
        const list = this.all();
        const max = list.reduce((a, b) => Math.max(a, b.number || 0), 0);
        return max + 1;
    },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(inv => inv.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id();
            data.number = this.nextNumber();
            data.code = `FE-${new Date().getFullYear()}-${String(data.number).padStart(4, '0')}`;
            data.createdAt = new Date().toISOString();
            data.status = data.status || 'pending';
            list.push(data);
        }
        _set(DB_KEYS.invoices, list);
        return data;
    },
    updateStatus(id, status) {
        const list = this.all();
        const i = list.findIndex(inv => inv.id === id);
        if (i >= 0) { list[i].status = status; _set(DB_KEYS.invoices, list); }
    },
    delete(id) { _set(DB_KEYS.invoices, this.all().filter(inv => inv.id !== id)); },
    pending() { return this.all().filter(inv => inv.status === 'pending'); },
    paid() { return this.all().filter(inv => inv.status === 'paid'); },
    overdue() {
        const today = new Date().toISOString().split('T')[0];
        return this.all().filter(inv => inv.status === 'pending' && inv.dueDate < today);
    },
};

/* ── Gastos ─────────────────────────────────────────────────── */
const Expenses = {
    all() { return _get(DB_KEYS.expenses); },
    byId(id) { return this.all().find(e => e.id === id) || null; },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(e => e.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); list.push(data);
        }
        _set(DB_KEYS.expenses, list);
        return data;
    },
    delete(id) { _set(DB_KEYS.expenses, this.all().filter(e => e.id !== id)); },
    thisMonth() {
        const ym = new Date().toISOString().slice(0, 7);
        return this.all().filter(e => (e.date || e.createdAt).slice(0, 7) === ym);
    },
};

/* ── Empleados ──────────────────────────────────────────────── */
const Employees = {
    all() { return _get(DB_KEYS.employees); },
    byId(id) { return this.all().find(e => e.id === id) || null; },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(e => e.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); list.push(data);
        }
        _set(DB_KEYS.employees, list);
        return data;
    },
    delete(id) { _set(DB_KEYS.employees, this.all().filter(e => e.id !== id)); },
    calcNet(emp) {
        const base = Number(emp.salary) || 0;
        const transport = base <= 2_600_000 ? 162_000 : 0;
        const health = Math.round(base * 0.04);
        const pension = Math.round(base * 0.04);
        return { base, transport, health, pension, net: base + transport - health - pension };
    },
};

/* ── Impuestos ──────────────────────────────────────────────── */
const Taxes = {
    all() { return _get(DB_KEYS.taxes); },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(t => t.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); list.push(data);
        }
        _set(DB_KEYS.taxes, list);
        return data;
    },
    delete(id) { _set(DB_KEYS.taxes, this.all().filter(t => t.id !== id)); },
};

/* ── Movimientos Bancarios ──────────────────────────────────── */
const BankMoves = {
    all() { return _get(DB_KEYS.bankMoves); },
    save(data) {
        const list = this.all();
        if (data.id) {
            const i = list.findIndex(m => m.id === data.id);
            if (i >= 0) { list[i] = { ...list[i], ...data }; }
        } else {
            data.id = _id(); data.createdAt = new Date().toISOString(); data.matched = false; list.push(data);
        }
        _set(DB_KEYS.bankMoves, list);
        return data;
    },
    toggle(id) {
        const list = this.all();
        const i = list.findIndex(m => m.id === id);
        if (i >= 0) { list[i].matched = !list[i].matched; _set(DB_KEYS.bankMoves, list); }
    },
    delete(id) { _set(DB_KEYS.bankMoves, this.all().filter(m => m.id !== id)); },
};

/* ── Configuración ──────────────────────────────────────────── */
const Settings = {
    get() { return _getObj(DB_KEYS.settings, { company: 'MyContable S.A.S', nit: '', regime: 'iva', currency: 'COP', notifications: true, autoNumber: true, darkMode: false }); },
    save(obj) { _set(DB_KEYS.settings, { ...this.get(), ...obj }); },
};

/* ── KPIs globales ──────────────────────────────────────────── */
const KPIs = {
    compute() {
        const inv = Invoices.all();
        const exp = Expenses.all();
        const totalReceivable = inv.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0);
        const totalPaid = inv.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
        const totalExpenses = exp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const balance = totalPaid - totalExpenses;
        return { totalReceivable, totalPaid, totalExpenses, balance };
    }
};

/* ── Seed data (primera vez) ────────────────────────────────── */
function seedIfEmpty() {
    if (Clients.all().length === 0) {
        Clients.save({ name: 'Soluciones Globales S.A.S', nit: '900.123.456-7', type: 'cliente', phone: '3001234567', email: 'info@soluciones.com' });
        Clients.save({ name: 'Carlos Mario Restrepo', nit: '1.032.987.654', type: 'proveedor', phone: '3109876543', email: 'carlos@email.com' });
    }
    if (Products.all().length === 0) {
        Products.save({ name: 'Consultoría Contable', sku: 'SRV-001', type: 'service', price: 350000, cost: 120000, stock: null });
        Products.save({ name: 'Resma Papel A4', sku: 'PRD-045', type: 'product', price: 18500, cost: 12000, stock: 50 });
    }
    if (Employees.all().length === 0) {
        Employees.save({ name: 'Ana Martínez', cc: '1.010.234.567', role: 'Contadora Senior', salary: 4500000 });
        Employees.save({ name: 'Juan Restrepo', cc: '1.032.987.654', role: 'Auxiliar Contable', salary: 1800000 });
    }
    if (BankMoves.all().length === 0) {
        BankMoves.save({ date: '2026-03-15', description: 'Transferencia entrada cliente', amount: 12500000, type: 'credit' });
        BankMoves.save({ date: '2026-03-28', description: 'Débito nómina', amount: -8400000, type: 'debit' });
        BankMoves.save({ date: '2026-03-30', description: 'Comisión bancaria', amount: -560000, type: 'debit' });
    }
    if (Taxes.all().length === 0) {
        Taxes.save({ name: 'IVA', form: 'F-300', period: 'Bim. 2 · 2026', amount: 4560000, dueDate: '2026-04-01', status: 'pending' });
        Taxes.save({ name: 'Retención Fuente', form: 'F-350', period: 'Marzo · 2026', amount: 1230000, dueDate: '2026-03-20', status: 'paid' });
        Taxes.save({ name: 'Renta', form: 'F-110', period: 'Año · 2025', amount: 12800000, dueDate: '2025-04-15', status: 'paid' });
    }
}

seedIfEmpty();

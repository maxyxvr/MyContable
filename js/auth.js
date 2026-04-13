/**
 * auth.js — MyContable Authentication
 * Usuario: LizContable  |  Contraseña: lise060925
 *
 * Usa sessionStorage para que la sesión expire al cerrar el navegador.
 */

const Auth = (() => {
    const SESSION_KEY = 'mc_session';
    const CREDENTIALS = { user: 'LizContable', pass: 'lise060925' };

    /** Devuelve true si hay sesión activa */
    function isAuthenticated() {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    }

    /**
     * Intenta iniciar sesión.
     * @returns {boolean} true si las credenciales son correctas
     */
    function login(user, pass) {
        if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            return true;
        }
        return false;
    }

    /** Cierra la sesión y redirige al login */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        // Calcular ruta relativa al login desde cualquier profundidad
        const depth = (location.pathname.match(/\//g) || []).length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        location.href = prefix + 'login.html';
    }

    /**
     * Guard: llama esto al inicio de cada página protegida.
     * Si no hay sesión redirige al login automáticamente.
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            const depth = (location.pathname.match(/\//g) || []).length - 1;
            const prefix = depth > 0 ? '../'.repeat(depth) : '';
            location.replace(prefix + 'login.html');
        }
    }

    return { isAuthenticated, login, logout, requireAuth };
})();

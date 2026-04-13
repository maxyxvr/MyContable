/**
 * auth.js — MyContable Authentication
 * Usuario: LizContable  |  Contraseña: lise060925
 *
 * Usa sessionStorage para que la sesión expire al cerrar el navegador.
 */

const Auth = (() => {
    const SESSION_KEY = 'mc_session';
    const PASS_KEY = 'mc_key'; // Stores the derived key for the session
    const SALT = 'mc_salt_88'; // Static salt for this installation
    const CREDENTIALS = { user: 'LizContable', pass: 'lise060925' };

    /** Devuelve true si hay sesión activa */
    function isAuthenticated() {
        return sessionStorage.getItem(SESSION_KEY) === 'true' && sessionStorage.getItem(PASS_KEY) !== null;
    }

    /** Deriva una llave fuerte a partir del password */
    function _deriveKey(pass) {
        return CryptoJS.PBKDF2(pass, SALT, { keySize: 256 / 32, iterations: 100 }).toString();
    }

    /** Obtiene la llave de la sesión actual */
    function getSessionKey() {
        return sessionStorage.getItem(PASS_KEY);
    }

    /**
     * Intenta iniciar sesión.
     * @returns {boolean} true si las credenciales son correctas
     */
    function login(user, pass) {
        if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            sessionStorage.setItem(PASS_KEY, _deriveKey(pass));
            return true;
        }
        return false;
    }

    /** Cierra la sesión y redirige al login */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(PASS_KEY);
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

    return { isAuthenticated, login, logout, requireAuth, getSessionKey };
})();

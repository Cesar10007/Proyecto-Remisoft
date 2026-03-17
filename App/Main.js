/* ── TOAST ── */
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    setTimeout(() => t.className = 'toast', 3200);
}

/* ── MODALES ── */
function openModal(type) {
    document.getElementById('modal-' + type).classList.add('open');
}

function closeModal(type) {
    document.getElementById('modal-' + type).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
        if (e.target === el) el.classList.remove('open');
    });
});

/* ── VALIDACIÓN ── */
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

/* ── LOGIN (sección inline) ── */
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;
    const rol   = document.getElementById('login-rol').value;

    if (!email || !validateEmail(email)) return showToast('Ingresa un correo válido', 'error');
    if (pass.length < 6)                 return showToast('Contraseña muy corta', 'error');
    if (!rol)                            return showToast('Selecciona tu rol', 'error');

    showToast('✓ Bienvenido — conectando al sistema como ' + rol);
}

/* ── LOGIN (modal) ── */
function handleLoginModal() {
    const email = document.getElementById('m-login-email').value.trim();
    const pass  = document.getElementById('m-login-pass').value;
    const rol   = document.getElementById('m-login-rol').value;

    if (!email || !validateEmail(email)) return showToast('Ingresa un correo válido', 'error');
    if (pass.length < 6)                 return showToast('Contraseña muy corta', 'error');
    if (!rol)                            return showToast('Selecciona tu rol', 'error');

    closeModal('login');
    showToast('✓ Bienvenido — conectando como ' + rol);
}

/* ── REGISTRO (sección inline) ── */
function handleRegistro() {
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email  = document.getElementById('reg-email').value.trim();
    const pass   = document.getElementById('reg-pass').value;
    const terms  = document.getElementById('reg-terms').checked;

    if (!nombre)                         return showToast('Ingresa tu nombre', 'error');
    if (!email || !validateEmail(email)) return showToast('Correo inválido', 'error');
    if (pass.length < 8)                 return showToast('La contraseña debe tener mínimo 8 caracteres', 'error');
    if (!terms)                          return showToast('Debes aceptar la política de datos', 'error');

    showToast('✓ Cuenta creada exitosamente. ¡Bienvenido!');
}

/* ── REGISTRO (modal) ── */
function handleRegistroModal() {
    const nombre = document.getElementById('m-reg-nombre').value.trim();
    const email  = document.getElementById('m-reg-email').value.trim();
    const pass   = document.getElementById('m-reg-pass').value;
    const terms  = document.getElementById('m-reg-terms').checked;

    if (!nombre)                         return showToast('Ingresa tu nombre', 'error');
    if (!email || !validateEmail(email)) return showToast('Correo inválido', 'error');
    if (pass.length < 8)                 return showToast('Mínimo 8 caracteres', 'error');
    if (!terms)                          return showToast('Debes aceptar la política de datos', 'error');

    closeModal('registro');
    showToast('✓ Cuenta creada exitosamente. ¡Bienvenido!');
}
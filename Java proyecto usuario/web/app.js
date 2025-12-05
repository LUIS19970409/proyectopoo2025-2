// Simple web UI that stores users in localStorage
const LS_KEY = 'usuarios_demo_v1';

const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return [];
  try { return JSON.parse(raw); } catch(e){ return []; }
}

function saveUsers(users){
  localStorage.setItem(LS_KEY, JSON.stringify(users));
  renderUsers();
}

function renderUsers(){
  const users = loadUsers();
  const ul = document.getElementById('userList');
  if(ul) ul.textContent = users.map(u => JSON.stringify(u)).join('\n');
}

function ensureAdmin(){
  const users = loadUsers();
  const adminExists = users.find(u => u.username === 'admin');
  if(!adminExists){
    users.push({ username: 'admin', password: 'admin123', role: 'ADMIN', nombre: 'Administrador', email: '' });
    saveUsers(users);
  }
}

function setupExtraField(){
  const role = document.getElementById('role').value;
  const extra = document.getElementById('extra');
  extra.innerHTML = '';
  // keep extra fields minimal: only ADMIN gets 'nivel'
  if(role === 'ADMIN'){
    extra.innerHTML = '<div class="input-box"><input id="nivel" type="number" value="1" placeholder=" "><label>Nivel (num)</label></div>';
  } else {
    extra.innerHTML = '';
  }
}

document.getElementById('role').addEventListener('change', setupExtraField);
setupExtraField();

function showView(id){
  const views = ['loginView','registerView'];
  views.forEach(v=>{
    const el = document.getElementById(v);
    if(!el) return;
    if(v===id) el.classList.remove('hidden'); else el.classList.add('hidden');
  });
}

// Navigation buttons
// Navigation: support anchors/links inside the styled boxes
const goRegisterBtn = document.getElementById('goRegister');
if(goRegisterBtn) goRegisterBtn.addEventListener('click', (ev)=>{
  ev.preventDefault();
  const re = document.getElementById('registerError'); if(re) re.textContent = '';
  const rs = document.getElementById('registerSuccess'); if(rs) rs.classList.add('hidden');
  showView('registerView');
});
const backToLoginBtns = [document.getElementById('backToLogin'), document.getElementById('successBack')];
backToLoginBtns.forEach(b=>{ if(b) b.addEventListener('click', (ev)=>{ ev.preventDefault(); showView('loginView'); }); });

document.getElementById('registerForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;

  const users = loadUsers();
  const errorEl = document.getElementById('registerError');
  // Validaciones simples
  if(!username){ if(errorEl) errorEl.textContent = 'El campo Usuario es obligatorio.'; return; }
  if(!password){ if(errorEl) errorEl.textContent = 'El campo Clave es obligatorio.'; return; }
  if(!nombre || !nombre.trim()){ if(errorEl) errorEl.textContent = 'El campo Nombre es obligatorio.'; return; }
  const emailTrim = (email||'').trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailTrim || !emailRe.test(emailTrim)){ if(errorEl) errorEl.textContent = 'Introduce un correo válido.'; return; }
  if(users.find(u=>u.username===username)){
    if(errorEl) errorEl.textContent = 'El usuario ya existe';
    return;
  }
  const base = { role, username, password, nombre, email };
  // remove facultad from stored user data; only include nivel for ADMIN
  if(role==='ADMIN') base.nivel = parseInt(document.getElementById('nivel')?document.getElementById('nivel').value:1) || 1;

  users.push(base);
  saveUsers(users);
  e.target.reset();
  setupExtraField();
  if(errorEl) errorEl.textContent = '';
  const rs = document.getElementById('registerSuccess'); if(rs) rs.classList.remove('hidden');
});

document.getElementById('loginForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const users = loadUsers();
  const found = users.find(x=>x.username===u && x.password===p);
  const out = document.getElementById('loginResult');
  if(found){
    // store current session username (simple session)
    try{ sessionStorage.setItem(CURRENT_USER_KEY, found.username); }catch(e){}
    if(found.username === 'admin'){
      // redirect admin to admin panel
      window.location.href = 'admin.html';
      return;
    }
    // If user already has a plan, send them to the menu (no payment)
    if(found.plan && found.plan !== ''){
      window.location.href = 'menu.html';
      return;
    }
    // otherwise let them choose a plan on the dashboard
    window.location.href = 'dashboard.html';
    return;
  } else {
    if(out) out.innerHTML = '<span style="color:crimson">Credenciales invalidas</span>';
  }
});

document.getElementById('clearStorage').addEventListener('click', ()=>{
  if(confirm('Borrar todos los usuarios en localStorage?')){
    localStorage.removeItem(LS_KEY);
    renderUsers();
  }
});

renderUsers();
// Start showing login
showView('loginView');
// Ensure admin user exists
ensureAdmin();

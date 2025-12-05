const LS_KEY = 'usuarios_demo_v1';
const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return [];
  try { return JSON.parse(raw); } catch(e){ return []; }
}
function saveUsers(users){
  localStorage.setItem(LS_KEY, JSON.stringify(users));
  // Only render the users table when the table exists on the page
  if(document.querySelector('#usersTable tbody')){
    renderUsers();
  }
}

function renderUsers(){
  const users = loadUsers();
  const tbody = document.querySelector('#usersTable tbody');
  if(!tbody) return; // nothing to render on this page
  tbody.innerHTML = '';
  users.forEach((u, idx)=>{
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
    const roleLabel = u.role ? `<span class="role-badge">${u.role}</span>` : '';
    tr.innerHTML = `<td style="padding:8px">${u.username}</td><td style="padding:8px">${u.nombre||''}</td><td style="padding:8px">${u.email||''}</td><td style="padding:8px">${roleLabel}</td><td style="padding:8px"><button data-idx="${idx}" class="small-btn del-btn">Borrar</button></td>`;
    tbody.appendChild(tr);
  });
  // wire delete
  document.querySelectorAll('.del-btn').forEach(b=> b.addEventListener('click', (ev)=>{
    const idx = parseInt(ev.currentTarget.getAttribute('data-idx'));
    if(!isNaN(idx)){
      const users = loadUsers();
      const user = users[idx];
      if(user && user.username === 'admin'){
        alert('No se puede borrar el usuario admin.');
        return;
      }
      if(confirm('Borrar usuario ' + (user?user.username:'') + '?')){
        users.splice(idx,1);
        saveUsers(users);
      }
    }
  }));
}

// protect route: only admin session allowed
(function protect(){
  try{
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur || cur !== 'admin'){
      // If not authenticated as admin, send to admin landing to login first
      window.location.href = 'admin.html';
    }
  }catch(e){ window.location.href = 'index.html'; }
})();

const btnRefresh = document.getElementById('btnRefresh');
if(btnRefresh) btnRefresh.addEventListener('click', renderUsers);
const btnClearAll = document.getElementById('btnClearAll');
if(btnClearAll) btnClearAll.addEventListener('click', ()=>{
  if(confirm('Borrar todos los usuarios en localStorage? (admin no será borrado)')){
    // preserve admin
    const users = loadUsers().filter(u => u.username === 'admin');
    saveUsers(users);
    alert('Usuarios borrados (se preservó admin).');
  }
});
const btnLogout = document.getElementById('btnLogout');
if(btnLogout) btnLogout.addEventListener('click', ()=>{
  try{ sessionStorage.removeItem(CURRENT_USER_KEY); }catch(e){}
  window.location.href = 'index.html';
});

// add user form (only bind when present on page)
const form = document.getElementById('adminAddForm');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = document.getElementById('a_username').value.trim();
    const password = document.getElementById('a_password').value;
    const nombre = document.getElementById('a_nombre').value.trim();
    const email = document.getElementById('a_email').value.trim();
    const role = document.getElementById('a_role').value;
    if(!username || !password){ alert('Usuario y clave obligatorios'); return; }
    const users = loadUsers();
    // block if username already exists
    if(users.find(u => u.username === username)){
      alert('Usuario ya existe');
      return;
    }
    const emailLC = (email||'').toLowerCase();
    // if an email was provided, ensure it's unique (case-insensitive)
    if(emailLC){
      if(users.find(u => (u.email||'').toLowerCase() === emailLC)){
        alert('El correo ya está en uso');
        return;
      }
    }
    const u = { username, password, nombre, email, role };
    users.push(u);
    saveUsers(users);
    form.reset();
    alert('Usuario agregado');
  });
}

// initial render (only if users table exists)
if(document.querySelector('#usersTable tbody')){
  renderUsers();
}

const LS_KEY = 'usuarios_demo_v1';
const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function saveUsers(users){ localStorage.setItem(LS_KEY, JSON.stringify(users)); }

// protect route
(function(){
  try{
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur){ window.location.href = 'index.html'; }
  }catch(e){ window.location.href = 'index.html'; }
})();

// populate form
document.addEventListener('DOMContentLoaded', ()=>{
  const cur = sessionStorage.getItem(CURRENT_USER_KEY);
  if(!cur) return window.location.href = 'index.html';
  const users = loadUsers();
  const me = users.find(u=>u.username === cur);
  if(!me) return window.location.href = 'index.html';
  document.getElementById('pUsername').value = me.username || '';
  document.getElementById('pNombre').value = me.nombre || '';
  document.getElementById('pEmail').value = me.email || '';
  const badge = document.getElementById('pPlanBadge');
  badge.textContent = me.plan ? (me.plan === 'gratuito' ? 'Plan Gratuito' : me.plan === 'institucional' ? 'Plan Institucional' : 'Plan Premium') : 'Sin plan';

  // Build plan select options, excluding the current plan so user cannot 'change' to the same plan
  const select = document.getElementById('pPlanSelect');
  if(select){
    const options = [
      {v:'', t:'Sin plan'},
      {v:'gratuito', t:'Plan Gratuito'},
      {v:'institucional', t:'Plan Institucional'},
      {v:'premium', t:'Plan Premium'}
    ];
    select.innerHTML = '';
    options.forEach(o=>{
      if(me.plan && me.plan === o.v) return; // skip current plan
      const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.t; select.appendChild(opt);
    });
  }
});

// save
const form = document.getElementById('profilePageForm');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur) return window.location.href = 'index.html';
    const users = loadUsers();
    const idx = users.findIndex(u=>u.username === cur);
    if(idx === -1) return window.location.href = 'index.html';
    const nombre = document.getElementById('pNombre').value.trim();
    const email = document.getElementById('pEmail').value.trim();
    const plan = document.getElementById('pPlanSelect').value || '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email && !emailRe.test(email)){ alert('Introduce un correo válido'); return; }
    // If no plan change selected, just update name/email
    const currentPlan = users[idx].plan || '';
    users[idx].nombre = nombre;
    users[idx].email = email;

    if(!plan){
      // user selected 'Sin plan' or no change
      users[idx].plan = '';
      saveUsers(users);
      const badge = document.getElementById('pPlanBadge'); badge.textContent = 'Sin plan';
      alert('Perfil guardado');
      return;
    }

    if(plan === currentPlan){
      // nothing to change besides name/email
      saveUsers(users);
      alert('Perfil guardado — sin cambios de plan');
      return;
    }

    // If the chosen plan is gratuito => set directly without payment
    if(plan === 'gratuito'){
      users[idx].plan = 'gratuito';
      saveUsers(users);
      const badge = document.getElementById('pPlanBadge'); badge.textContent = 'Plan Gratuito';
      alert('Has cambiado al Plan Gratuito');
      return;
    }

    // For paid plans, save name/email first then redirect to payment flow
    if(plan === 'institucional' || plan === 'premium'){
      saveUsers(users);
      // redirect to payment to complete purchase
      window.location.href = 'payment.html?plan=' + encodeURIComponent(plan);
      return;
    }
  });
}

// cancel/back
const cancelBtn = document.getElementById('cancelBtn');
if(cancelBtn) cancelBtn.addEventListener('click', ()=>{ window.location.href = 'ai.html'; });
const backBtn = document.getElementById('backBtn');
if(backBtn) backBtn.addEventListener('click', ()=>{ window.location.href = 'ai.html'; });

// logout
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ sessionStorage.removeItem(CURRENT_USER_KEY); window.location.href = 'index.html'; });

const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem('usuarios_demo_v1');
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}

// Protect route
(function(){
  try{
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur) window.location.href = 'index.html';
  }catch(e){ window.location.href = 'index.html'; }
})();

document.addEventListener('DOMContentLoaded', ()=>{
  const cur = sessionStorage.getItem(CURRENT_USER_KEY);
  if(!cur) return;
  const users = loadUsers();
  const me = users.find(u=>u.username === cur);
  const userIcon = document.getElementById('userIcon');
  const userMenu = document.getElementById('userMenu');
  const menuProfile = document.getElementById('menuProfile');
  const menuLogout = document.getElementById('menuLogout');
  const goAssistant = document.getElementById('goAssistant');
  const goProfile = document.getElementById('goProfile');

  if(userIcon){
    userIcon.addEventListener('click', (e)=>{ e.stopPropagation(); userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block'; });
  }
  document.addEventListener('click', ()=>{ if(userMenu) userMenu.style.display = 'none'; });

  if(menuProfile) menuProfile.addEventListener('click', ()=>{ window.location.href='profile.html'; });
  if(menuLogout) menuLogout.addEventListener('click', ()=>{ sessionStorage.removeItem(CURRENT_USER_KEY); window.location.href='index.html'; });
  if(goProfile) goProfile.addEventListener('click', ()=>{ window.location.href='profile.html'; });
  if(goAssistant){
    try{
      const curU = sessionStorage.getItem(CURRENT_USER_KEY);
      const usersList = loadUsers();
      const meUser = usersList.find(u=>u.username === curU) || {};
      const role = (meUser.role || '').toLowerCase();
      if(role.includes('rect')) goAssistant.textContent = 'Asistente (Rector)';
      else if(role.includes('abog')) goAssistant.textContent = 'Asistente (Abogado)';
      else goAssistant.textContent = 'Asistente';
    }catch(e){ goAssistant.textContent = 'Asistente'; }
    goAssistant.addEventListener('click', ()=>{ window.location.href = 'ai.html'; });
  }
  // Optionally update icon title
  if(userIcon && me) userIcon.setAttribute('aria-label', 'Cuenta de ' + (me.nombre || me.username));
});

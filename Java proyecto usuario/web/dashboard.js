const CURRENT_USER_KEY = 'current_user_session';

// helper: load users from localStorage
function loadUsers(){
  const raw = localStorage.getItem('usuarios_demo_v1');
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function saveUsers(users){ localStorage.setItem('usuarios_demo_v1', JSON.stringify(users)); }

// protect route: only logged users allowed
(function protect(){
  try{
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur){ window.location.href = 'index.html'; }
  }catch(e){ window.location.href = 'index.html'; }
})();

// personalize header and show small avatar name
(function personalize(){
  try{
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(cur){
      const h = document.querySelector('h1');
      if(h) h.textContent = 'Bienvenido, ' + cur;
      // also attach name to profile button title
      const userIcon = document.getElementById('userIcon');
      if(userIcon) userIcon.setAttribute('aria-label', 'Cuenta de ' + cur);
    }
  }catch(e){}
})();

// Logout helper used by menu and the top logout button
function doLogout(){
  try{ sessionStorage.removeItem(CURRENT_USER_KEY); }catch(e){}
  window.location.href='index.html';
}

// top-right logout button (kept for convenience)
const btn = document.getElementById('btnLogout');
if(btn) btn.addEventListener('click', ()=>{ doLogout(); });

// User menu toggle and profile handling
const userIcon = document.getElementById('userIcon');
const userMenu = document.getElementById('userMenu');
const menuLogout = document.getElementById('menuLogout');
const menuProfile = document.getElementById('menuProfile');
const profileModal = document.getElementById('profileModal');
const pfForm = document.getElementById('profileForm');

if(userIcon){
  userIcon.addEventListener('click', (ev)=>{
    ev.stopPropagation();
    if(userMenu.style.display === 'block') userMenu.style.display = 'none'; else userMenu.style.display = 'block';
  });
}

// hide menu when clicking outside
document.addEventListener('click', ()=>{ if(userMenu) userMenu.style.display = 'none'; });
if(userMenu) userMenu.addEventListener('click', (e)=>{ e.stopPropagation(); });

if(menuLogout) menuLogout.addEventListener('click', ()=>{ doLogout(); });

// Show profile modal and populate fields
// Show profile modal and populate fields (left for backward-compatibility, but profile page used)
function openProfile(){
  const cur = sessionStorage.getItem(CURRENT_USER_KEY);
  if(!cur) return doLogout();
  const users = loadUsers();
  const me = users.find(u=>u.username === cur);
  if(!me) return;
  document.getElementById('pfUsername').value = me.username || '';
  document.getElementById('pfNombre').value = me.nombre || '';
  document.getElementById('pfEmail').value = me.email || '';
  const planSel = document.getElementById('pfPlan');
  if(planSel) planSel.value = me.plan || '';
  const planInfo = document.getElementById('profilePlanInfo');
  if(planInfo) planInfo.textContent = me.plan ? (me.plan === 'gratuito' ? 'Plan seleccionado: Plan Gratuito' : me.plan === 'institucional' ? 'Plan seleccionado: Plan Institucional' : 'Plan seleccionado: Plan Premium') : 'No tiene plan asignado';
  profileModal.style.display = 'flex';
}

// Handle plan selection from dashboard cards
document.addEventListener('DOMContentLoaded', ()=>{
  const btns = document.querySelectorAll('.card-btn[data-plan]');
  btns.forEach(b=>{
    b.addEventListener('click', (ev)=>{
      const plan = b.getAttribute('data-plan');
      if(!plan) return;
      // gratuito: set plan and redirect to confirmation
      if(plan === 'gratuito'){
        const users = loadUsers();
        const cur = sessionStorage.getItem(CURRENT_USER_KEY);
        if(!cur){ window.location.href='index.html'; return; }
        const idx = users.findIndex(u=>u.username===cur);
        if(idx===-1){ window.location.href='index.html'; return; }
        users[idx].plan = 'gratuito';
        saveUsers(users);
        window.location.href = 'confirmation.html?plan=gratuito';
        return;
      }
      // paid plans: go to payment page with plan param
      if(plan === 'institucional' || plan === 'premium'){
        window.location.href = 'payment.html?plan=' + encodeURIComponent(plan);
        return;
      }
    });
  });
});

if(menuProfile) menuProfile.addEventListener('click', ()=>{ userMenu.style.display='none'; window.location.href = 'profile.html'; });

// cancel profile editing
const pfCancel = document.getElementById('pfCancel');
if(pfCancel) pfCancel.addEventListener('click', (e)=>{ e.preventDefault(); profileModal.style.display='none'; });

// submit profile form: update localStorage
if(pfForm){
  pfForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur) return doLogout();
    const users = loadUsers();
    const idx = users.findIndex(u=>u.username === cur);
    if(idx === -1) return;
    const nombre = document.getElementById('pfNombre').value.trim();
    const email = document.getElementById('pfEmail').value.trim();
    const plan = document.getElementById('pfPlan').value || '';
    // basic validation for email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email && !emailRe.test(email)){
      alert('Introduce un correo válido');
      return;
    }
    users[idx].nombre = nombre;
    users[idx].email = email;
    users[idx].plan = plan;
    saveUsers(users);
    // if displayed header uses username only, optional: update to nombre
    const h = document.querySelector('h1'); if(h) h.textContent = 'Bienvenido, ' + (users[idx].nombre || users[idx].username);
    profileModal.style.display = 'none';
    // show confirmation
    alert('Perfil guardado');
  });
}

// --- Simple in-dashboard IA (reglas) ---
document.addEventListener('DOMContentLoaded', ()=>{
  const openAiBtn = document.getElementById('openAiBtn');
  const aiModal = document.getElementById('aiModal');
  const aiClose = document.getElementById('aiClose');
  const aiSend = document.getElementById('aiSendBtn');
  const aiClear = document.getElementById('aiClearBtn');
  const aiPrompt = document.getElementById('aiPrompt');
  const aiResponses = document.getElementById('aiResponses');
  const aiExampleSelect = document.getElementById('aiExampleQuestions');
  const aiInsertExampleBtn = document.getElementById('aiInsertExampleBtn');
  const aiCopyExampleBtn = document.getElementById('aiCopyExampleBtn');
  let aiAnswersMap = {};

  function loadCurrentUser(){
    const cur = sessionStorage.getItem(CURRENT_USER_KEY);
    if(!cur) return null;
    const users = loadUsers();
    return users.find(u=>u.username === cur) || null;
  }

  function isLawyerQuestion(q){
    if(!q) return false;
    const text = q.toLowerCase();
    const kws = ['contrato','demanda','juicio','abogado','cláusula','clausula','ley','juríd','jurid','fiscal','penal','civil','laboral','sentencia','reclam','arbitra','honorario','notario','testamento','propiedad','arrend'];
    return kws.some(k=>text.includes(k));
  }

  function pushAiResponse(message){
    const el = document.createElement('div'); el.className = 'response fade-in';
    aiResponses.prepend(el);
    el.textContent = message;
  }

  if(openAiBtn){
    openAiBtn.addEventListener('click', ()=>{
      const me = loadCurrentUser();
      if(!me){ alert('Debe iniciar sesión para usar el Asistente IA'); return; }
      aiModal.style.display = 'flex';
      aiPrompt.focus();
    });
  }

  if(aiClose) aiClose.addEventListener('click', ()=>{ aiModal.style.display='none'; });
  // close by clicking outside content
  if(aiModal) aiModal.addEventListener('click', (ev)=>{ if(ev.target === aiModal) aiModal.style.display='none'; });

  if(aiClear) aiClear.addEventListener('click', ()=>{
    if(aiPrompt) aiPrompt.value = '';
    try{
      // remove entire chat history (all nodes inside aiResponses)
      aiResponses.innerHTML = '';
    }catch(e){ console.warn('Could not clear messages', e); }
  });

  // helper send so we can reuse from click and Enter key
  function normalizeText(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
  function findBestAiAnswer(input){
    if(!input) return null;
    const normInput = normalizeText(input);
    if(aiAnswersMap[input]) return aiAnswersMap[input];
    const exactKey = Object.keys(aiAnswersMap).find(k=>normalizeText(k)===normInput);
    if(exactKey) return aiAnswersMap[exactKey];
    const containsKey = Object.keys(aiAnswersMap).find(k=>normalizeText(k).includes(normInput) || normInput.includes(normalizeText(k)));
    if(containsKey) return aiAnswersMap[containsKey];
    const inputWords = normInput.split(/\s+/).filter(w=>w.length>2);
    let best = {k:null,score:0};
    Object.keys(aiAnswersMap).forEach(k=>{
      const kw = normalizeText(k).split(/\s+/).filter(w=>w.length>2);
      let common = 0; inputWords.forEach(w=>{ if(kw.includes(w)) common++; });
      const score = common / Math.max(1, kw.length);
      if(score>best.score){ best = {k,score}; }
    });
    if(best.k && best.score >= 0.25) return aiAnswersMap[best.k];
    return null;
  }

  function handleAiSend(){
    const q = aiPrompt.value.trim();
    console.log('[dashboard.js] aiSend, q=', q);
    if(!q) return;
    const matched = findBestAiAnswer(q);
    if(matched){ pushAiResponse(matched); aiPrompt.value=''; return; }
    // fallback rules
    const text = q.toLowerCase();
    let reply = '';
    if(/cláusula|clausula|definicion de clausula|que es una clausula/i.test(text)){
      reply = 'Una cláusula es una disposición o pacto incluido en un contrato que regula derechos y obligaciones de las partes. Suele concretar condiciones, plazos, causas de resolución y penalizaciones.';
    } else if(/contrato|arrendamiento|compraventa/i.test(text)){
      reply = 'Cláusulas típicas: objeto, duración, precio, resolución, penalizaciones, confidencialidad y jurisdicción.';
    } else {
      reply = 'Revise plazos, obligaciones y responsabilidades. Para redactar la cláusula, indique el contexto y las partes implicadas.';
    }
    pushAiResponse(reply);
    aiPrompt.value = '';
  }

  if(aiSend){
    aiSend.addEventListener('click', handleAiSend);
  }
  if(aiPrompt){
    aiPrompt.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); handleAiSend(); } });
  }

  // Load example questions and populate dashboard modal selector
  if(aiExampleSelect){
    // Choose questions file depending on user role (rector vs abogado)
    const me = loadCurrentUser();
    let qFile = 'questions.json';
    if(me && me.role && me.role.toLowerCase().includes('rect')) qFile = 'rector_questions.json';
    fetch(qFile).then(r=>r.json()).then(list=>{
      if(!Array.isArray(list)) return;
      list.forEach(q=>{ const opt = document.createElement('option'); opt.value = q; opt.textContent = q; aiExampleSelect.appendChild(opt); });
    }).catch(err=>{ console.warn('Could not load', qFile, err); });
  }
  // Load answers map depending on role
  (function(){
    const me = loadCurrentUser();
    let qaFile = 'questions_answers.json';
    if(me && me.role && me.role.toLowerCase().includes('rect')) qaFile = 'rector_questions_answers.json';
    fetch(qaFile).then(r=>r.json()).then(list=>{ if(!Array.isArray(list)) return; list.forEach(item=>{ if(item && item.q && item.a) aiAnswersMap[item.q]=item.a; }); }).catch(err=>{ console.warn('Could not load', qaFile, err); });
  })();
  if(aiInsertExampleBtn) aiInsertExampleBtn.addEventListener('click', ()=>{
    const v = aiExampleSelect.value;
    if(!v) return;
    // Insert into the prompt and add as a user message in the responses area (do not auto-send)
    aiPrompt.value = v;
    aiPrompt.focus();
    try{
      const el = document.createElement('div'); el.className = 'user-message fade-in'; el.textContent = v; aiResponses.prepend(el);
    }catch(e){ console.warn('Could not insert example into aiResponses', e); }
  });
  if(aiCopyExampleBtn) aiCopyExampleBtn.addEventListener('click', ()=>{ const v = aiExampleSelect.value; if(!v) return; navigator.clipboard.writeText(v).then(()=>{ alert('Pregunta copiada al portapapeles'); }).catch(()=>{ alert('No se pudo copiar'); }); });
});

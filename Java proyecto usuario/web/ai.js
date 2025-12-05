const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem('usuarios_demo_v1');
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}

function roleTitle(role){
  if(!role) return 'Asistente';
  const r = role.toLowerCase();
  if(r.includes('abog')) return 'IA para Abogados';
  if(r.includes('rect')) return 'IA para Rectores';
  if(r.includes('admin')) return 'Herramientas de administración';
  return 'Asistente especializado';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const cur = sessionStorage.getItem(CURRENT_USER_KEY);
  if(!cur) return window.location.href='index.html';
  const users = loadUsers();
  const me = users.find(u=>u.username === cur) || {};
  const title = document.getElementById('aiTitle');
  title.textContent = roleTitle(me.role || me.role || '');

  const userIcon = document.getElementById('userIcon');
  const userMenu = document.getElementById('userMenu');
  const menuProfile = document.getElementById('menuProfile');
  const menuLogout = document.getElementById('menuLogout');

  if(userIcon){
    userIcon.addEventListener('click', (e)=>{ e.stopPropagation(); userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block'; });
  }
  document.addEventListener('click', ()=>{ if(userMenu) userMenu.style.display = 'none'; });
  if(menuProfile) menuProfile.addEventListener('click', ()=>{ window.location.href='profile.html'; });
  if(menuLogout) menuLogout.addEventListener('click', ()=>{ sessionStorage.removeItem(CURRENT_USER_KEY); window.location.href='index.html'; });

  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const prompt = document.getElementById('prompt');
  const responses = document.getElementById('responses');
  const exampleSelect = document.getElementById('exampleQuestions');
  const insertExampleBtn = document.getElementById('insertExampleBtn');
  const copyExampleBtn = document.getElementById('copyExampleBtn');
  let answersMap = {};

  // Allow sending by clicking the button or pressing Enter (no Shift)
  function normalizeText(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
  function findBestAnswer(input){
    if(!input) return null;
    const normInput = normalizeText(input);
    if(answersMap[input]) return answersMap[input];
    const exactKey = Object.keys(answersMap).find(k=>normalizeText(k)===normInput);
    if(exactKey) return answersMap[exactKey];
    const containsKey = Object.keys(answersMap).find(k=>normalizeText(k).includes(normInput) || normInput.includes(normalizeText(k)));
    if(containsKey) return answersMap[containsKey];
    const inputWords = normInput.split(/\s+/).filter(w=>w.length>2);
    let best = {k:null,score:0};
    Object.keys(answersMap).forEach(k=>{
      const kw = normalizeText(k).split(/\s+/).filter(w=>w.length>2);
      let common = 0; inputWords.forEach(w=>{ if(kw.includes(w)) common++; });
      const score = common / Math.max(1, kw.length);
      if(score>best.score){ best = {k,score}; }
    });
    if(best.k && best.score >= 0.25) return answersMap[best.k];
    return null;
  }

  function handleSend(){
    const q = prompt.value.trim();
    console.log('[ai.js] send clicked, q=', q);
    if(!q) return;
    const matched = findBestAnswer(q);
    if(matched){ const el = document.createElement('div'); el.className = 'response fade-in'; el.textContent = matched; responses.prepend(el); prompt.value=''; return; }
    // fallback simple rules
    const text = q.toLowerCase();
    let reply = '';
    if(/cláusula|clausula|qué es una cláusula|que es una clausula|definicion de clausula/i.test(text)){
      reply = 'Una cláusula es una disposición o pacto incluido en un contrato que regula derechos y obligaciones de las partes. Suele concretar condiciones, plazos, causas de resolución y penalizaciones.';
    } else if(/contrato|arrend|arrendamiento|compraventa|contrato de/i.test(text)){
      reply = 'Cláusulas frecuentes: objeto, duración, precio, renovación, resolución, penalizaciones, confidencialidad y jurisdicción.';
    } else if(/demanda|juicio|prescrip|prescripción|reclam/i.test(text)){
      reply = 'Pasos generales: recopilar evidencias, verificar plazos de prescripción, presentar demanda ante la jurisdicción competente y solicitar medidas cautelares si procede.';
    } else if(/laboral|despido|contrato de trabajo|horas extras/i.test(text)){
      reply = 'En materia laboral revise tipo de contrato, causas del despido, registro de horas y plazos para reclamar ante inspección o los tribunales laborales.';
    } else if(/fiscal|impuesto|iva|renta|tribut/i.test(text)){
      reply = 'Consulte obligaciones formales, fechas de presentación y posible impacto fiscal de la operación; para casos complejos, revise normativa local vigente.';
    } else {
      reply = 'Revisa cláusulas, plazos y precedentes aplicables. Si necesitas redactar un documento, indica tipo y datos clave.';
    }
    const el = document.createElement('div'); el.className = 'response fade-in'; el.textContent = reply; responses.prepend(el);
    prompt.value = '';
  }

  sendBtn.addEventListener('click', handleSend);
  prompt.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }
  });

  // Load example questions from JSON and populate selector
  // choose file based on user role (rector vs abogado)
  (function(){
    const meRole = (me && me.role) ? me.role.toLowerCase() : '';
    const qFile = meRole.includes('rect') ? 'rector_questions.json' : 'questions.json';
    fetch(qFile).then(r=>r.json()).then(list=>{
      if(!Array.isArray(list)) return;
      list.forEach(q=>{ const opt = document.createElement('option'); opt.value = q; opt.textContent = q; exampleSelect.appendChild(opt); });
    }).catch(err=>{ console.warn('Could not load', qFile, err); });
  })();

  // Load answers map depending on role
  (function(){
    const meRole = (me && me.role) ? me.role.toLowerCase() : '';
    const qaFile = meRole.includes('rect') ? 'rector_questions_answers.json' : 'questions_answers.json';
    fetch(qaFile).then(r=>r.json()).then(list=>{ if(!Array.isArray(list)) return; list.forEach(item=>{ if(item && item.q && item.a) answersMap[item.q]=item.a; }); }).catch(err=>{ console.warn('Could not load', qaFile, err); });
  })();

  if(insertExampleBtn){ insertExampleBtn.addEventListener('click', ()=>{
    const sel = exampleSelect.value;
    if(!sel) return;
    // Put the example into the prompt and add it to the chat as a user message (do not auto-send)
    prompt.value = sel;
    prompt.focus();
    try{
      const u = document.createElement('div'); u.className = 'user-message fade-in'; u.textContent = sel; responses.prepend(u);
    }catch(e){ console.warn('Could not insert example into chat', e); }
  }); }
  if(copyExampleBtn){ copyExampleBtn.addEventListener('click', ()=>{ const sel = exampleSelect.value; if(!sel) return; navigator.clipboard.writeText(sel).then(()=>{ alert('Pregunta copiada al portapapeles'); }).catch(()=>{ alert('No se pudo copiar'); }); }); }

  clearBtn.addEventListener('click', ()=>{
    // clear textarea and remove entire chat history (user messages + AI responses)
    prompt.value = '';
    try{
      // Fully clear the responses container
      responses.innerHTML = '';
    }catch(e){ console.warn('Error clearing messages', e); }
  });
});

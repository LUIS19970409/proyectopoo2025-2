const LS_KEY = 'usuarios_demo_v1';
const CURRENT_USER_KEY = 'current_user_session';

function loadUsers(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function saveUsers(users){ localStorage.setItem(LS_KEY, JSON.stringify(users)); }

function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Luhn check for card number
function luhnCheck(num){
  const digits = num.replace(/\D/g,'').split('').reverse().map(d=>parseInt(d,10));
  let sum = 0;
  for(let i=0;i<digits.length;i++){
    let d = digits[i];
    if(i%2===1){ d = d*2; if(d>9) d-=9; }
    sum += d;
  }
  return sum%10===0;
}

function validExpiry(monthStr, yearStr){
  const mm = parseInt((monthStr||'').replace(/\D/g,''),10);
  let yy = parseInt((yearStr||'').replace(/\D/g,''),10);
  if(isNaN(mm) || isNaN(yy)) return false;
  if(mm < 1 || mm > 12) return false;
  // normalize year: two-digit -> 2000+
  if(yy < 100) yy += 2000;
  // expiry is valid if the last day of the month is in the future
  const exp = new Date(yy, mm - 1 + 1, 1); // first day after expiry month
  const now = new Date();
  return exp > now;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const plan = getQueryParam('plan');
  if(!plan){ window.location.href='dashboard.html'; return; }
  const prices = { institucional:30, premium:60 };
  const planNames = { institucional:'Plan Institucional', premium:'Plan Premium' };
  const amount = prices[plan] || 0;
  const planSummary = document.getElementById('planSummary');
  planSummary.textContent = amount>0 ? `${planNames[plan]} — $${amount}.00 / mes` : 'Plan desconocido';

  const payForm = document.getElementById('paymentForm');
  const payError = document.getElementById('payError');
  const cancel = document.getElementById('cancelPay');

  cancel.addEventListener('click', ()=>{ window.location.href='dashboard.html'; });

  payForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    payError.textContent = '';
    const name = document.getElementById('cardName').value.trim();
    const number = document.getElementById('cardNumber').value.replace(/\D/g,'');
    const expMonth = document.getElementById('cardExpMonth').value.replace(/\D/g,'');
    const expYear = document.getElementById('cardExpYear').value.replace(/\D/g,'');
    const cvv = document.getElementById('cardCvv').value.replace(/\D/g,'');

    if(!name){ payError.textContent = 'Introduce el nombre tal como figura en la tarjeta'; return; }
    if(!/^[0-9]{16}$/.test(number)){ payError.textContent = 'Número de tarjeta inválido (debe tener 16 dígitos)'; return; }
    if(!/^[0-9]{3}$/.test(cvv)){ payError.textContent = 'CVV inválido (debe tener 3 dígitos)'; return; }
    if(!validExpiry(expMonth, expYear)){ payError.textContent = 'Fecha de expiración inválida o caducada'; return; }

    // Simulate processing
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true; payBtn.textContent = 'Procesando...';
    setTimeout(()=>{
      // On successful simulated payment: set user plan and redirect to confirmation
      const cur = sessionStorage.getItem(CURRENT_USER_KEY);
      if(!cur){ window.location.href='index.html'; return; }
      const users = loadUsers();
      const idx = users.findIndex(u=>u.username === cur);
      if(idx === -1){ window.location.href='index.html'; return; }
      users[idx].plan = plan;
      saveUsers(users);
      window.location.href = 'confirmation.html?plan=' + encodeURIComponent(plan) + '&paid=1&amount=' + amount;
    }, 1200);
  });
});

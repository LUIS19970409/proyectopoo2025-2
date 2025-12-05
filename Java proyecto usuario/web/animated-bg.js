(function(){
  // Animated background cursor parallax
  if(typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return; // do nothing if user prefers reduced motion

  function init(){
    const el = document.querySelector('.animated-bg');
    if(!el) return;
    const root = el; // set variables on the element itself

    // create a mixing spot element that follows the cursor
    let mixSpot = null;
    if(!prefersReduced){
      mixSpot = document.createElement('div');
      mixSpot.className = 'mix-spot';
      document.body.appendChild(mixSpot);
    }

    // We'll implement a smooth interpolation loop (lerp) from current -> target
    let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
    let targetMix = 0.22, currentMix = 0.22; // increase base mix for stronger blending
    let running = true;

    // Particle trail state
    let prevClientX = null, prevClientY = null;
    let lastParticleTime = 0;
    const particleInterval = 16; // ms between particles (smaller -> denser trail)
    let particlesCount = 0, maxParticles = 180; // allow longer, denser trail

    function lerp(a,b,t){ return a + (b - a) * t; }

    function setVarsFromCurrent(){
      // Slightly offset gradients to create depth (driven by currentX/currentY)
      root.style.setProperty('--g1x', (10 + (currentX - 50) * 0.12) + '%');
      root.style.setProperty('--g1y', (60 + (currentY - 50) * 0.12) + '%');
      root.style.setProperty('--g2x', (90 + (currentX - 50) * 0.14) + '%');
      root.style.setProperty('--g2y', (40 + (currentY - 50) * 0.14) + '%');
      root.style.setProperty('--g3x', (50 + (currentX - 50) * 0.06) + '%');
      root.style.setProperty('--g3y', (50 + (currentY - 50) * 0.06) + '%');
      // base linear-gradient position
      const baseX = 50 + (currentX - 50) * 0.22;
      const baseY = 50 + (currentY - 50) * 0.12;
      root.style.setProperty('--p1', baseX.toFixed(2) + '% ' + baseY.toFixed(2) + '%');
      root.style.setProperty('--base-pos', baseX.toFixed(2) + '% ' + baseY.toFixed(2) + '%');
      root.style.setProperty('--mix', currentMix.toFixed(3));
    }

    function handleMove(clientX, clientY){
      const r = root.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width, clientX - r.left));
      const y = Math.max(0, Math.min(r.height, clientY - r.top));
      const xPct = (x / r.width) * 100;
      const yPct = (y / r.height) * 100;
      targetX = xPct; targetY = yPct;
      // mix amount based on distance from center (more off-center -> more mix)
      const dx = xPct - 50, dy = yPct - 50;
      const dist = Math.sqrt(dx*dx + dy*dy);
        // stronger baseline mix: scale more aggressively so mixing is more visible
        targetMix = Math.min(1.4, 0.28 + dist / 34); // tuneable maximum (allow >1 for stronger blend effect)
      // also move the local mix spot target position and make it visible
      if(mixSpot){
        mixSpot._targetX = clientX; mixSpot._targetY = clientY;
        // make local spot more opaque and responsive to distance
        mixSpot._targetOpacity = Math.min(1.0, 0.45 + dist/34);
        // scale the spot slightly based on distance
        mixSpot._targetScale = 1 + Math.min(2.0, dist/38);
      }

      // spawn particles along the movement path (throttled)
      try{
        const now = performance.now();
        if(!prevClientX) prevClientX = clientX; if(!prevClientY) prevClientY = clientY;
        const dxp = clientX - prevClientX, dyp = clientY - prevClientY;
        const moved = Math.sqrt(dxp*dxp + dyp*dyp);
        if(moved > 4 && (now - lastParticleTime) > particleInterval && particlesCount < maxParticles){
          createParticle(clientX - (Math.random()*6-3), clientY - (Math.random()*6-3));
          lastParticleTime = now;
          prevClientX = clientX; prevClientY = clientY;
        }
      }catch(e){}
    }

    function onPointerMove(e){
      if(e.touches && e.touches.length) { const t = e.touches[0]; handleMove(t.clientX, t.clientY); return; }
      handleMove(e.clientX, e.clientY);
    }


    // Create ripple on click/tap: expanding mixed-color wave
    function createRipple(clientX, clientY){
      if(root.matches('.reduce-motion')) return; // don't if reduced motion class applied
      const r = root.getBoundingClientRect();
      const x = clientX - r.left; const y = clientY - r.top;
      const el = document.createElement('div');
      el.className = 'ripple';
      // position using viewport coords to allow overflow
      el.style.left = (clientX) + 'px';
      el.style.top = (clientY) + 'px';
      // scale magnitude based on viewport diagonal
      const maxDim = Math.max(window.innerWidth, window.innerHeight);
      const size = Math.max(80, Math.min(maxDim * 0.9, 1600));
      el.style.width = size + 'px'; el.style.height = size + 'px';
      // tweak gradient center so ripple color follows cursor relative to element
      // attach and force reflow to allow transition
      document.body.appendChild(el);
      // small delay to ensure initial style applied
      requestAnimationFrame(()=>{
        el.classList.add('ripple--grow');
      });
      // remove after transition
      setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 900);
      // temporary boost to global mix for a stronger blended impression on click
      // reduce boost and cap to avoid overbrightening the whole screen
      const boost = 0.18;
      targetMix = Math.min(0.95, targetMix + boost);
      setTimeout(()=>{ targetMix = Math.max(0.22, targetMix - boost); }, 420);
    }

    // Create a small particle that floats and fades (trail)
    function createParticle(clientX, clientY){
      if(prefersReduced) return; // respect reduced motion
      if(particlesCount >= maxParticles) return;
      const p = document.createElement('div');
      p.className = 'mix-particle';
      // slightly randomize size for variety (smaller stars)
      const sz = 8 + Math.random() * 8; // 8-16px (slightly larger stars)
      p.style.width = sz + 'px'; p.style.height = sz + 'px';
      p.style.left = clientX + 'px'; p.style.top = clientY + 'px';
      // random offset movement direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 12 + Math.random() * 36; // px drift
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - (6 + Math.random() * 8); // bias upward slightly
      p.style.setProperty('--dx', dx.toFixed(2) + 'px');
      p.style.setProperty('--dy', dy.toFixed(2) + 'px');
      const dur = 900 + Math.random() * 1100; // 900-2000ms (longer trail)
      p.style.animation = `particleFloat ${dur}ms cubic-bezier(.2,.8,.2,1) forwards`;
      // slight rotation randomization
      p.style.transform = `translate(-50%,-50%) rotate(${Math.random()*360}deg)`;
      document.body.appendChild(p);
      particlesCount++;
      // cleanup
      setTimeout(()=>{ try{ p.remove(); }catch(e){}; particlesCount = Math.max(0, particlesCount-1); }, dur + 80);
    }

    function onClick(e){
      if(e.touches && e.touches.length){ const t = e.touches[0]; createRipple(t.clientX, t.clientY); }
      else createRipple(e.clientX, e.clientY);
    }

    function onLeave(){
      // direct targets: gently return to center
      targetX = 50; targetY = 50; targetMix = 0.09;
    }

    // attach pointer events for desktop + touch
    window.addEventListener('mousemove', onPointerMove, {passive:true});
    window.addEventListener('touchmove', onPointerMove, {passive:true});
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('pointerdown', onClick, {passive:true});
    window.addEventListener('touchstart', onClick, {passive:true});

    // start an animation loop to smoothly interpolate current -> target
    function frame(){
      // ease factor (0..1) - higher means snappier follow, lower smoother
      const ease = 0.12;
      currentX = lerp(currentX, targetX, ease);
      currentY = lerp(currentY, targetY, ease);
      currentMix = lerp(currentMix, targetMix, ease);
      setVarsFromCurrent();
      // animate mixSpot if present
      if(mixSpot){
        mixSpot._x = lerp(mixSpot._x||window.innerWidth/2, mixSpot._targetX||window.innerWidth/2, 0.18);
        mixSpot._y = lerp(mixSpot._y||window.innerHeight/2, mixSpot._targetY||window.innerHeight/2, 0.18);
        mixSpot._opacity = lerp(mixSpot._opacity||0, mixSpot._targetOpacity||0, 0.14);
        mixSpot._scale = lerp(mixSpot._scale||1, mixSpot._targetScale||1, 0.14);
        mixSpot.style.transform = `translate(${mixSpot._x}px, ${mixSpot._y}px) translate(-50%,-50%) scale(${mixSpot._scale})`;
        mixSpot.style.opacity = String(Math.max(0, Math.min(1, mixSpot._opacity)));
      }
      if(running) requestAnimationFrame(frame);
    }
    // init loop
    running = true; requestAnimationFrame(frame);
  }

  // init on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

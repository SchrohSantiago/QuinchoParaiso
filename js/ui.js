/* Interfaz: menú, sección activa, aparición al bajar, contadores, turnos, formulario → WhatsApp, mapas y preguntas frecuentes (pestañas). */
(()=>{
const {$,$$,pad2,money,mq,reduce}=QP,{CONFIG}=QP.data,root=document.documentElement;
const hasIO='IntersectionObserver' in window;

/* menú en celular */
{
  const btn=$('#burger'),menu=$('#menu');
  const set=open=>{root.classList.toggle('menu-open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')};
  const isOpen=()=>root.classList.contains('menu-open');
  btn.addEventListener('click',()=>set(!isOpen()));
  menu.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  document.addEventListener('click',e=>{if(isOpen()&&!e.target.closest('#menu,#burger'))set(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){set(false);btn.focus()}});
  mq('(min-width:961px)').addEventListener('change',e=>{if(e.matches)set(false)});
}

/* resalta en el menú la sección que se está viendo */
if(hasIO){
  const links=$$('.menu a[href^="#"]:not(.btn)'),byId=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    links.forEach(a=>a.removeAttribute('aria-current'));
    const a=byId.get(e.target.id);if(a)a.setAttribute('aria-current','true');
  }),{rootMargin:'-45% 0px -50% 0px'});
  $$('main>section[id]').forEach(s=>io.observe(s));
}

/* aparición al bajar: cada bloque entra una sola vez, con un pequeño escalonado dentro de cada grupo */
{
  $$('[data-stagger]').forEach(g=>[...g.children].forEach((c,i)=>c.style.setProperty('--i',Math.min(i,3))));
  const items=$$('[data-reveal]');
  if(!hasIO)items.forEach(e=>e.classList.add('is-in'));
  else{
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -5% 0px'});
    items.forEach(e=>io.observe(e));
  }
}

/* contadores: suben desde cero la primera vez que se ven (en equipos lentos o con "reducir movimiento" quedan fijos) */
{
  const fmt=(el,v)=>el.dataset.format==='money'?money(v):String(Math.round(v));
  const run=el=>{
    const to=+el.dataset.count;
    el.style.minWidth=Math.ceil(el.getBoundingClientRect().width)+'px'; /* el ancho final queda reservado: no se mueve nada mientras suben los números */
    if(!(QP.perf&&QP.perf.fx))return;
    const t0=performance.now(),dur=1500;
    el.textContent=fmt(el,0);
    requestAnimationFrame(function step(now){
      const k=Math.min(1,(now-t0)/dur);
      el.textContent=fmt(el,to*(1-Math.pow(1-k,4)));
      if(k<1)requestAnimationFrame(step);
    });
  };
  const els=$$('[data-count]');
  if(hasIO){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target)}}),{threshold:.6});els.forEach(e=>io.observe(e))}
}

/* "Elegir este turno" → deja el turno marcado en el formulario y baja hasta él */
$$('[data-shift]').forEach(b=>b.addEventListener('click',()=>{
  const r=$('#t-'+b.dataset.shift);if(r)r.checked=true;
  $('#reservar').scrollIntoView({behavior:reduce?'auto':'smooth'});
}));

/* formulario → WhatsApp (no se guarda ni se envía nada a ningún servidor) */
{
  const form=$('#form'),dt=$('#dt'),pp=$('#pp'),d=new Date();
  dt.min=`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; /* no se puede elegir una fecha pasada */
  pp.max=CONFIG.capacity;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const name=$('#nm').value.trim(),people=Math.min(+pp.value||1,CONFIG.capacity),msg=$('#msg').value.trim();
    const sh=CONFIG.shifts[$('input[name=turno]:checked').value],[y,m,day]=dt.value.split('-').map(Number);
    const date=new Date(y,m-1,day).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
    const text=`¡Hola! Soy ${name}. Quisiera consultar disponibilidad en ${CONFIG.name} para el ${date}, turno ${sh.label.toLowerCase()} (${sh.hours}). Somos ${people} persona${people>1?'s':''}. Evento: ${$('#ev').value}.${msg?' '+msg:''} ¡Gracias!`;
    const url=`https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(text)}`;
    const w=window.open(url,'_blank');
    if(w)w.opener=null;else location.href=url; /* si el navegador bloquea la ventana nueva, se abre en esta */
  });
}

/* mapas: en iPhone/iPad el enlace abre Apple Maps (viene instalado); en el resto, Google Maps */
{
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(ios)$$('a[data-map]').forEach(a=>{a.href=`https://maps.apple.com/?q=${encodeURIComponent(CONFIG.address)}`});
}

/* preguntas frecuentes: pestañas (en celular son tarjetas con ícono; en compu, una lista numerada). Se mueven también con las flechas del teclado */
{
  const tabs=$$('.faq .tab'),panels=$$('.faq .panel');
  const pick=(i,focus)=>{tabs.forEach((t,k)=>{const on=k===i;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;panels[k].hidden=!on});if(focus)tabs[i].focus()};
  tabs.forEach((t,i)=>{
    t.addEventListener('click',()=>pick(i));
    t.addEventListener('keydown',e=>{
      const n=tabs.length,k=e.key==='ArrowRight'||e.key==='ArrowDown'?(i+1)%n:e.key==='ArrowLeft'||e.key==='ArrowUp'?(i-1+n)%n:e.key==='Home'?0:e.key==='End'?n-1:-1;
      if(k<0)return;e.preventDefault();pick(k,true);
    });
  });
}
})();

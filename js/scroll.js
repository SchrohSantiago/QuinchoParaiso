/* Efectos ligados al scroll.
   Hay un solo escuchador de scroll (a lo sumo una vez por cuadro) y solo mueve unas pocas cosas con transform/translate:
     · barra de progreso, menú que se solidifica y botón de WhatsApp
     · parallax suave del hero (con el scroll y, en compu, con el mouse)
     · el recorrido: en compu la sección queda fija y el scroll la desliza de costado;
       en celular (o en equipos lentos / "reducir movimiento") es un carrusel que se desliza con el dedo
   Lo que está fuera de pantalla se pausa. Espera a boot.js para saber si el equipo aguanta todos los efectos (QP.perf.fx). */
(()=>{
const {$,$$,clamp,pad2,mq,raf}=QP;
const hasIO='IntersectionObserver' in window;

QP.ready.then(()=>{
const fx=QP.perf.fx;
const nav=$('#nav'),bar=$('#progress'),waf=$('#waf');

/* ---------- barra de progreso, menú y botón flotante ---------- */
let docH=1,solid=null,wafOn=null;
const measureDoc=()=>{docH=Math.max(1,document.documentElement.scrollHeight-innerHeight)};
const basics=y=>{
  bar.style.transform=`scaleX(${(y/docH).toFixed(4)})`;
  const s=y>24;if(s!==solid){solid=s;nav.classList.toggle('is-solid',s)}
  const w=y>400;if(w!==wafOn){wafOn=w;waf.classList.toggle('is-on',w)}
};

/* lo que se anima en bucle (olas, cenefa) se pausa cuando no se ve */
if(hasIO){
  const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('is-off',!e.isIntersecting)),{rootMargin:'200px'});
  $$('.hero__waves,.facts .key-band').forEach(el=>io.observe(el));
}

/* ---------- parallax del hero ---------- */
const hero=(()=>{
  const el=$('#inicio');if(!el||!fx)return null;
  const pars=$$('[data-par]',el).map(e=>({e,k:parseFloat(e.dataset.par)||0})),imgs=$$('.arch img',el);
  const H={on:true,h:el.offsetHeight};
  let mx=0,my=0,tx=0,ty=0,easing=0;
  const paint=()=>{
    const t=Math.min(scrollY,H.h);
    pars.forEach(({e,k})=>{e.style.translate=`${(-mx*k*180).toFixed(1)}px ${(t*k-my*k*120).toFixed(1)}px`});
    imgs.forEach((im,i)=>{im.style.translate=`0 ${clamp(t*(i?-.04:.05),-26,26).toFixed(1)}px`}); /* la foto se mueve un poco dentro de su arco */
  };
  H.update=()=>{if(H.on)paint()};
  H.measure=()=>{H.h=el.offsetHeight};
  if(hasIO)new IntersectionObserver(e=>{H.on=e[0].isIntersecting}).observe(el);
  /* con el mouse (solo en compu), suavizado */
  if(mq('(pointer:fine)').matches&&mq('(hover:hover)').matches)addEventListener('pointermove',e=>{
    tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;
    if(!easing&&H.on)easing=requestAnimationFrame(function s(){
      mx+=(tx-mx)*.1;my+=(ty-my)*.1;paint();
      easing=(Math.abs(tx-mx)+Math.abs(ty-my)>.002)?requestAnimationFrame(s):0;
    });
  },{passive:true});
  return H;
})();

/* ---------- recorrido ---------- */
const tour=(()=>{
  const sec=$('#recorrido');if(!sec)return null;
  const stage=$('.tour__stage',sec),track=$('#tourTrack'),stops=$$('.stop',track),imgs=stops.map(s=>$('img',s)),photoBtns=$$('.stop__photo',track);
  const barEl=$('#tourBar'),nowEl=$('#tourNow'),prev=$('#tourPrev'),next=$('#tourNext'),hint=$('.tour__hint span',sec);
  const wide=mq('(min-width:901px)');
  const T={on:false};
  let pinned=false,maxX=0,vw=0,centers=[],act=-1;
  const setNow=i=>{if(i!==act){act=i;nowEl.textContent=pad2(i+1)}};
  /* foto cuyo centro queda más cerca del centro visible; "off" es cuánto se desplazó el contenido (negativo hacia la izquierda) */
  const nearest=(mid,off)=>{let best=0,bd=1e9;stops.forEach((s,i)=>{const d=Math.abs(s.offsetLeft+s.offsetWidth/2+off-mid);if(d<bd){bd=d;best=i}});return best};

  /* modo carrusel: se desliza con el dedo (o con las flechas) */
  const carousel=()=>{
    if(pinned)return;
    const max=track.scrollWidth-track.clientWidth;
    barEl.style.transform=`scaleX(${(max>0?clamp(track.scrollLeft/max):0).toFixed(4)})`;
    setNow(nearest(track.clientWidth/2,-track.scrollLeft));
    prev.disabled=track.scrollLeft<4;next.disabled=track.scrollLeft>max-4;
  };
  track.addEventListener('scroll',raf(carousel),{passive:true});
  const step=()=>stops[0].offsetWidth+(parseFloat(getComputedStyle(track).columnGap)||0);
  prev.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
  next.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));

  /* modo fijo: el scroll vertical desliza el recorrido de costado */
  const pin=on=>{
    if(hint)hint.textContent=on?'Seguí bajando':'Deslizá para ver más';
    if(on===pinned)return;
    pinned=on;sec.classList.toggle('is-pinned',on);
    photoBtns.forEach(b=>on?b.setAttribute('tabindex','-1'):b.removeAttribute('tabindex')); /* las fotos que están fuera de pantalla no reciben foco */
    if(!on){track.style.transform='';imgs.forEach(im=>{im.style.translate=''});sec.style.removeProperty('--tour-h');track.scrollLeft=0}
  };
  T.update=()=>{
    if(!pinned)return;
    const p=clamp(-sec.getBoundingClientRect().top/maxX),x=-p*maxX;
    track.style.transform=`translate3d(${x.toFixed(1)}px,0,0)`;
    barEl.style.transform=`scaleX(${p.toFixed(4)})`;
    imgs.forEach((im,i)=>{im.style.translate=`${clamp(-(centers[i]+x-vw/2)*.06,-26,26).toFixed(1)}px 0`}); /* cada foto se desliza apenas distinto a su arco */
    setNow(nearest(vw/2,x));
  };
  T.measure=()=>{
    if(!(fx&&wide.matches)){pin(false);carousel();return}
    pin(true);
    vw=stage.clientWidth;maxX=Math.max(0,track.scrollWidth-vw);
    if(maxX<160){pin(false);carousel();return} /* si todo entra en pantalla no hace falta deslizar */
    sec.style.setProperty('--tour-h',`${maxX+stage.clientHeight}px`);
    centers=stops.map(s=>s.offsetLeft+s.offsetWidth/2);
    T.update();
  };
  wide.addEventListener('change',()=>T.measure());
  if('ResizeObserver' in window){const ro=new ResizeObserver(raf(T.measure));ro.observe(track);ro.observe(stage)}
  /* las fotos del recorrido (que están a la derecha, fuera de pantalla) se piden recién cuando la sección está por verse
     (en index.html llevan data-src/data-srcset): así, al entrar a la página no compiten con la foto principal por la conexión,
     y al deslizar ya están listas. */
  const warm=()=>imgs.forEach(im=>{if(!im.dataset.src)return;im.srcset=im.dataset.srcset;im.src=im.dataset.src;delete im.dataset.src;delete im.dataset.srcset});
  if(hasIO){
    const pre=new IntersectionObserver(e=>{if(e[0].isIntersecting){pre.disconnect();warm()}},{rootMargin:'250px 0px'});
    pre.observe(sec);
    new IntersectionObserver(e=>{T.on=e[0].isIntersecting},{rootMargin:'120px 0px'}).observe(sec);
  }else{T.on=true;warm()}
  return T;
})();

/* ---------- bucle de scroll ---------- */
const frame=()=>{
  const y=scrollY;
  if(tour&&tour.on)tour.update(); /* primero se lee la posición, después se escribe */
  if(hero)hero.update();
  basics(y);
};
const tick=raf(frame);
addEventListener('scroll',tick,{passive:true});
const remeasure=()=>{measureDoc();if(hero)hero.measure();if(tour)tour.measure();tick()};
addEventListener('resize',raf(remeasure));
addEventListener('load',remeasure);
if(document.fonts)document.fonts.ready.then(remeasure);
if('ResizeObserver' in window)new ResizeObserver(measureDoc).observe(document.body);
remeasure();
});
})();

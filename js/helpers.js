/* Utilidades compartidas.
   Todo cuelga de un único objeto global (QP): así los demás archivos no se pisan nombres entre sí
   y la página funciona igual abriendo index.html con doble clic (no usa módulos ES). */
(()=>{
const QP=window.QP=window.QP||{};
const doc=document.documentElement;

/* avisa al CSS que hay JavaScript (sin esto, nada queda escondido esperando una animación) */
doc.classList.remove('no-js');doc.classList.add('js');

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const pad2=n=>String(n).padStart(2,'0');
const money=n=>'$'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); /* 250000 → $250.000 */
const mq=q=>matchMedia(q);
const raf=fn=>{let id=0;return()=>{if(!id)id=requestAnimationFrame(()=>{id=0;fn()})}}; /* a lo sumo una vez por cuadro */
const reduce=mq('(prefers-reduced-motion: reduce)').matches;

/* QP.ready se cumple cuando boot.js ya decidió si el equipo puede con todos los efectos (QP.perf.fx) */
let markReady;
const ready=new Promise(r=>{markReady=r});

Object.assign(QP,{$,$$,clamp,lerp,pad2,money,mq,raf,reduce,ready,markReady});
})();

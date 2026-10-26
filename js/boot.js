/* Pantalla de carga + detección de equipos lentos.
   - Espera a las fuentes y a la carga de la página (incluida la foto principal); recién ahí abre el telón y arrancan las animaciones.
   - En equipos lentos activa el modo "lite": el recorrido deja de ser una sección fija (queda como carrusel con el dedo)
     y se apagan el parallax y los bucles. No cambia nada del contenido.
   Para probar un modo:  ?fx=lite  o  ?fx=full  en la dirección.  Con ?debug se ven los valores medidos. */
(()=>{
const QP=window.QP,doc=document.documentElement,T0=performance.now();
const reduce=QP.reduce,sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NO_LOADER=new URLSearchParams(location.search).has('noloader'); /* ?noloader: sin pantalla de carga (para pruebas y capturas) */
const MIN_MS=NO_LOADER?0:reduce?200:950;   /* tiempo mínimo para que se vea el logo y la pileta llenándose */
const MAX_MS=6500;             /* si algo tarda más, se abre igual */
let total=0,done=0;
if(NO_LOADER)doc.classList.add('no-loader');
const loader=()=>document.getElementById('loader');
const paint=()=>{const l=loader();if(l)l.style.setProperty('--p',Math.min(done/Math.max(1,total),.92).toFixed(3))};
/* otros scripts pueden registrar lo que hay que esperar */
const Boot=QP.boot={open:true,wait(p){if(!Boot.open)return;total++;Promise.resolve(p).catch(()=>{}).then(()=>{done++;paint()})}};
Boot.wait(document.fonts?document.fonts.ready:null);
Boot.wait(document.readyState==='complete'?null:new Promise(r=>addEventListener('load',r,{once:true})));

/* velocidad del procesador: prueba corta (cálculo + armar y medir un bloque de texto) que se toma como el mejor de 2 intentos.
   Es la misma prueba de Terra Ventus pero con un tercio del trabajo (para no trabar el arranque), por eso el umbral también es un tercio.
   Solo se corre en equipos táctiles (celulares y tablets): en una computadora con mouse no hace falta. */
const CPU_LENTO=30; /* ms. Equivale a los 90 ms de Terra Ventus (Samsung S20 FE ≈ 22 ms → efectos completos, Redmi 12 ≈ 38 ms → lite) */
async function cpuMs(){let best=1e9;
  for(let k=0;k<2;k++){const t=performance.now();let x=0;for(let i=0;i<4e5;i++)x+=Math.sqrt(i)*Math.sin(i*.001);
    const d=document.createElement('div');d.style.cssText='position:absolute;left:-9999px;top:0;width:280px;contain:layout';let h='';
    for(let i=0;i<170;i++)h+=`<p style="margin:0;padding:${i%5}px;font-size:${10+i%6}px">x${i} <b>${i}</b> <i>texto</i></p>`;
    d.innerHTML=h;document.body.appendChild(d);void d.offsetHeight;d.remove();
    best=Math.min(best,performance.now()-t+(x>1e99?1:0));
    if(best>CPU_LENTO*1.6)break; /* si ya es clarísimo que es lento, no se repite */
    await sleep(0)} /* se cede el hilo entre un intento y el otro */
  return best}

async function decide(){
  const forced=new URLSearchParams(location.search).get('fx');
  const c=navigator.connection||{},coarse=matchMedia('(pointer:coarse)').matches,mem=navigator.deviceMemory,cores=navigator.hardwareConcurrency;
  const cpu=!reduce&&coarse?Math.round(await cpuMs()):null; /* null = no se midió */
  let lite=cpu!==null&&cpu>CPU_LENTO,why=cpu===null?'equipo con mouse':'procesador';
  if(reduce){lite=true;why='reducir movimiento'}
  else if(c.saveData){lite=true;why='ahorro de datos'}
  else if(coarse&&mem&&mem<=2){lite=true;why='RAM ≤2 GB'} /* deviceMemory viene redondeado hacia abajo: solo se usa para los más chicos */
  else if(coarse&&cores&&cores<=4){lite=true;why='≤4 núcleos'}
  if(forced==='lite'||forced==='full'){lite=forced==='lite';why='forzado (?fx='+forced+')'}
  QP.perf={lite,fx:!lite&&!reduce,reduce,cpu,why,mem:mem===undefined?'n/d':mem,cores:cores||'n/d',coarse,dpr:devicePixelRatio,w:innerWidth};
  doc.classList.toggle('lite',lite);
}

function debugBox(){
  if(!new URLSearchParams(location.search).has('debug'))return;
  const p=QP.perf,d=document.createElement('pre');
  d.style.cssText='position:fixed;left:6px;top:6px;z-index:5000;margin:0;padding:8px 10px;background:rgba(0,0,0,.82);color:#9f9;font:12px/1.35 monospace;border-radius:6px;pointer-events:none;white-space:pre-wrap;max-width:92vw';
  d.textContent=`modo: ${p.lite?'lite':'full'}  (${p.why})\ncpu: ${p.cpu} ms  (lento > ${CPU_LENTO})\nRAM: ${p.mem} GB  núcleos: ${p.cores}\ntáctil: ${p.coarse}  pantalla: ${p.w}px  dpr ${p.dpr}`;
  document.body.appendChild(d);
}

async function run(){
  try{
    await sleep(0);
    /* el evento "load" ya incluye la descarga de la foto principal (no tiene loading="lazy") */
    while(!NO_LOADER&&done<total&&performance.now()-T0<MAX_MS)await sleep(40);
    if(!NO_LOADER)await Promise.race([new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),sleep(300)]); /* que se pinte */
    await decide();
  }catch(e){
    QP.perf=QP.perf||{lite:true,fx:false,reduce,cpu:0,why:'error',coarse:false};
  }finally{
    QP.markReady();
    const l=loader();if(l)l.style.setProperty('--p',1);
    await sleep(Math.max(0,MIN_MS-(performance.now()-T0)));
    Boot.open=false;doc.classList.add('is-ready');performance.mark('qp-ready');debugBox();
    setTimeout(()=>{const l2=loader();if(l2)l2.remove()},1200);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

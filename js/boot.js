/* Bienvenida sin dependencias: espera fuentes + decodificación de la foto principal,
   nunca window.load. El progreso cuenta recursos resueltos, no simula porcentajes.
   ?intro repite la presentación; ?noloader la omite; ?fx=lite/full fuerza el modo. */
(()=>{
const QP=window.QP,doc=document.documentElement,T0=performance.now();
const reduce=QP.reduce,sleep=ms=>new Promise(r=>setTimeout(r,ms));
const params=new URLSearchParams(location.search),NO_LOADER=params.has('noloader')||reduce;
let returning=false;
try{returning=sessionStorage.getItem('qp-intro-seen')==='1'&&!params.has('intro')}catch(e){/* almacenamiento opcional */}
const MAX_MS=4200; /* límite incluso si una fuente o una imagen nunca responde */
let total=0,done=0,released=false,removeTimer,deadline,releaseTimer,displayedAt=T0;
if(NO_LOADER)doc.classList.add('no-loader');
if(returning)doc.classList.add('return-visit');
const loader=()=>document.getElementById('loader');
const paint=()=>{const l=loader();if(l&&!released)l.style.setProperty('--p',(done/Math.max(1,total)).toFixed(3))};
/* otros scripts pueden registrar lo que hay que esperar */
const Boot=QP.boot={open:true,wait(p){if(!Boot.open)return;total++;Promise.resolve(p).catch(()=>{}).then(()=>{done++;paint();scheduleRelease()})}};

function scheduleRelease(){
  if(released||Boot.open||done<total)return;
  clearTimeout(releaseTimer);
  // La presentación tiene aire suficiente para que se perciban el sol, las olas y el título.
  // Se aplica también al volver a cargar; solo Entrar, Escape, ?noloader o movimiento reducido la omiten.
  const min=NO_LOADER?0:1350;
  releaseTimer=setTimeout(release,Math.max(0,min-(performance.now()-displayedAt)));
}
function removeLoader(){
  clearTimeout(removeTimer);
  const l=loader();
  if(l){
    const hadFocus=l.contains(document.activeElement);
    l.remove();
    if(hadFocus)document.getElementById('contenido')?.focus({preventScroll:true});
  }
  document.removeEventListener('visibilitychange',visibility);
  document.removeEventListener('focusin',focusOutside);
  document.removeEventListener('keydown',escapeIntro);
}
function release(){
  if(released)return;
  released=true;Boot.open=false;clearTimeout(deadline);clearTimeout(releaseTimer);
  QP.perf=QP.perf||{lite:true,fx:false,reduce,cpu:null,why:'arranque seguro',coarse:false};
  doc.classList.toggle('lite',QP.perf.lite);
  const l=loader(),status=document.getElementById('loaderStatus');
  if(l)l.style.setProperty('--p','1');
  if(status)status.textContent='Todo listo. Pasá.';
  doc.classList.add('is-ready');QP.markReady();performance.mark('qp-ready');
  try{sessionStorage.setItem('qp-intro-seen','1')}catch(e){/* modo privado */}
  if(NO_LOADER){removeLoader();return}
  l?.addEventListener('transitionend',e=>{if(e.target===l)removeLoader()});
  removeTimer=setTimeout(removeLoader,QP.perf.lite||returning?300:800);
}
function visibility(){
  loader()?.classList.toggle('is-paused',document.hidden);
  if(!document.hidden&&performance.now()-T0>=MAX_MS)release();
}
function focusOutside(e){if(!loader()?.contains(e.target))release()}
function escapeIntro(e){if(e.key==='Escape')release()}

function heroReady(){
  const img=document.getElementById('heroImg');
  if(!img)return Promise.resolve();
  const loaded=img.complete?Promise.resolve():new Promise(resolve=>{
    const finish=()=>{img.removeEventListener('load',finish);img.removeEventListener('error',finish);resolve()};
    img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});
  });
  return loaded.then(()=>img.naturalWidth&&img.decode?img.decode():undefined);
}

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
  const knownLite=reduce||c.saveData||(coarse&&((mem&&mem<=2)||(cores&&cores<=4)));
  const cpu=!knownLite&&coarse&&!forced?Math.round(await cpuMs()):null; /* no medir si ya se conoce el modo */
  if(released)return;
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
  displayedAt=performance.now();
  deadline=setTimeout(release,MAX_MS);
  document.getElementById('loaderSkip')?.addEventListener('click',release,{once:true});
  document.addEventListener('focusin',focusOutside);
  document.addEventListener('keydown',escapeIntro);
  document.addEventListener('visibilitychange',visibility);
  visibility();
  try{
    if(!NO_LOADER){
      if(document.fonts){
        Boot.wait(document.fonts.load('800 80px "Bricolage Grotesque"'));
        Boot.wait(document.fonts.load('400 16px "Figtree"'));
      }
      Boot.wait(heroReady());
    }
    await decide();
  }catch(e){
    QP.perf=QP.perf||{lite:true,fx:false,reduce,cpu:0,why:'error',coarse:false};
  }finally{
    Boot.open=false;
    if(NO_LOADER)release();else scheduleRelease();
    debugBox();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

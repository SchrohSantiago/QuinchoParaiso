/* Sección de video con música.
   Para publicar el video: guardalo como assets/video/quincho.mp4 (o poné un ID de YouTube en js/data.js).
   No carga nada hasta que la persona toca "reproducir" (no gasta datos si no lo ve). */
(()=>{
const {$}=QP,V=QP.data.VIDEO,frame=$('#vframe');
if(!frame)return;
const btn=$('#vplay'),soon=$('#vsoon');

/* proporción del marco (se corrige sola con la medida real del video cuando carga) */
const setRatio=(w,h)=>{frame.style.setProperty('--vr',`${w} / ${h}`);frame.classList.toggle('vframe--v',h>w)};
const [rw,rh]=String(V.ratio||'16 / 9').split('/').map(Number);setRatio(rw||16,rh||9);

const showSoon=()=>{frame.classList.remove('is-live','is-playing');frame.classList.add('is-soon');soon.hidden=false;btn.hidden=true};

/* ¿existe el archivo? Se consulta una sola vez, cuando la sección está por verse.
   (Abriendo index.html con doble clic no se puede consultar: ahí se prueba al tocar "reproducir".) */
if(!V.youtube&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>{
    if(!es[0].isIntersecting)return;io.disconnect();
    fetch(V.file,{method:'HEAD',cache:'no-store'}).then(r=>{if(!r.ok)showSoon()}).catch(()=>{});
  },{rootMargin:'300px'});
  io.observe(frame);
}

const playFile=()=>{
  const v=document.createElement('video'),s=document.createElement('source');
  v.controls=true;v.playsInline=true;v.preload='auto';v.setAttribute('controlslist','nodownload');
  s.src=V.file;s.type='video/mp4';v.append(s);
  s.addEventListener('error',()=>{v.remove();showSoon()});
  v.addEventListener('playing',()=>frame.classList.add('is-playing'));
  v.addEventListener('pause',()=>frame.classList.remove('is-playing'));
  v.addEventListener('ended',()=>frame.classList.remove('is-playing'));
  v.addEventListener('loadedmetadata',()=>{if(v.videoWidth&&v.videoHeight)setRatio(v.videoWidth,v.videoHeight)});
  frame.append(v);frame.classList.add('is-live');
  v.play().catch(()=>{}); /* si el navegador no deja arrancar solo, la persona usa los controles */
};
const playYouTube=()=>{
  const f=document.createElement('iframe');
  f.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(V.youtube)}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  f.title='Video del Quincho Paraíso';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
  frame.append(f);frame.classList.add('is-live','is-playing');
};
btn.addEventListener('click',()=>V.youtube?playYouTube():playFile());
})();

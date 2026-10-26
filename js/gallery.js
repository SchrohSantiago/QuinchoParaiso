/* Galería y visor de fotos: es el mismo visor de Terra Ventus.
     · compu: mosaico de 4 fotos + visor grande (flechas, teclado, deslizar, epígrafe y contador)
     · celular: carrusel con miniaturas + visor a pantalla completa
   Todo sale de la lista PHOTOS (js/data.js). Cualquier elemento con data-open="<id de foto>" (o un número, o "cur") abre el visor en esa foto. */
(()=>{
const {$,$$,pad2,mq}=QP,{PHOTOS,MOSAIC,src,srcset}=QP.data,N=PHOTOS.length;
const mobile=mq('(max-width:900px)');
const idx=id=>PHOTOS.findIndex(p=>p.id===id);
const esc=s=>s.replace(/"/g,'&quot;');
const SIZES_MOSAIC='(min-width:1200px) 460px, 33vw',SIZES_FULL='(min-width:1300px) 1200px, 92vw';

const pic=(p,sizes,lazy=true)=>`<img src="${src(p,800)}" srcset="${srcset(p)}" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="${lazy?'lazy':'eager'}" decoding="async">`;
const thumb=(p,i,on)=>`<button type="button" style="--ph:${p.color}" aria-label="Ver foto ${i+1}: ${p.cat}" aria-current="${on}"><img src="${src(p,480)}" alt="" width="${p.w}" height="${p.h}" loading="lazy" decoding="async"></button>`;
const centerThumb=(strip,btn)=>{if(btn&&strip.scrollWidth>strip.clientWidth)strip.scrollTo({left:btn.offsetLeft-strip.clientWidth/2+btn.offsetWidth/2,behavior:'smooth'})};
/* que Tab no se escape del visor mientras está abierto */
const trapTab=(box,e)=>{const f=$$('button',box),i=f.indexOf(document.activeElement);
  if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}};

/* ---------- mosaico (compu) y carrusel (celular): se arman cuando la galería está por verse, no al cargar la página ---------- */
const track=$('#gtrack'),thumbs=$('#gthumbs'),cap=$('#gcap'),cnt=$('#gcount');
let cur=0;
$('#gnum').textContent=`01 / ${pad2(N)}`;$('#gbtnTxt').textContent=`Ver las ${N} fotos`;
const mark=i=>{cur=i;cap.textContent=PHOTOS[i].cat;cnt.textContent=`${pad2(i+1)} / ${pad2(N)}`;
  const bs=$$('button',thumbs);bs.forEach((b,k)=>b.setAttribute('aria-current',k===i));centerThumb(thumbs,bs[i])};
const buildGallery=()=>{
  $('#gmos').innerHTML=MOSAIC.map((id,k)=>{const i=idx(id),p=PHOTOS[i],last=k===MOSAIC.length-1;
    return `<button class="gi" type="button" data-open="${i}" style="--ph:${p.color}" aria-label="${last?`Ver las ${N} fotos`:'Ampliar foto: '+p.cat}">${pic(p,SIZES_MOSAIC)}${last?`<span class="gmore">+${N-MOSAIC.length}<small>fotos más</small></span>`:`<span class="gc">${p.cat}</span>`}</button>`}).join('');
  track.innerHTML=PHOTOS.map((p,i)=>`<button class="gi" type="button" data-open="${i}" style="--ph:${p.color}" aria-label="Ampliar foto ${i+1}: ${p.cat}">${pic(p,'92vw',i>0)}</button>`).join('');
  thumbs.innerHTML=PHOTOS.map((p,i)=>thumb(p,i,i===0)).join('');
  let tk=0;
  track.addEventListener('scroll',()=>{clearTimeout(tk);tk=setTimeout(()=>{const i=Math.max(0,Math.min(N-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));if(i!==cur)mark(i)},60)},{passive:true});
  thumbs.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=$$('button',thumbs).indexOf(b);track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});mark(i)});
  mark(0);
};
const gal=$('#galeria');
if('IntersectionObserver' in window){const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){io.disconnect();buildGallery()}},{rootMargin:'900px 0px'});io.observe(gal)}
else buildGallery();

/* ---------- visor a pantalla completa (celular): se arma la primera vez que se abre ---------- */
let ov;
const overlay=()=>ov||(ov=(()=>{
  const el=$('#goverlay'),tr=$('#govTrack'),th=$('#govThumbs'),cp=$('#govCap'),ct=$('#govCnt'),cat=$('#govCat'),closeBtn=$('#gvClose');
  tr.innerHTML=PHOTOS.map(p=>`<div class="gi">${pic(p,'92vw')}</div>`).join('');
  th.innerHTML=PHOTOS.map((p,i)=>thumb(p,i,false)).join('');
  let gc=0,t=0,opener=null,hide=0;
  const mk=i=>{gc=i;cp.textContent=cat.textContent=PHOTOS[i].cat;ct.textContent=`${pad2(i+1)} / ${pad2(N)}`;
    const bs=$$('button',th);bs.forEach((b,k)=>b.setAttribute('aria-current',k===i));centerThumb(th,bs[i])};
  const go=i=>{i=Math.max(0,Math.min(N-1,i));tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'});mk(i)};
  tr.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const i=Math.max(0,Math.min(N-1,Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth))));if(i!==gc)mk(i)},60)},{passive:true});
  th.addEventListener('click',e=>{const b=e.target.closest('button');if(b)go($$('button',th).indexOf(b))});
  $('#gvPrev').addEventListener('click',()=>go(gc-1));$('#gvNext').addEventListener('click',()=>go(gc+1));
  const close=()=>{el.classList.remove('show');clearTimeout(hide);hide=setTimeout(()=>{el.classList.remove('open');document.body.classList.remove('gvopen')},350);if(opener&&opener.focus)opener.focus()};
  closeBtn.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(!el.classList.contains('open')||!el.classList.contains('show'))return;
    if(e.key==='Escape')close();else if(e.key==='ArrowLeft')go(gc-1);else if(e.key==='ArrowRight')go(gc+1);else if(e.key==='Tab')trapTab(el,e)});
  return{open(i){opener=document.activeElement;clearTimeout(hide);el.classList.add('open');document.body.classList.add('gvopen');
    void el.offsetWidth;el.classList.add('show');tr.scrollTo({left:i*tr.clientWidth,behavior:'instant'});mk(i);closeBtn.focus()}};
})());

/* ---------- visor grande (compu): también se arma al abrirlo ---------- */
let lbx;
const lightbox=()=>lbx||(lbx=(()=>{
  const lb=$('#lb'),box=$('#lbImg'),cp=$('#lbCap'),num=$('#lbNum'),closeBtn=$('.lb-x',lb);
  let order=[],li=0,opener=null,sx=0,hide=0;
  /* primero la foto elegida, después las de su misma categoría y al final el resto */
  const reorder=start=>{const cat=PHOTOS[start].cat,same=[],rest=[];PHOTOS.forEach((p,i)=>(p.cat===cat?same:rest).push(i));
    const k=same.indexOf(start);order=[...same.slice(k),...same.slice(0,k),...rest]};
  const load=p=>{const im=new Image();im.decoding='async';im.alt=p.alt;im.sizes=SIZES_FULL;im.srcset=srcset(p);im.src=src(p,p.w);return im};
  const show=i=>{
    li=((i%N)+N)%N;const p=PHOTOS[order[li]],im=load(p);
    box.appendChild(im);
    const ok=()=>{im.classList.add('loaded');$$('img',box).forEach(x=>{if(x!==im)setTimeout(()=>x.remove(),350)})};
    im.addEventListener('error',()=>im.remove());
    (im.complete&&im.naturalWidth)?ok():im.addEventListener('load',ok);
    cp.textContent=p.cat;num.textContent=`${pad2(li+1)} / ${pad2(N)}`;
    [li+1,li-1].forEach(k=>load(PHOTOS[order[((k%N)+N)%N]])); /* deja lista la foto de al lado */
  };
  const open=i=>{opener=document.activeElement;clearTimeout(hide);reorder(i);box.innerHTML='';show(0);lb.hidden=false;document.body.classList.add('lbopen');void lb.offsetWidth;lb.classList.add('on');closeBtn.focus()};
  const close=()=>{lb.classList.remove('on');document.body.classList.remove('lbopen');clearTimeout(hide);hide=setTimeout(()=>{lb.hidden=true},320);if(opener&&opener.focus)opener.focus()};
  closeBtn.addEventListener('click',close);
  $('.prev',lb).addEventListener('click',()=>show(li-1));$('.next',lb).addEventListener('click',()=>show(li+1));
  lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-f'))close()});
  document.addEventListener('keydown',e=>{if(lb.hidden)return;
    if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(li-1);else if(e.key==='ArrowRight')show(li+1);else if(e.key==='Tab')trapTab(lb,e)});
  box.addEventListener('pointerdown',e=>{sx=e.clientX});
  box.addEventListener('pointerup',e=>{const d=e.clientX-sx;if(Math.abs(d)>50)show(li+(d<0?1:-1))});
  return{open};
})());

/* ---------- cualquier [data-open] abre el visor que corresponda ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-open]');if(!t)return;
  const v=t.dataset.open,i=v==='cur'?cur:/^\d+$/.test(v)?+v:idx(v);
  if(i<0)return;
  (mobile.matches?overlay():lightbox()).open(i);
});
})();

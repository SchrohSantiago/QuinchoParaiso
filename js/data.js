/* Datos de contenido: lo que más seguido se edita (teléfono, precios, fotos, video).
   Los textos de la página (títulos, descripciones, preguntas) están directamente en index.html. */
(()=>{
const QP=window.QP;

const CONFIG={
  name:'Quincho Paraíso',
  wa:'5492915761795',                 /* WhatsApp: 54 + 9 + código de área (sin 0) + número (sin 15). Es el mismo que está en los enlaces wa.me de index.html */
  address:'Brickman 1345, Bahía Blanca, Buenos Aires, Argentina',
  capacity:30,
  shifts:{dia:{label:'Día',hours:'12 a 20 hs'},noche:{label:'Noche',hours:'20 a 03 hs'}}
};

/* Fotos de la galería, en el orden en que aparecen. Cada una necesita sus tres tamaños en assets/img/:
   <id>-480.webp, <id>-800.webp y <id>-<w>.webp  (los genera tools/optimize-images.py y también te dice w, h y color).
   cat = categoría que se muestra como epígrafe; el visor muestra juntas las fotos de la misma categoría. */
const PHOTOS=[
  {id:'pileta',          w:960, h:1280,color:'#396f9b',cat:'Pileta', alt:'Pileta azul con borde de cenefa griega, palmeras y laureles en flor'},
  {id:'pileta-deck',     w:960, h:1280,color:'#4d6c90',cat:'Pileta', alt:'Pileta con borde de cenefa, deck de madera y palmeras de fondo'},
  {id:'salon-fogon',     w:1280,h:960, color:'#746d69',cat:'Salón',  alt:'Salón con mesas servidas, sillas y decoración con globos'},
  {id:'mesa-servida',    w:1280,h:960, color:'#8a837f',cat:'Salón',  alt:'Mesa larga con platos, copas y servilletas listas para el festejo'},
  {id:'salon-corazones', w:960, h:1280,color:'#78726f',cat:'Salón',  alt:'Mesa principal del salón con globos en forma de corazón'},
  {id:'galeria-toldo',   w:960, h:1280,color:'#686058',cat:'Afuera', alt:'Galería cubierta con mesa larga y sillas, con la pileta al costado'},
  {id:'deck-reposeras',  w:960, h:1280,color:'#776b72',cat:'Patio',  alt:'Deck de madera con sillas blancas y mesa ratona'},
  {id:'patio-jardin',    w:960, h:1280,color:'#737773',cat:'Patio',  alt:'Patio con césped, plantas y una palmera al sol de la tarde'},
  {id:'juegos',          w:960, h:1280,color:'#707053',cat:'Juegos', alt:'Tobogán verde y hamacas en el sector de juegos del patio'}
];
const MOSAIC=['pileta-deck','salon-fogon','patio-jardin','juegos']; /* las 4 fotos que se ven en el mosaico (compu) */

/* Video con música. Guardalo en assets/video/quincho.mp4 y se publica solo (ver README).
   Mientras el archivo no exista, la sección muestra "Próximamente". */
const VIDEO={
  file:'assets/video/quincho.mp4',
  youtube:'',        /* alternativa: ID de un video de YouTube (ej. 'dQw4w9WgXcQ'); si se completa, se usa en lugar del archivo */
  ratio:'16 / 9'     /* proporción del marco: '16 / 9' (horizontal) o '9 / 16' (vertical, como un reel). Se ajusta sola al cargar el video */
};

/* rutas de las imágenes por tamaño */
const src=(p,w)=>`assets/img/${p.id}-${w}.webp`;
const srcset=p=>[480,800,p.w].map(w=>`${src(p,w)} ${w}w`).join(', ');

QP.data={CONFIG,PHOTOS,MOSAIC,VIDEO,src,srcset};
})();

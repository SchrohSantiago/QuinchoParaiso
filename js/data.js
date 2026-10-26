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
  {id:'pileta',          w:1086,h:1448,color:'#377b9b',cat:'Pileta', alt:'Pileta azul con borde de cenefa griega, palmeras y laureles en flor'},
  {id:'pileta-techada',  w:1086,h:1448,color:'#547788',cat:'Pileta', alt:'Pileta bajo techo con cortina enrollada, rodeada de palmeras y jardín'},
  {id:'patio-pileta',    w:1086,h:1448,color:'#547d9c',cat:'Patio',  alt:'Deck junto a la pileta con reposeras blancas y palmera de fondo'},
  {id:'deck-reposeras',  w:1086,h:1448,color:'#936e51',cat:'Patio',  alt:'Deck de madera con sillas blancas y mesa ratona'},
  {id:'salon',           w:1086,h:1448,color:'#836a5c',cat:'Salón',  alt:'Salón con varias mesas largas vestidas, listo para un evento'},
  {id:'salon-luz',       w:1086,h:1448,color:'#866c5d',cat:'Salón',  alt:'Salón luminoso con mesas largas, ventilador de techo y ventanal'},
  {id:'salon-parrilla',  w:1086,h:1448,color:'#857f7b',cat:'Salón',  alt:'Mesas del salón junto al sector del fogón'},
  {id:'parrilla',        w:1086,h:1448,color:'#897264',cat:'Salón',  alt:'Fogón de material con parrilla grande, ideal para asados'},
  {id:'mesa-servida',    w:1280,h:960, color:'#8f7c73',cat:'Salón',  alt:'Mesa larga con platos, copas y servilletas listas para el festejo'},
  {id:'cocina',          w:1086,h:1448,color:'#877a72',cat:'Cocina', alt:'Cocina industrial equipada, con horno, anafe y lavavajillas'},
  {id:'freezer-vajilla', w:1086,h:1448,color:'#a79e9a',cat:'Cocina', alt:'Freezer y mueble con vajilla lista para usar'},
  {id:'galeria-toldo',   w:1086,h:1448,color:'#807060',cat:'Afuera', alt:'Mesas y sillas bajo toldo, al aire libre junto a la pileta'},
  {id:'juegos-jardin',   w:1086,h:1448,color:'#5d713b',cat:'Juegos', alt:'Juegos de plaza entre palmeras y canteros floridos'},
  {id:'juegos-parque',   w:1086,h:1448,color:'#638566',cat:'Juegos', alt:'Hamacas, tobogán y calesita en el sector de juegos'},
  {id:'futbolin',        w:1280,h:960, color:'#9a9c9a',cat:'Juegos', alt:'Metegol para los más grandes'},
  {id:'trampolin',       w:1086,h:1448,color:'#6c7f69',cat:'Juegos', alt:'Cama saltarina con red de seguridad sobre el césped'}
];
const MOSAIC=['pileta-techada','salon','parrilla','juegos-jardin']; /* las 4 fotos que se ven en el mosaico (compu) */

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

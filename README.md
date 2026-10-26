# Quincho Paraíso · Landing page

Sitio web de una sola página para **Quincho Paraíso**, quincho con pileta para festejos en Bahía Blanca (Brickman 1345).
Es HTML, CSS y JavaScript puros: no hay que instalar nada ni compilar. Mismo criterio de orden y de rendimiento que **Terra Ventus**,
pero con un diseño propio y bastante menos animaciones.

## Cómo verlo en tu computadora

Abrí `index.html` con doble clic. Si querés verlo como en un hosting real (recomendado, así el mapa y las fuentes cargan igual):

```bash
python -m http.server 8000
```

y entrá a <http://localhost:8000>.

## Estructura

```
index.html                 estructura y textos de la página (HTML)
css/base.css               fuentes, variables de color, tipografía, botones y la cenefa griega
css/sections.css           estilos de cada sección, en el orden en que aparecen
css/gallery.css            galería y visor de fotos (el de Terra Ventus)
css/motion.css             TODAS las animaciones, la pantalla de carga y los modos "lite" / "reducir movimiento"
css/error.css              estilos de la página 404
js/helpers.js              utilidades compartidas (todo cuelga de un único objeto: QP)
js/boot.js                 pantalla de carga y detección de equipos lentos
js/data.js                 contenido que se edita seguido: teléfono, fotos, video
js/ui.js                   menú, aparición al bajar, contadores, turnos, formulario → WhatsApp, mapas
js/gallery.js              galería y visor de fotos (compu: mosaico + visor grande; celular: carrusel + pantalla completa)
js/video.js                sección de video con música
js/scroll.js               efectos con el scroll: barra de progreso, parallax del hero y el recorrido que se desliza de costado
assets/fonts/              tipografías alojadas en el sitio (Bricolage Grotesque y Figtree, solo caracteres latinos: 46 KB)
assets/img/                fotos ya optimizadas, cada una en 3 tamaños (-480, -800 y el tamaño completo, en WebP)
assets/icons/              logo e íconos (favicon, apple-touch, 192/512)
assets/og-pileta-techada-foto.jpg foto que se ve al compartir el link (WhatsApp, Facebook…)
assets/video/              acá va quincho.mp4 (ver "Video con música")
tools/optimize-images.py   convierte y achica las fotos (ver "Fotos")
tools/og-image.html        plantilla de la imagen para compartir
tools/originals/           fotos originales (no se suben al hosting)
vercel.json                encabezados de seguridad y caché (Vercel)
robots.txt, sitemap.xml    indexación en buscadores
manifest.webmanifest       nombre e íconos de la web
404.html                   página de error con la marca
```

Los archivos JS no usan módulos (`import`) a propósito: así la página también funciona abriendo `index.html` con doble clic.
El orden en que se cargan está en el `<head>` de `index.html` y es el mismo que el de la lista de arriba.

## Diseño (en qué se diferencia de Terra Ventus)

| | Terra Ventus | Quincho Paraíso |
|---|---|---|
| Aire | bosque y mar, tonos oliva | verano y pileta: azul pileta, amarillo sol y crema |
| Tipografía | serif liviana + manuscrita | Bricolage Grotesque (títulos, gruesa) + Figtree (texto) |
| Formas | rectángulos de esquinas casi rectas | **arcos**, botones redondeados y stickers |
| Motivo | pinos y olas dibujados | la **cenefa griega** que tiene el borde de la pileta de las fotos |
| Movimiento | escenas animadas en capas | pocas animaciones, cada una con un motivo (ver abajo) |

Las animaciones que hay, en orden de importancia: la entrada del hero (una sola vez), el **recorrido que se desliza de costado** al bajar,
las olas del hero y la cenefa de datos (bucle lento, se pausan fuera de pantalla), la aparición de cada bloque al bajar, los íconos que se
dibujan al aparecer y el ecualizador del video (solo mientras suena).

## Rendimiento

Se mantiene el criterio de Terra Ventus:

- **Solo se anima `transform` y `opacity`** (los resuelve la GPU del celular); nada se redibuja al scrollear. Hay un único escuchador de scroll, a lo sumo una vez por cuadro.
- Lo que no está en pantalla se pausa; todo se apaga con **"reducir movimiento"** del sistema.
- **Modo "lite"** para equipos lentos (`js/boot.js`): el recorrido pasa a ser un carrusel que se desliza con el dedo y se apagan el parallax y los bucles.
  Lo activan el ahorro de datos, los celulares con ≤ 2 GB de RAM o ≤ 4 núcleos, y una prueba corta de velocidad del procesador (la misma de Terra Ventus, a un tercio del trabajo).
- Fotos en **WebP con 3 tamaños** (`srcset`), con alto y ancho declarados (sin saltos de diseño), color de fondo mientras cargan y `loading="lazy"`.
  La foto principal se precarga con prioridad alta; las del recorrido se piden recién cuando la sección está por verse.
- Tipografías propias recortadas a las letras que se usan (46 KB en total) y precargadas.
- CSS y JS sin dependencias ni librerías. La galería, el visor y el video se arman solo cuando hacen falta.
- Seguridad: `vercel.json` incluye una política de contenido estricta (sin scripts ni estilos en línea).

Medición con Lighthouse (celular simulado con 4G lento y procesador 4 veces más lento, servido con compresión como en Vercel):
**Rendimiento 96 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100**; en escritorio, 100 en las cuatro. Transferencia inicial: unos 270 KB.

## Probar los modos

Agregá esto a la dirección:

- `?fx=lite` o `?fx=full`: fuerza el modo de equipo lento o el completo.
- `?debug`: muestra un recuadro con lo que midió el equipo (modo, procesador, memoria, núcleos).
- `?noloader`: sin pantalla de carga (útil para sacar capturas).
- `?intro`: repite la bienvenida completa, incluso si ya la viste en esta pestaña. Se puede combinar con `?intro&fx=full` o `?intro&fx=lite`.

### Bienvenida animada

La entrada es una postal de verano con un sol que aparece, una palmera, dos capas de olas y el nombre Paraíso. Un telón azul sube para descubrir el inicio. Está hecha con CSS y SVG inline: no agrega librerías, imágenes descargables ni bucles JavaScript por cuadro.

- Espera solamente las dos fuentes locales y la decodificación de la foto principal; no espera el evento `window.load`. La barra representa recursos resueltos (incluidos los que fallan), no un porcentaje de bytes descargados.
- Cada visita con bienvenida visible: presentación mínima de 2 segundos para que se perciban el sol, las olas y el título. `?noloader`, movimiento reducido, el botón Entrar y Escape la omiten. `sessionStorage` se conserva solo para identificar la visita, no para acortar la duración.
- El botón **Entrar**, la tecla **Escape** o pasar el foco al contenido permiten saltar la espera. Con movimiento reducido o `?noloader`, la bienvenida se omite.
- Si un recurso queda pendiente, abre a los 4,2 segundos del inicio del controlador. Si falla el script, el CSS oculta la pantalla y libera el desplazamiento a los 7 segundos. Sin JavaScript, la bienvenida no se muestra.
- Las olas se pausan cuando la pestaña está oculta. El modo lite elimina los movimientos decorativos, y el elemento de carga se retira al terminar la transición.

## Datos que se editan

- **WhatsApp y teléfono:** `5492915761795` (54 + 9 + código de área 291 + número, sin 15) está en los enlaces `wa.me` de `index.html`
  y en `CONFIG.wa` de `js/data.js`; el teléfono `291 576-1795` / `+542915761795` está en los enlaces `tel:` y en textos.
  Buscalos con Ctrl+F y reemplazalos en todos lados.
- **Precios y turnos:** `$250.000`, `$50.000` y `$200.000` aparecen en la franja de datos, en la sección "Alquiler", en las preguntas frecuentes
  y en los datos estructurados del `<head>` (buscalos con Ctrl+F). Los turnos (`12 a 20 hs` y `20 a 03 hs`) también están en `CONFIG.shifts` de `js/data.js`,
  que es lo que usa el mensaje de WhatsApp.
- **Preguntas frecuentes:** son pestañas (`<button role="tab">`) con su panel de respuesta, en la sección `#faq` de `index.html`. Si cambiás una respuesta,
  cambiala también en el bloque `FAQPage` (`ld+json`) del `<head>`, para que Google muestre lo mismo.
- **Dirección y mapa:** `Brickman 1345, Bahía Blanca`. El mapa usa las coordenadas (`-38.7405995, -62.2644465`) para que Google no muestre
  el nombre de otro comercio; si cambiás la dirección, actualizá el `src` del `<iframe>` y los enlaces de "Cómo llegar".
- **Colores y esquinas:** variables al principio de `css/base.css`.

## Fotos

Las fotos originales están en `tools/originals/`. Para agregar o cambiar una:

1. Guardá la foto en `tools/originals/` con un nombre corto y sin tildes (por ejemplo `cocina.jpg`).
2. Ejecutá (necesita Python con Pillow: `pip install pillow`):

   ```bash
   python tools/optimize-images.py
   ```

   Genera `assets/img/cocina-480.webp`, `cocina-800.webp` y `cocina-<ancho>.webp`, y al final imprime el ancho, el alto y el color promedio.
3. Sumala a la lista `PHOTOS` de `js/data.js` (con esos datos, un epígrafe en `cat` y un texto en `alt`). Aparece sola en el visor.
   Si querés que salga también en el mosaico de la compu, agregá su id a `MOSAIC`.

> Conviene sumar una foto del **fogón** y otra de la **cocina industrial**: hoy no hay ninguna que los muestre bien y son parte de lo que ofrece el quincho.

## Video con música

La sección "Video" ya está lista. Solo falta el archivo:

1. Guardá el video como `assets/video/quincho.mp4` (MP4 con video H.264 y audio AAC). Apenas exista, la página lo reproduce sola;
   mientras no esté, muestra "Próximamente". No hace falta tocar código.
2. Para que pese poco (idealmente menos de 25 MB), con [ffmpeg](https://ffmpeg.org/):

   ```bash
   ffmpeg -i original.mp4 -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart assets/video/quincho.mp4
   ```

3. El marco se ajusta solo a la proporción del video (horizontal o vertical, tipo reel).
4. Si preferís **YouTube**, subí el video y pegá su ID en `VIDEO.youtube` de `js/data.js` (por ejemplo `'dQw4w9WgXcQ'`); se carga recién cuando se toca "reproducir".
5. Ojo con la música: usá una pista con licencia o libre de derechos, para que el video no sea bloqueado.
6. Si más adelante reemplazás el video, dale otro nombre (por ejemplo `quincho-2.mp4`), cambialo en `VIDEO.file` de `js/data.js` y subí el número `?v=`
   de los scripts en `index.html`: los navegadores guardan los archivos de `assets/` hasta 7 días y seguirían mostrando el anterior.

El video no se descarga hasta que la persona toca "reproducir", así que no gasta datos de quien no lo mira.

## Imagen al compartir

`assets/og-pileta-techada-foto.jpg` (1200 × 630) muestra únicamente un recorte de la foto real de `pileta-techada`, sin texto ni diseño adicional. Sale de `tools/og-image.html`. Para regenerarla (con Chrome):

```bash
chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=og.png --virtual-time-budget=4000 tools/og-image.html
```

y convertí `og.png` a JPG de calidad ~85 guardándolo como `assets/og-pileta-techada-foto.jpg`.

## Publicar en Vercel

El sitio es estático: no hay build ni dependencias. En Vercel: **Add New → Project → importar el repo** y dejar todo por defecto
(*Framework Preset: Other*, sin Build Command, *Output Directory* vacío). Cada `git push` a `main` publica solo.

El dominio principal es `https://quinchoparaiso.com/`. Ya está declarado en el canonical, las tarjetas para compartir,
los datos estructurados, `robots.txt` y `sitemap.xml`. Al publicar, asociá ese dominio al proyecto de Vercel.

**Después de publicar**

1. Probar el link en <https://developers.facebook.com/tools/debug/> (vista previa al compartir) y en <https://search.google.com/test/rich-results> (datos estructurados).
2. Dar de alta el sitio en **Google Search Console** y enviar `sitemap.xml`; crear o reclamar la ficha de **Google Business Profile** con la dirección y el teléfono.
3. Si se cambia un archivo de `css/` o `js/`, subir el número `?v=` de las etiquetas de `index.html` para que los celulares no usen la copia vieja.
4. Si se agregan servicios externos nuevos (otro mapa, analítica, fuentes), sumarlos a la `Content-Security-Policy` de `vercel.json` o el navegador los va a bloquear.

## Subirlo a GitHub

1. Creá un repositorio **vacío** en <https://github.com/new> (sin README ni .gitignore) llamado, por ejemplo, `quincho-paraiso`.
2. En esta carpeta:

```bash
git init
git add .
git commit -m "Landing de Quincho Paraíso"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/quincho-paraiso.git
git push -u origin main
```

## Publicarlo gratis con GitHub Pages

En el repositorio: **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`. Queda en `https://TU-USUARIO.github.io/quincho-paraiso/`.
Las rutas de las imágenes y de los archivos son relativas, así que funciona tanto en la raíz de un dominio como en una subcarpeta
(los encabezados de `vercel.json` solo se aplican en Vercel).

# clicApp · El Huerto de Rosi

Minijuegos para aprender a manejar el ratón (clic, doble clic, arrastrar, seleccionar, rueda y clic derecho)
con alumnado sin experiencia digital, menores y mayores de 65. Todo en castellano, ambientado en un huerto
donde la regadera **Rosi** guía cada nivel.

© 2026 Lorena Poza y Ricardo Arranz · Todos los derechos reservados. Prohibida su copia o distribución sin autorización escrita.

## Cómo usarla

- **Pendrive / sin conexión:** copiar la carpeta entera y abrir `index.html` con el navegador (protocolo `file://`).
- **Web:** subir la carpeta a cualquier hosting estático. No hay backend, ni npm, ni build.
- No carga nada de internet: HTML + CSS + JS clásico (sin módulos ni `fetch`) y gráficos SVG dentro del código.
- Pensada para 8-16 ordenadores a la vez: cada navegador corre su propia copia, no hay estado compartido.

## Estructura

```
index.html        pantallas: inicio, juego, final y ventanas modales
css/estilos.css   todo el diseño (tamaños de objetos en la unidad --u, adaptables al tamaño de pantalla)
js/arte.js        dibujos SVG (Rosi, plantas, verduras, cofre, diagrama del ratón…)
js/motor.js       flujo de pantallas, contexto de nivel y utilidades (arrastrar, doble clic, menú contextual)
js/niveles.js     los 20 niveles; el último reutiliza los niveles 2, 4, 8, 12, 14 y 17
test/jugar.js     prueba automática que juega los 20 niveles con ratón simulado
```

## Niveles

| Nivel | Habilidad |
|---|---|
| 1 | Mover la flecha (sin pulsar) |
| 2-3 | Clic simple (estático y sobre objetos que se mueven) |
| 4-6 | Doble clic (cofre, zanahorias, abrir carpeta y cerrar ventana) |
| 7-10 | Arrastrar y soltar (semillas, regadera, cestas, mover ventana y deslizador) |
| 11-13 | Seleccionar (rectángulo, palabra con doble clic, frase arrastrando) |
| 14-16 | Scroll vertical, horizontal y en las dos direcciones |
| 17-19 | Clic derecho (menú, menús distintos por objeto, copiar y pegar) |
| 20 | Maestro: seis pruebas seguidas que combinan todo |

## Decisiones de diseño

- **Accesibilidad:** botones de ≥ 3,5 rem, zonas de acierto ampliadas, barras de scroll de ~2 rem, flecha del ratón grande
  (botón «Flecha» de la barra superior, activada por defecto), botón «Ayúdame» que hace parpadear lo que hay que pulsar.
- **Doble clic propio:** ventana de 800 ms y 50 px de tolerancia (`DBL_MS`/`DBL_PX` en `motor.js`), más generosa que la
  del sistema, para quien tiene poca precisión.
- **Sin castigo:** los fallos solo dan un aviso amable; no hay tiempo ni vidas.
- **Clic derecho:** el menú del navegador está bloqueado en todo el juego; solo los niveles 17-19 lo usan.
- **Sonido:** apagado por defecto (aulas con muchos equipos); se activa con el botón «Sonido».
- **Nombre:** se guarda en `sessionStorage` (se borra al cerrar la pestaña) y personaliza los textos y el diploma.
  «Volver al inicio» lo borra.
- **Fecha del pie:** se calcula al cargar, formato DD/MM/AA.

## Para docentes

- Saltar a un nivel: `index.html#nivel=7` (tras escribir el nombre y pulsar EMPEZAR).
- Si se recarga la página, aparece «Continuar en el nivel N» (misma pestaña).
- Añadir un nivel: copiar un bloque `L.push({...})` de `js/niveles.js` antes del nivel maestro; el contador
  «Nivel X de N» y la barra de progreso se ajustan solos.

## Probar

```
CHROME_PATH=<ruta a chrome> node test/jugar.js [carpeta_capturas]    # W=1920 H=1080 para otra resolución
```
Necesita Playwright (el del repo `/root/rp/node_modules` sirve). Abre `index.html` por `file://`, juega los 20 niveles y
falla si alguno no se puede superar o hay errores de consola.

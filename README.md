# Team Hodnett Luxury · ATREZZO

Prototipo funcional de dirección editorial y experiencia inmobiliaria. Referencia de negocio: [Team Hodnett Luxury](https://teamhodnettluxury.com/). El proyecto usa fotografías y contenido del cliente; Elite Real Estate se estudió exclusivamente como referencia de composición, escala y movimiento.

## Ejecutar

Requiere Node.js 20 o superior. No hay dependencias que instalar.

```sh
npm run build
npm run dev
```

Abrir `http://127.0.0.1:8876/`. `PORT=9000 npm run dev` permite cambiar el puerto. `npm test` verifica el buscador y `npm run check` comprueba referencias del resultado compilado.

Para un host que use un subdirectorio, compilar con `SITE_BASE_PATH=/Team-Hodnett npm run build`. La vista privada de Sites usa la raíz predeterminada.

## Funcionalidad del prototipo

- Portada fotográfica a pantalla completa, escena narrativa de tres capítulos con scroll nativo, colección seleccionable y transiciones entre páginas.
- Buscador público sin barrera de registro. Busca ciudad, dirección, ZIP y características. Entiende ejemplos como `Southlake 6 beds under $5m` o `pool under $2m`.
- Filtros de estado, ciudad, presupuesto, habitaciones y piscina; ordenación, paginación y URL que conserva los filtros.
- 394 registros de propiedades del sitemap observado el 4 de noviembre de 2026, con sus fichas, galerías recuperadas y procedencia.
- Favoritos persistentes en el navegador y un perfil de presentación simulado.
- Recorridos de contacto, visita y valoración. Se preparan localmente y muestran una confirmación explícita; no se envían datos ni se inventa una valoración automática.
- 12 guías y 18 artículos de Luxury. Páginas de marca, vendedores y testimonios, archivo de reconocimientos y 23 vídeos originales con reproducción bajo demanda.
- Documentos TREC del sitio del cliente y texto de privacidad existente. No se utilizan documentos de la referencia Elite.
- Menús y galerías con diálogos nativos, teclado y Escape. Control de movimiento reducido, además de la preferencia del sistema.

## Contenido y límites

Los datos son una captura del 27 de octubre al 4 de noviembre de 2026. No son un feed MLS en tiempo real. Los precios históricos no publicados permanecen como valores nulos. Las fichas sin fotografías recuperadas se muestran como registros históricos, sin usar imágenes de otra propiedad.

Los tres nuevos registros presentes en el sitemap actual se recuperaron del sitio del cliente. Una URL histórica sustituida queda en el inventario de migración, no se confunde con una nueva disponibilidad.

El perfil no autentica identidades. Los favoritos se guardan en `localStorage`; los formularios no llaman a endpoints ni almacenan nombres, emails o teléfonos en el servidor. La valoración prepara una consulta, no calcula un precio ficticio. La web está marcada `noindex` mientras sea una presentación.

La biblioteca completa, el ZIP original y los informes de auditoría no se suben a este repositorio. Se incluyen el código, el contenido necesario y los medios optimizados con trazabilidad en `docs/media-provenance.csv`.

## Estructura

- `content/`: contenido editable, registros y relaciones con sus fuentes.
- `public/assets/`: imágenes optimizadas, fuentes y documentos existentes del cliente.
- `public/src/`: interfaz, buscador, estilos y componentes de movimiento.
- `scripts/templates.mjs`: componentes HTML compartidos.
- `scripts/build.mjs`: genera las páginas estáticas en `dist/`.
- `tests/`: comprobaciones de comportamiento del buscador.
- `docs/`: dirección artística, alcance de integraciones y validación.

## Componentes y recursos

Se reutilizan ATREZZO SCROLL SECTIONS 02 y ATREZZO TRANSITIONS 01 de la biblioteca facilitada por el usuario. Se mantienen sus comentarios de autoría; se adaptan identidad, composición, medios y contenido. No se incluyen las fotografías de muestra de esos componentes.

Las fuentes Cormorant Garamond y Manrope se alojan localmente y conservan sus licencias OFL. El logo y los medios inmobiliarios proceden del sitio y archivo del cliente. La referencia Elite no aporta código, copy, fotografías, equipo, documentos ni datos a este prototipo.

## Conexión posterior

Cuando la propietaria apruebe el proyecto: elegir continuidad en Luxury Presence o reconstrucción independiente, conectar proveedor MLS, autenticación, CRM/formularios, valoración, agenda y medición autorizada. Revisar contenido, datos, consentimiento y recepción real antes de publicar la web de producción. Ver `docs/integrations.md`.

# Dirección artística · noviembre 2026

Las tres grabaciones del usuario se estudiaron mediante secuencias de fotogramas. La primera referencia usa sans serif dominante, tipografía breve y fotografía sin marco; la segunda alterna escenas completas y énfasis cursivo selectivo; la tercera documenta el sitio original de Sharon. La referencia Elite aporta dirección visual exclusivamente, sin copiar código, fotografías, personas, identidad ni textos.

## Aplicación
- Blanco y negro como base. Dorado para detalles de navegación y rojo ligado a Keller Williams.
- Hero con el vídeo original recuperado del archivo de Sharon. Variante móvil H264 de 4,5 MB, secuencia completa, sin audio. Pausa explícita y respuesta a movimiento reducido.
- Propiedad destacada a todo el ancho y alto del viewport, cambio de fotografía mediante disolución y tabs con teclado.
- Featured Neighborhoods integra 03 / Immersive bands de ATREZZO Service Showcase. Expansión por selección y flechas; móvil vertical.
- A Sense of Place integra 01 / Editorial Index de ATREZZO Editorial Gallery. Fotografías sincronizadas con scroll, puntero y foco. En móvil o con movimiento reducido, cada fotografía queda junto a su contenido.
- Los nombres de comunidades se mantienen como enlaces reales a sus guías. La fotografía es provisional, según indicación del usuario.
- Se eliminan las tres escenas repetitivas de la Home anterior para dar protagonismo a los recorridos específicos de propiedades y lugares.
- Nueve cifras históricas con sans serif y números alineados. Se mantienen años, atribución de oficina y alcance de los premios.
- Footer con KW, REALTOR® / Equal Housing Opportunity, contacto, enlaces sociales y documentos existentes. El crédito de la plataforma original es procedencia, no autoría de esta reconstrucción.
- Filtros propios sobre controles de formulario conservados como base. Teclado, prefijos de ciudad, Escape, cierre exterior y actualización de URL.

## Código y autoría
Los módulos propios ATREZZO se inspeccionaron antes de integrarlos. Se preservan comentarios de autoría; se adaptan paleta, textos, fotografía y accesibilidad. No se usan las imágenes de las demostraciones de componentes ni dependencias de animación externas.


## Escenas personales y header
El recorrido inicial es Hero → A Personal Connection / Sharon → The Hodnett Team → selección de propiedades. Se utilizan las dos fotografías suministradas sin modificar sus píxeles; degradados y blanco/dorado se componen en CSS. Una fijación CSS dentro de la sección crea una pausa visual con zoom máximo del 2,5 %. El siguiente panel avanza por el flujo del documento y cubre el retrato, sin bloquear el scroll. Las dos columnas de texto comparten anclaje derecho. El header cambia desde transparente a vidrio ahumado (RGBA con blur de 22px), conserva el teléfono y prioriza los cinco destinos comerciales. Los controles de favoritos/perfil se trasladan fuera del header desktop.


## Sustitución fotográfica — 6 noviembre 2026
- Se retiró la etiqueta pública `Temporary community photography` de la sección A Sense of Place.
- Flower Mound: se sustituyó la imagen de origen por una fotografía real del amanecer en Murrell Park / Grapevine Lake, tomada por Shiva Shenoy en Flower Mound, TX (3482 × 1959 original, variante WebP de 3000 × 1688). Fuente: https://commons.wikimedia.org/wiki/File:Sunrise_on_a_foggy_cold_day_in_Flower_Mound_(52692865160).jpg. Licencia CC BY 2.0: https://creativecommons.org/licenses/by/2.0/. La atribución y la indicación de adaptación constan debajo de la sección.
- Westlake: la imagen original de la municipalidad solo estaba disponible a 1512 × 1134, sin alternativa superior verificada. Se conservó la imagen existente en lugar de presentar una ampliación artificial como fotografía nueva. Es una **limitación pendiente** de fotografía de origen.
- El degradado negro se suavizó a la derecha y se preservó el texto blanco de alto contraste. No se alteraron composición, emplazamientos ni transiciones del componente.

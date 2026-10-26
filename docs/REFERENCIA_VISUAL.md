# Referencia y decisiones de diseño

Referencia: https://www.apple.com/la/mac/, consultada el 26/10/2026. Se leyó su estructura pública y se navegó la página y su carrusel en un navegador de escritorio de 1363 × 936. No se copiaron archivos ni estilos de Apple. No se afirma haber inspeccionado la referencia en un dispositivo móvil real; su adaptación móvil se tomó como objetivo de diseño y se verificó en la implementación propia.

| Patrón observado | Adaptación zadra |
| --- | --- |
| Navegación global compacta, tipografía pequeña | Cabecera de 58 px; menú, buscador y bolsa; 54 px en móvil |
| Título principal de gran escala, amplios márgenes | H1 fluido, composición editorial y espaciado amplio |
| Familia de productos ilustrada | Categorías configurables con imágenes; desplazamiento horizontal en móvil |
| Fondo gris claro y tarjetas blancas redondeadas | Sección de productos con tarjetas y controles de carrusel |
| Pestañas / navegación entre familias | Colecciones nativas y filtros Shopify, sin inventar categorías comerciales definitivas |
| Información y compra separadas por producto | Ficha y botón de producto; compra real desde variantes y carrito Shopify |
| Presentación de prestaciones en tarjetas amplias | Sección de historias con imagen y bloque de texto configurables |
| Comparación homogénea entre modelos | Tabla hasta cuatro productos de una única colección con metacampos |
| Grandes superficies y movimientos suaves | Escala discreta en hover, scroll suave y soporte de movimiento reducido |
| Footer organizado por temas | Catálogo, contacto, políticas y enlace de devoluciones configurable |

La composición se adaptó a una tienda sin catálogo definido. Los dispositivos ilustrados son conceptos vectoriales originales, sin marcas y rotulados como demostración cuando se presentan sin productos. El diseño no supone que zadra venda esos dispositivos. El contenido definitivo y las fotografías deben reemplazarse desde Shopify.

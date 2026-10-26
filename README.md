# zadra

Tema personalizado Shopify Online Store 2.0, versión 1.1.0. Identidad comercial **zadra**. Dominio previsto: **zadrastore.com**. Desarrollo privado; no se ha publicado una tienda ni activado pagos.

## Arquitectura

Se eligió un tema nativo con Liquid, plantillas JSON, secciones y bloques editables. Shopify administra productos, colecciones, variantes, inventario, pedidos y checkout. No se requieren claves Storefront API ni un servidor propio para este tema. Un frontend independiente agregaría despliegue, sesiones de compra y mantenimiento sin una necesidad funcional actual.

La referencia visual es https://www.apple.com/la/mac/: navegación compacta, categorías ilustradas, titulares amplios, superficies claras, tarjetas, carruseles y comparación. Todo el código y las ilustraciones SVG son propios; no se incluyen código, imágenes, marcas ni tipografías de Apple.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `layout/` | HTML global, metadatos y acceso con contraseña |
| `templates/` | Inicio, colección, comparador, producto, búsqueda, carrito, contacto, páginas, colecciones y 404 |
| `sections/` | Secciones y grupos editables desde Shopify |
| `snippets/` | Tarjeta de producto, filtros, iconos y paginación |
| `assets/` | CSS, JavaScript y SVG propios |
| `config/` | Ajustes globales y valores iniciales no sensibles |
| `locales/` | Traducciones base |
| `scripts/` | Validación, render local, arte y empaquetado |
| `preview/` | Vista local generada con datos de prueba, sin comercio real |
| `docs/` | Configuración, referencia visual, dominio y pruebas |

## Instalación en Shopify sin publicar

1. Descargá `zadra-shopify-theme-1.1.0.zip` de la entrega. El ZIP contiene directamente `layout/`, `assets/`, etc.; no contiene una carpeta envolvente.
2. En Shopify: **Tienda online → Temas → Agregar / importar tema → Subir archivo ZIP**.
3. Abrí **Personalizar** en el tema agregado. Mantenelo sin publicar.
4. Configurá menú principal, correo, categorías y colecciones. Reemplazá las ilustraciones por fotografías propias del catálogo.
5. Elegí una colección destacada y otra de una única categoría para comparar.
6. Cargá productos y stock; probá variantes y carrito con el checkout en modo de prueba antes de solicitar publicación.

Secciones del inicio independientes: Presentación zadra, Productos destacados, Historias zadra y Comparador. Pueden ordenarse, agregarse y quitarse desde el editor. El producto admite bloques de apps.

## Desarrollo

Requisitos: Node.js 22 o posterior y Python 3. Instalar Shopify CLI desde su distribución oficial si se desea trabajar contra una tienda.

```bash
npm ci
npm run check
npm run preview:build
npm run preview:standalone
python3 -m http.server 8080 --directory preview
```

Abrir `http://localhost:8080`. La vista autónoma `release/zadra-vista-previa.html` permite recorrer las pantallas sin instalar un servidor. El servidor es sólo para la copia descargada en tu equipo. `preview/qa.html` permite revisar diez pantallas en seis anchos. La vista local se genera a partir de las secciones Liquid reales, pero usa LiquidJS y datos ficticios, por lo que no sustituye el render ni la prueba de Shopify.

Contra una tienda autorizada:

```bash
shopify theme dev --store TU-TIENDA.myshopify.com
shopify theme check
shopify theme push --store TU-TIENDA.myshopify.com --unpublished
```

Autenticarse mediante el flujo oficial de Shopify CLI. No colocar contraseñas ni tokens en el repositorio. No usar `--live`, ni publicar, hasta obtener aprobación expresa. En actualizaciones, preservar la configuración comercial del tema de destino: hacer backup de `settings_data.json`, plantillas y grupos de secciones; evitar sobrescribirlos con los valores iniciales del repositorio.

También se puede conectar la rama `main` desde la integración oficial Shopify–GitHub cuando la cuenta y los permisos estén habilitados. `.shopifyignore` excluye herramientas y documentación de las cargas por CLI.

## Funciones comerciales

- Colecciones paginadas, filtros nativos y ordenamiento. Los filtros deben habilitarse en Shopify Search & Discovery.
- Producto: imágenes, miniaturas, video / modelos cargados en Shopify, selector de variantes, precio y disponibilidad actualizables, reglas de cantidad y errores del carrito.
- Bolsa nativa: cantidades, eliminación, notas, descuentos, total y botón de checkout Shopify.
- Buscador nativo de productos. No incluye sugerencias predictivas.
- Contacto nativo de Shopify; no hay proveedor de correo externo incorporado.
- Comparador: hasta cuatro productos de una colección de la misma categoría, con metacampos `custom` editables. El botón «Comparar esta colección» usa la plantilla `collection.compare.json`.
- SEO: título, descripción, URL canónica, Open Graph y datos estructurados nativos del producto.
- Navegación por teclado, enlace de salto, foco visible, menús con `details`, cierre con Escape y respeto por movimiento reducido.

Los datos comerciales provienen de Shopify. Los SVG conceptuales y estados de catálogo vacío no ofrecen productos ni precios. Los importes de `preview/` son exclusivamente fixtures rotulados; nunca se importan al catálogo Shopify.

## Comparador y contenido

Crear definiciones de metacampos de producto, tipo texto de una línea, en **Configuración → Datos personalizados → Productos**:

| Clave | Uso |
| --- | --- |
| `custom.subtitle` | Descripción breve en tarjeta y ficha |
| `custom.material` | Material |
| `custom.dimensions` | Dimensiones |
| `custom.connectivity` | Conectividad |
| `custom.warranty` | Garantía comercial informada por el vendedor |

En el Comparador agregar filas con una etiqueta y la clave, sin `custom.`. Los datos faltantes se muestran como «Sin especificar». No se deducen especificaciones. Mantener cada colección comparada dentro de una sola categoría. En la plantilla alternativa de colección se pueden agregar las mismas filas desde el editor.

## Empaquetado

```bash
npm run check
npm run package
```

Genera `release/zadra-shopify-theme-1.1.0.zip` y su SHA-256. `scripts/package.py` valida la integridad del ZIP y excluye documentación, dependencias, pruebas y vista previa. El tema funciona sin compilar JavaScript ni CSS.

## Validación y límites

Ver [informe de pruebas](docs/PRUEBAS.md). Theme Check oficial pasó sin observaciones. La revisión local no certifica la instalación en una tienda, los datos del catálogo, emails, impuestos, logística, pagos ni Core Web Vitals reales. La versión inicial del selector recorre `product.variants`, por lo que admite hasta 250 variantes renderizadas por producto; catálogos con más variantes requieren un selector por opciones y Section Rendering API antes de su uso. No incluye precios de planes de suscripción ni interfaz especializada B2B.

## Dominio y salida comercial

Ver [dominio y correo](docs/DOMINIO.md) y [pendientes comerciales](docs/CONFIGURACION.md). No se ha modificado DNS, correo, proveedor de pagos ni configuración de producción.

## Mantenimiento

Trabajar en ramas cortas, ejecutar `npm ci`, `npm run check` y reconstruir la vista previa antes de cada entrega. Probar el tema en una copia no publicada de Shopify antes de integrar cambios en `main`. Versionar los cambios con commits descriptivos. El repositorio es privado y no concede licencia pública de redistribución. Las dependencias de desarrollo conservan sus licencias propias; las ilustraciones son originales y sustituibles.

Fuentes técnicas: [arquitectura](https://shopify.dev/docs/storefronts/themes/architecture), [API de carrito](https://shopify.dev/docs/api/ajax/reference/cart), [variantes](https://shopify.dev/docs/storefronts/themes/product-merchandising/variants/support-high-variant-products).

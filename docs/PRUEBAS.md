# Informe de pruebas · zadra 1.1.0

Fecha: 26/10/2026. Alcance: código y vista local generada desde las secciones Liquid, con fixtures explícitos. No se dispone todavía de una tienda Shopify de destino.

| Verificación | Resultado |
| --- | --- |
| Shopify Theme Check oficial 3.31.0 | 0 observaciones, tras generar todos los recursos |
| Plantillas JSON y referencias a secciones | Correctas mediante `npm run check` |
| Sintaxis JavaScript | Correcta con `node --check` |
| Vista responsive | Diez pantallas × seis anchos = 60 comprobaciones DOM; sin desbordamiento global ni imágenes rotas |
| Tamaños de iframe | 320, 375, 390, 768, 1024 y 1440 px; el área de contenido descuenta el scrollbar del navegador |
| Pantallas revisadas | Inicio, catálogo, producto, comparador, bolsa vacía, bolsa con artículos, buscador, contacto, catálogo vacío y 404 |
| Menú móvil | Apertura y cierre con Escape comprobados |
| Variantes y galería | Cambio de precio y precio anterior, estado agotado, bloqueo de compra y cambio de miniatura comprobados en navegador local |
| Recursos | SVG originales locales, sin fuentes ni librerías remotas en ejecución |
| Datos ficticios | Limitados a la vista local, rotulados y sin conexión comercial |

## Pruebas que requieren la cuenta Shopify

- Aceptación del ZIP y render Liquid definitivo en el editor de temas.
- Colecciones, filtros habilitados en Search & Discovery, búsqueda e indexación real.
- Respuesta del servidor a stock agotado, reglas de cantidad, descuentos y errores.
- Carrito, checkout, pagos, rechazo, devolución, notificaciones y actualización de inventario reales.
- Contacto y recepción de emails.
- Videos, modelos 3D y bloques de apps efectivamente cargados.
- SEO sobre dominio final, sitemap y rastreo de buscadores.
- Lighthouse / Core Web Vitals y métricas de campo. No se asignó una puntuación estimada.
- Revisión sobre iOS / Android reales, lectores de pantalla y navegadores alternativos.

## Límites conocidos

El selector inicial utiliza hasta 250 variantes de `product.variants`; para productos mayores se requiere selección granular y Section Rendering API. El comparador usa hasta cuatro productos de una única colección, cuya categoría debe definir el administrador. No incluye motor de recomendaciones, sugerencias predictivas, cuentas de clientes personalizadas, suscripciones ni lógica B2B especializada. La versión no está certificada para la venta en Shopify Theme Store; es un tema privado personalizado.

La vista local usa LiquidJS, filtros de compatibilidad y formularios bloqueados explícitamente: no simula pagos, no mantiene una bolsa ficticia y no envía mensajes. Sus precios son fixtures, no precios de zadra. La validación local aporta evidencia sobre estructura y comportamiento visual, pero no demuestra una integración comercial ya operativa.

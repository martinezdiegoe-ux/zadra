# zadrastore.com: conexión a Shopify sin afectar el correo

Guía preparada el 26/10/2026. No se ejecutó ningún cambio DNS y no se verificó aún el proveedor ni la zona DNS actual.

## Antes de tocar registros

1. Identificar el registrador y el proveedor que aloja la zona DNS mediante el panel y los servidores NS actuales. No asumir que es Google por utilizar Google Workspace.
2. Exportar o capturar la zona completa y registrar TTL y valores actuales. Confirmar que `ventas@zadrastore.com` puede enviar y recibir.
3. Conservar sin modificaciones todos los registros de correo: MX de Workspace, TXT de verificación y SPF, selectores DKIM, DMARC y cualquier registro de otros servicios. No copiar valores genéricos de correo: preservar los que efectivamente tenga la cuenta.
4. Verificar si existen servicios web en el dominio raíz o `www` y si la zona está administrada por Cloudflare u otro proveedor. Revisar también CAA, proxies y DNSSEC con el proveedor cuando corresponda.
5. No cambiar nameservers ni transferir el dominio para realizar esta conexión. Solicitar aprobación expresa antes de ejecutar cambios de producción.

## Valores orientativos de la documentación oficial

La pantalla **Configuración → Dominios → Conectar dominio existente** de la tienda es la autoridad para los valores concretos. La documentación oficial consultada indica:

| Tipo | Nombre | Destino |
| --- | --- | --- |
| A | `@` | `23.227.38.65` |
| AAAA | `@` | `2620:0127:f00f:5::` |
| CNAME | `www` | `shops.myshopify.com.` |

Modificar únicamente los registros web necesarios, luego de verificar los valores que pida esa tienda. Resolver los conflictos de A/AAAA del mismo nombre con el proveedor sin borrar otros registros a ciegas. No reemplazar la zona completa ni los MX / TXT del correo.

## Conexión, comprobación y reversión

1. Agregar `zadrastore.com` como dominio existente en Shopify.
2. Tras la aprobación, realizar sólo los cambios verificados. Mantener el tema sin publicar hasta la aprobación comercial independiente.
3. Esperar propagación y aprovisionamiento de TLS/SSL. Shopify indica que puede demorar hasta 48 horas; no dar por finalizado hasta que su panel confirme conexión y certificado.
4. Probar raíz y `www` por HTTPS, redirección al dominio principal aprobado, rutas de producto y retorno del checkout.
5. Comparar MX, SPF, DKIM y DMARC con el respaldo. Enviar un mensaje desde y hacia `ventas@zadrastore.com` desde una cuenta externa y comprobar autenticación / recepción.
6. Si algo falla, restaurar únicamente los valores web anteriores a partir del respaldo, revisar la propagación y conservar intactos los registros de correo.

Fuente: https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/connect-domain-manual

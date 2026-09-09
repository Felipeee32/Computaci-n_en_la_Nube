# CloudStock

Sistema de inventario en la nube — Computación en la Nube, IP Santo Tomás.
Autor: Felipe Gallardo Calderón.

## Cómo ejecutar en local
1. Clona el repositorio.
2. Abre `index.html` con Live Server (extensión de VS Code) o cualquier servidor estático.
3. Los datos se leen/escriben en tiempo real desde Firebase Firestore.

## Cómo desplegar
Publicado en GitHub Pages: Settings → Pages → rama `main` → carpeta `/ (root)`.
URL pública: https://felipeee32.github.io/Computaci-n_en_la_Nube/

## Modelo de datos
Colección `productos` en Firestore, cada documento con:
- `nombre`: string
- `stock`: número entero >= 0

## Enfoque cloud
- **Hosting**: GitHub Pages (sirve los archivos estáticos: HTML, CSS, JS).
- **Datos**: Firebase Firestore (base de datos NoSQL en tiempo real, gestionada por Google).
- **Flujo**: el navegador carga `app.js`, este se conecta directo a Firestore
  usando el SDK de Firebase, y cualquier cambio (crear, editar, eliminar)
  se sincroniza en tiempo real hacia todos los dispositivos conectados.
- **Diferencia con localStorage**: localStorage guarda los datos solo en el
  navegador de un usuario específico; acá los datos viven en un servidor
  compartido en la nube, por lo que persisten aunque se cambie de dispositivo
  o se borre el caché, y todos ven la misma información al mismo tiempo.

## Seguridad
No se expone ninguna contraseña ni credencial secreta. El `firebaseConfig` en
`app.js` es información pública del proyecto; el control de acceso real está
en las Reglas de Seguridad de Firestore, que validan que `nombre` sea un
texto no vacío y `stock` un entero mayor o igual a 0 antes de aceptar
cualquier escritura.

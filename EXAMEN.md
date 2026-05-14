# EXAMEN F13

## Asimetría de borrado: clientes vs albaranes

Los clientes y los albaranes no se tratan igual al borrar porque no son el mismo tipo de dato.

Un cliente es una relación comercial. Puede que deje de trabajar con la empresa un tiempo y luego vuelva, así que tiene sentido poder archivarlo sin borrarlo del todo. De ahí el soft delete. Y si se quiere borrar de verdad, también se puede con el hard delete.

Un albarán es diferente. Representa algo que ya ocurrió: horas trabajadas, material entregado. Si está sin firmar, es básicamente un borrador y se puede borrar. Pero si ya está firmado, es un documento que el cliente ha aceptado, así que no tiene sentido meterlo en una papelera. Por eso solo hay hard delete, y con la restricción de que no esté firmado.

En resumen: los clientes son entidades que pueden estar activas o inactivas, los albaranes son registros de hechos pasados. Por eso se comportan distinto.

---

## Preguntas

### 1. Token válido pero usuario eliminado de la BD

El middleware de autenticación hace un `User.findById` en cada petición. Si el usuario fue borrado después de que se generara el token, ese find devuelve null y se devuelve 401.

Tiene sentido que sea 401 y no 403. El 403 sería "te conozco pero no puedes". El 401 es "no puedo identificarte". Como el usuario ya no existe en la base de datos, el token no sirve para identificarlo aunque sea criptográficamente válido.

Además esto es útil: si se elimina un usuario, pierde el acceso inmediatamente sin tener que esperar a que caduque el token.

### 2. Por qué los albaranes no tienen papelera

Como decía antes, un albarán firmado es un documento que ya tiene valor. No tiene sentido que esté en un estado intermedio de "archivado". O existe o no existe.

Si se borra un cliente que tiene albaranes, esos albaranes se quedan huérfanos. El campo `client` sigue teniendo el ID del cliente, pero ese documento ya no está en la BD. Mongoose no hace nada automáticamente, así que si se hace un `.populate('client')` en esos albaranes, el campo sale como null.

En una app real habría que controlar esto: o impedir borrar un cliente con albaranes activos, o guardar una copia de los datos del cliente en el propio albarán.

### 3. `{ format: 'material' }` sin el campo material

Zod identifica el schema por el discriminador `format`. Al ver `format: 'material'` activa el `materialSchema`, que tiene `material` como campo obligatorio. Como no viene, Zod lo rechaza y el middleware devuelve 400 con el array de errores, que incluye el path (`material`) y el mensaje (`El material es obligatorio`).

Es bastante informativo: sabes exactamente qué campo falta y por qué. Si acaso mejoraría añadir un código de error propio en el body para que el cliente pueda distinguirlo de otros 400.

### 4. Por qué se cierra Socket.IO antes que el servidor HTTP

Socket.IO tiene conexiones abiertas con los clientes que van por encima del servidor HTTP. Si se cerrara el HTTP primero, esas conexiones WebSocket se cortarían de golpe sin notificar nada.

Al cerrar primero Socket.IO, los clientes reciben un cierre limpio y pueden reaccionar. Después se cierra el HTTP para nuevas peticiones REST y luego MongoDB. El orden importa para no dejar cosas a medias.

### 5. Por qué 404 y no 403 cuando el albarán es de otra empresa

La query busca por `{ _id: id, company: req.user.company }`. Si el albarán existe pero es de otra empresa, el resultado es null igualmente, y se devuelve 404.

Si se devolviera 403, se estaría confirmando que ese ID existe en el sistema aunque no tengas acceso. Eso filtra información: alguien podría ir probando IDs y saber cuáles existen. Con 404, el servidor no confirma nada. Es la forma habitual de prevenir ataques de enumeración de recursos (IDOR).

---

## Proceso

Primero revisé el middleware de roles y vi que tenía un bug: cuando el rol no coincidía, hacía return sin enviar respuesta ni llamar a next(), así que la petición se quedaba colgada. Lo arreglé para que devuelva 403.

Luego añadí el schema de invitación en Zod, la función de email en el servicio existente, el controller con las validaciones de negocio (403 si piden rol admin, 409 si el email ya está en la empresa), y la ruta con la cadena de middlewares correcta.

Por último añadí los tests: guest recibe 403, solicitar rol admin recibe 403, email duplicado recibe 409, y sin token recibe 401.

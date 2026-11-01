# Fincas Verco

Web de Fincas Verco, administración de comunidades de propietarios.

## Desarrollo local

Hace falta Node.js.

```sh
npm install
npm run dev
```

La aplicación queda en http://localhost:8080/.

Los datos del portal se guardan en `.data/portal.sqlite`. Los correos de activación y de restablecimiento se escriben en `.data/outbox` y en la terminal del servidor. El archivo `.env` no se sube al repositorio: copia `.env.example` para crear el administrador inicial.

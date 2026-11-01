import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const output = resolve("dist/client");
const home = "/fincasverco/";

await mkdir(output, { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "");
await writeFile(
  resolve(output, "404.html"),
  `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Página no encontrada — Fincas Verco</title>
  </head>
  <body style="font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f7f7; color: #1c3336;">
    <main style="max-width: 28rem; padding: 2rem; text-align: center;">
      <h1 style="font-size: 1.5rem;">Página no encontrada</h1>
      <p>La dirección no existe en la web de Fincas Verco.</p>
      <p><a href="${home}">Volver al inicio</a></p>
    </main>
  </body>
</html>
`,
);
console.log(`Páginas listas en ${dirname(output)}/client`);

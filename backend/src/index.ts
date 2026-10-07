import "dotenv/config";
import { databaseStore } from "./services/store";
import { app } from "./server/server";

const port = Number(process.env.PORT ?? 8082);

let server: ReturnType<typeof app.listen>;

async function start() {
  console.log(`SENTINEL API: persistencia=${databaseStore ? "mysql" : "memory"}; configuración cargada desde backend/.env`);
  await (databaseStore ? databaseStore.initialize() : Promise.resolve());
  server = app.listen(port, () => console.log(`SENTINEL API escuchando en http://localhost:${port} (${databaseStore ? "mysql" : "memory"})`));
}

async function shutdown(signal: string) {
  console.log(`${signal} recibido, cerrando servidor...`);
  server.close(async () => {
    console.log("Servidor HTTP cerrado");
    if (databaseStore) {
      await databaseStore.close();
      console.log("Conexión a base de datos cerrada");
    }
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forzando cierre tras 10s");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (require.main === module) {
  start().catch((error: unknown) => {
    console.error("No se pudo conectar con MySQL. El servidor no se iniciará con datos en memoria:", error);
    process.exitCode = 1;
  });
}

export { app };

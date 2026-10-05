import "dotenv/config";
import { databaseStore } from "./services/store";
import { app } from "./server/server";

const port = Number(process.env.PORT ?? 8082);

if (require.main === module) {
  console.log(`SENTINEL API: persistencia=${databaseStore ? "mysql" : "memory"}; configuración cargada desde backend/.env`);
  void (databaseStore ? databaseStore.initialize() : Promise.resolve())
    .then(() => {
      app.listen(port, () => console.log(`SENTINEL API escuchando en http://localhost:${port} (${databaseStore ? "mysql" : "memory"})`));
    })
    .catch((error: unknown) => {
      console.error("No se pudo conectar con MySQL. El servidor no se iniciará con datos en memoria:", error);
      process.exitCode = 1;
    });
}

export { app };

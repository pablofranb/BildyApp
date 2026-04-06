//arranco el back  llamando a mi app y a la conexion a la base de datos, lo hago en un async await para asegurarme que se conecta antes de arrancar el servidor
import app from "./app.js";
import dbConnect from "./config/db.js";

const PORT = process.env.PORT; //cojo el peurto del env 

const startServer = async () => {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
};

startServer();
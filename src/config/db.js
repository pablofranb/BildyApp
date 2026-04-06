//conectare el back a la base de datos para guardar datos o leerlos
import mongoose from 'mongoose';
const dbConnect= async() => { 
    const DB_URI= process.env.DB_URI; 
    if(!DB_URI){
        console.error("No se ha definido la variable de entorno DB_URI");
        process.exit(1);
    }
    try{ 
        await mongoose.connect(DB_URI);
        console.log("conectado");
    }catch(error){
        console.error("Error al conectar a la base de datos:", error);
        process.exit(1);

    }
};
export default dbConnect;   
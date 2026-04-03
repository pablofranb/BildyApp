//Node = la base Express = la caja de herramientas para crear rutas, recibir peticiones y enviar respuestas
import express from 'express';
const app= express(); //lo q hare todo 

app.use(express.json()); //para q el servidor pueda entender el formato json
app.get('/health',(req,res)=>{
    res.json({status:"ok",  timestamp: new Date().toISOString() 

    });
});
export default app;

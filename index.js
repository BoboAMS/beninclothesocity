import fastifyFormbody from "@fastify/formbody"
import secureSession from "@fastify/secure-session"
import fastifyStatic from "@fastify/static"
import fastifyView from "@fastify/view"
import fastify from "fastify"
import ejs from 'ejs'
import fs from 'node:fs'
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const isMaintenanceMode = false; // Changez à false lorsque le site est opérationnel
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const app = fastify({logger:true})
app.register(fastifyView,{
    engine: {
        ejs
    }
})
app.register(fastifyStatic, {
    root:join(rootDir,'public')
})
app.register(fastifyFormbody)

app.addHook('preHandler', async (req, res) => {
  if (isMaintenanceMode) {
    res.status(503).send(`
    Les notes de TP sont actuellement en cours de saisis.
    Veuiller revenir plus tard.
    `);
  }
});

app.get('/',async (req, res)=>{
    return res.redirect('index.html')
})

app.setErrorHandler((error,req,res) => {
    if(error.message === "Cannot read properties of null (reading 'password')"){
        return res.view('template/administration.ejs', {
            message: "Erreur de connexion a l'administration. Vérifier votre connexion internet"
        })
    }
    if(error.message === "Une erreur s'est produite Réesayer"){
        return res.redirect("error.html")
    }   
    if(error.message === "pchstr must be a non-empty string"){
        return res.redirect("error.html")
    } 
    console.error(error)
    res.statusCode = 500
    return {
        error: error.message  
    }
})
app.listen({host: host, port: 8000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})


// Requires
var express = require('express'); //Server Node Express
var mongoose = require('mongoose'); // Para hacer Conexion a la db con mongoose

// Inicializar variables
var app = express();

// Conexion a la base mongo
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb',
     (err, resp) => {
            if ( err ) throw err; // si no se pudo conectar

            console.log('Base de Datos Mongodb corriendo : \x1b[32m%s\x1b[0m','Online');
    });

// Escuchar Peticiones
app.listen(3000, () => {
	console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','Online');
});


// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok:true,
        mensaje:'Peticion Realizada Correctamente'
    });

});
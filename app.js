// Requires
var express = require('express'); //Server Node Express
var mongoose = require('mongoose'); // Para hacer Conexion a la db con mongoose
var bodyParser = require('body-parser')

// Inicializar variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la base mongo
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb',
     (err, resp) => {
            if ( err ) throw err; // si no se pudo conectar

            console.log('Base de Datos Mongodb corriendo : \x1b[32m%s\x1b[0m','Online');
    });


// Rutas
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);
app.use('/',appRoutes);



// Escuchar Peticiones
app.listen(3000, () => {
	console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','Online');
});



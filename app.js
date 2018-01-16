// Requires
var express = require('express'); //Server Node Express
var mongoose = require('mongoose'); // Para hacer Conexion a la db con mongoose
var bodyParser = require('body-parser'); // Para recuperar los parametros de las llamadas del front

// Inicializar variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


// Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));



// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var medicoRoutes = require('./routes/medico');
var hospitalRoutes = require('./routes/hospital');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');

// Conexion a la base mongo
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb',
     (err, resp) => {
            if ( err ) throw err; // si no se pudo conectar

            console.log('Base de Datos Mongodb corriendo : \x1b[32m%s\x1b[0m','Online');
    });


// Rutas
app.use('/imagenes',imagenesRoutes);
app.use('/upload',uploadRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/medico',medicoRoutes);
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);
app.use('/',appRoutes);



// Escuchar Peticiones
app.listen(3000, () => {
	console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','Online');
});



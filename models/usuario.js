/**
 * Created by abrusutt on 11/01/2018.
 */
var mongoose = require('mongoose'); //Para crear modelos (objetos)
var uniqueValidator = require('mongoose-unique-validator'); //Para mejorar mensaje de validaciones unique

//Var ENUM para validar roles permitidos
var rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol permitido'
}

var Schema = mongoose.Schema;
var usuarioSchema = new Schema({
    "nombre" : { type: String, required: [true, 'El nombre es necesario'] },
    "email" : { type: String, unique: true, required: [true, 'El correo es necesario'] },
    "password" : { type: String, required: [true, 'La contraseña es necesaria'] },
    "img" : { type: String, required: false },
    "role" : { type: String, required: true, default:'USER_ROLE', enum:rolesValidos },
    "google" :{ type: Boolean, required: true, default:false }
});

//Mensaje de validacion para campos unicos
usuarioSchema.plugin( uniqueValidator, { message:'{PATH} debe de ser unico' } )

module.exports = mongoose.model('Usuario',usuarioSchema);

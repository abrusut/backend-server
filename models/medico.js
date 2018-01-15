/**
 * Created by abrusutt on 11/01/2018.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    nombre: {type: String, required: [true, 'El	nombre	es	necesario']},
    img: {type: String, required: false},
    usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El	id	hospital	es	un	campo	obligatorio']
    }
});

module.exports = mongoose.model('Medico', medicoSchema);

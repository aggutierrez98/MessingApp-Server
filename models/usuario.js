const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
	nombre: {
		type: String,
		required: true,
	},
	descripcion: {
		type: String,
		default: null,
	},
	imagen: {
		type: String,
		default: null,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	online: {
		type: Boolean,
		default: false,
	},
	hash: {
		type: Number,
		default: null,
	},
	active: {
		type: Boolean,
		default: false,
	},
	contactos: [
		{
			type: Schema.Types.ObjectId,
			ref: "Usuario",
		},
	],
	notificaciones: [
		{
			type: Schema.Types.ObjectId,
			ref: "Notificacion",
		},
	],
});

UsuarioSchema.method("toJSON", function () {
	const { __v, _id, password, ...object } = this.toObject();
	object.uid = _id;
	return object;
});

module.exports = model("Usuario", UsuarioSchema);

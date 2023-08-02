const { Schema, model } = require("mongoose");

const NotificacionSchema = Schema({
	de: {
		type: Schema.Types.ObjectId,
		ref: "Usuario",
	},
	time: {
		type: Date,
		default: new Date(),
	},
});

NotificacionSchema.method("toJSON", function () {
	const { __v, ...object } = this.toObject();
	return object;
});

module.exports = model("Notificacion", NotificacionSchema);

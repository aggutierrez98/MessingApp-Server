const Mensaje = require("../models/mensaje");
const Usuario = require("../models/usuario");

const obtenerChat = async (req, res) => {
	const uid = req.uid;
	const mensajesDe = req.params.de;

	const ultimos30Mensajes = await Mensaje.find({
		$or: [
			{ de: uid, para: mensajesDe },
			{ de: mensajesDe, para: uid },
		],
	})
		.sort({ createdAt: "asc" })
		.limit(30);

	res.json({
		ok: true,
		mensajes: ultimos30Mensajes,
	});
};

const obtenerUltimosMensajes = async (req, res) => {
	const { uid } = req;
	const ultimosMensajes = [];

	const [idUsuarios, mensajes] = await Promise.all([
		Usuario.find({ _id: { $ne: uid } }).distinct("_id"),
		Mensaje.find({
			$or: [{ de: uid }, { para: uid }],
		}),
	]);

	//Buscamos el ultimo mensaje por cada usuario
	for (const idUsuario of idUsuarios) {
		let mensajeMasReciente = {
			createdAt: new Date(1998, 11, 31),
		};

		for (const mensaje of mensajes) {
			if (
				mensaje.de.toString() === idUsuario.toString() ||
				mensaje.para.toString() === idUsuario.toString()
			) {
				if (
					mensaje.createdAt.getTime() > mensajeMasReciente.createdAt.getTime()
				) {
					mensajeMasReciente = mensaje;
				}
			}
		}

		//Pusehamos el ulitimo mensaje por cada idUsuario
		if (
			mensajeMasReciente.createdAt.getTime() ===
			new Date(1998, 11, 31).getTime()
		) {
			ultimosMensajes.push({
				mensaje: "Sin mensajes",
				fecha: null,
				contacto: idUsuario,
			});
		} else {
			ultimosMensajes.push({
				mensaje: mensajeMasReciente.mensaje,
				fecha: mensajeMasReciente.createdAt,
				contacto: idUsuario,
			});
		}
	}

	res.json({
		ok: true,
		ultimosMensajes,
	});
};

module.exports = {
	obtenerChat,
	obtenerUltimosMensajes,
};

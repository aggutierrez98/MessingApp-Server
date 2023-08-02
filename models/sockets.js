const {
	usuarioConectado,
	usuarioDesconectado,
	grabarMensaje,
	getMensajes,
	getUsuario,
} = require("../controllers/sockets");
const { comprobarJWT } = require("../helpers/jwt");

class Sockets {
	constructor(io) {
		this.io = io;
		this.socketEvents();
	}

	socketEvents() {
		// On connection
		this.io.on("connection", async (socket) => {
			const [valido, uid] = comprobarJWT(socket.handshake.query["x-token"]);

			if (!valido) {
				console.log("socket no identificado");
				return socket.disconnect();
			}

			await usuarioConectado(uid);

			//Unir al usuario a una sala de socket.io
			socket.join(uid);

			this.io.emit("usuario-conectado", uid);

			this.io.to(uid).emit("cargar-mensajes", await getMensajes(uid));

			// mensaje-personal
			socket.on("mensaje-personal", async (payload) => {
				const mensaje = await grabarMensaje(payload);

				this.io.to(payload.para).emit("mensaje-personal", mensaje);
				this.io.to(payload.de).emit("mensaje-usuario", mensaje);
			});

			socket.on("solicitud-contacto", ({ notificacion, para }) => {
				console.log("enviando solicitud de contacto");
				this.io.to(para).emit("envio-solicitud", notificacion);
			});

			socket.on("solicitud-aceptada", async ({ de, para }) => {
				const mensajesUsuario = await getMensajes(de);
				const mensajesContacto = await getMensajes(para);
				this.io.to(de).emit("cargar-mensajes", mensajesUsuario);
				this.io.to(para).emit("cargar-mensajes", mensajesContacto);

				const usuario = await getUsuario(de);
				const contacto = await getUsuario(para);

				this.io.to(para).emit("solicitud-aceptada", usuario);
				this.io.to(de).emit("solicitud-aceptada", contacto);
			});

			socket.on("solicitud-rechazada", async ({ de, para }) => {
				console.log("solicitud rechazada");
				const usuario = await getUsuario(de);
				this.io.to(para).emit("solicitud-rechazada", usuario);
			});

			socket.on("contacto-eliminado", async ({ de, para }) => {
				const usuario = await getUsuario(de);
				this.io.to(para).emit("contacto-eliminado", usuario);

				const mensajesUsuario = await getMensajes(de);
				const mensajesContacto = await getMensajes(para);
				this.io.to(de).emit("cargar-mensajes", mensajesUsuario);
				this.io.to(para).emit("cargar-mensajes", mensajesContacto);
			});

			socket.on("disconnect", async () => {
				await usuarioDesconectado(uid);
				this.io.emit("usuario-desconectado", uid);
			});
		});
	}
}

module.exports = Sockets;

// Servidor de Express
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");

const Sockets = require("./sockets");
const { dbConnection } = require("../database/config");
const fileUpload = require("express-fileupload");

class Server {
	constructor() {
		this.app = express();
		this.port = process.env.PORT;

		// Conectar a DB
		dbConnection();

		// Http server
		this.server = http.createServer(this.app);

		// Configuraciones de sockets
		this.io = socketio(this.server, {
			/* configuraciones */
		});
	}

	middlewares() {
		// CORS
		this.app.use(cors());

		// Parseo del body
		this.app.use(express.json());

		// Fileupload - Carga de archivos
		this.app.use(
			fileUpload({
				useTempFiles: true,
				tempFileDir: "/tmp/",
				createParentPath: true,
			}),
		);

		// API End Points
		this.app.use("/api/login", require("../router/auth"));
		this.app.use("/api/mensajes", require("../router/mensajes"));
	}

	// Esta configuración se puede tener aquí o como propieda de clase
	// depende mucho de lo que necesites
	configurarSockets() {
		new Sockets(this.io);
	}

	execute() {
		// Inicializar Middlewares
		this.middlewares();

		// Inicializar sockets
		this.configurarSockets();

		// Inicializar Server
		this.server.listen(this.port, () => {
			console.log("Server corriendo en puerto:", this.port);
		});
	}
}

module.exports = Server;

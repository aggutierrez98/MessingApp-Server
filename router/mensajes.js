/*
    Path: api/mensajes
*/

const { Router } = require("express");
const {
	obtenerChat,
	obtenerUltimosMensajes,
} = require("../controllers/mensajes");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.get("/:de", validarJWT, obtenerChat);
router.get("/", validarJWT, obtenerUltimosMensajes);

module.exports = router;

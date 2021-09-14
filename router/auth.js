/*  
    path: api/login
*/
const { Router } = require('express');
const { check } = require('express-validator');

// Controladores
const { login, renewToken, editarUsuario, crearUsuario, confirmarEmail, reenviarEmail, agregarContacto, eliminarContacto, mostrarUsuarios, agregarNotificacion, eliminarNotificacion } = require('../controllers/auth');
const { existeUsuario, existeUsuarioPorEmail } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const router = Router();

router.get("/users/:email", [
    validarJWT
], mostrarUsuarios)

// Crear nuevos usuarios
router.post('/new', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check("email").custom(existeUsuarioPorEmail),
    validarCampos
], crearUsuario);

router.post("/re-send-verify", [], reenviarEmail)

router.get("/verify/:id", [], confirmarEmail)

// Login
router.post('/', [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validarCampos
], login);

router.put('/edit/:id', [
    // check("id", "El id debe ser mongo valido").isMongoId(),
    // check("id").custom(existeUsuario),
    // check("descripcion", "La descripcion debe ser string").isString(),
    validarCampos
], editarUsuario);

router.put("/contacts/:id", [
    validarJWT,
    check("id", "El id debe ser mongo valido").isMongoId(),
    check("id").custom(existeUsuario),
    validarCampos,
], agregarContacto);

router.delete("/contacts/:id", [
    validarJWT,
    check("id", "El id debe ser mongo valido").isMongoId(),
    check("id").custom(existeUsuario),
    validarCampos
], eliminarContacto);

// Revalidar Token
router.get('/renew', validarJWT, renewToken);

//Nueva solicitud de contacto
router.post("/contacts/notification", [
    validarJWT
], agregarNotificacion)

//Nueva solicitud de contacto
router.delete("/contacts/notification/:id", [
    validarJWT
], eliminarNotificacion)


module.exports = router;
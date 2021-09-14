const Usuario = require("../models/usuario");

const existeUsuario = async (id) => {

    const existeUsuario = await Usuario.findById(id);

    if (!existeUsuario) {
        throw new Error("El id ingresado no esta registrado en la db")
    }
}

const existeUsuarioPorEmail = async (email) => {

    // verificar que el email no exista
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
        throw new Error("El correo ingresado ya se encuentra registrado")
    }
}

module.exports = {
    existeUsuario,
    existeUsuarioPorEmail
}
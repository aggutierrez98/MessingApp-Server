const Usuario = require('../models/usuario');
const Mensaje = require('../models/mensaje');

const usuarioConectado = async (uid) => {

    const usuario = await Usuario.findById(uid);
    usuario.online = true;
    await usuario.save();

    return usuario;
};

const usuarioDesconectado = async (uid) => {

    const usuario = await Usuario.findById(uid);
    usuario.online = false;
    await usuario.save();

    return usuario;

};

const getUsuarios = async () => {
    const usuarios = await Usuario
        .find()
        .sort("-online");

    return usuarios;
};

const getUsuario = async (id) => {
    const usuario = await Usuario.findById(id);

    return usuario;
}

const grabarMensaje = async (payload) => {

    try {
        const mensaje = new Mensaje(payload);

        await mensaje.save();

        return mensaje;

    } catch (error) {
        console.log(error);
        return false;
    }
}

const getMensajes = async (uid) => {

    const usuario = await Usuario.findById(uid);

    const mensajes = await Mensaje.find({
        $or: [
            { de: uid },
            { para: uid },
        ]
    })

    const contactos = usuario.contactos;

    // console.log(contactos);

    let mensajesPorContacto = [];

    for (contacto of contactos) {

        let mensajeMasReciente = {
            createdAt: new Date(1998, 11, 31)
        };

        let ultimoMensaje = {};
        let mensajesContacto = [];

        for (mensaje of mensajes) {
            if (mensaje.de.toString() === contacto.toString() || mensaje.para.toString() === contacto.toString()) {
                mensajesContacto.push(mensaje)
                if (mensaje.createdAt.getTime() > mensajeMasReciente.createdAt.getTime()) {
                    mensajeMasReciente = mensaje;
                }
            }
        }

        if (mensajeMasReciente.createdAt.getTime() === (new Date(1998, 11, 31).getTime())) {
            ultimoMensaje = {
                mensaje: "Sin mensajes",
                fecha: null,
                contacto
            }
        } else {
            ultimoMensaje = {
                mensaje: mensajeMasReciente.mensaje,
                fecha: mensajeMasReciente.createdAt,
                contacto
            };
        }

        mensajesPorContacto.push({
            contacto,
            mensajesContacto,
            ultimoMensaje,
            nuevosMensajes: 0
        })

    }
    return {
        mensajesPorContacto,
        // ultimosMensajes
    };
}

module.exports = {
    usuarioConectado,
    usuarioDesconectado,
    getUsuarios,
    getUsuario,
    grabarMensaje,
    getMensajes
}
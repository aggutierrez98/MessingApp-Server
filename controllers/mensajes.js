const Mensaje = require('../models/mensaje');
const Usuario = require('../models/usuario');

const obtenerChat = async (req, res) => {

    const miId = req.uid;
    const mensajesDe = req.params.de;

    const last30 = await Mensaje.find({
        $or: [
            { de: miId, para: mensajesDe },
            { de: mensajesDe, para: miId },
        ]
    }).sort({ createdAt: 'asc' })
        .limit(30);

    res.json({
        ok: true,
        mensajes: last30
    });


}

const obtenerUltimosMensajes = async (req, res) => {
    const miId = req.uid;
    let ultimosMensajes = [];

    const mensajes = await Mensaje.find({
        $or: [
            { de: miId },
            { para: miId },
        ]
    });

    //Buscamos todos los id de los usuarios
    const idUsuarios = (await Usuario.find()).filter(usuario => usuario._id != miId).map(usuario => usuario._id.toString())

    //Buscamos el ultimo mensaje por cada usuario
    for (usuario of idUsuarios) {

        let mensajeMasReciente = {
            createdAt: new Date(1998, 11, 31)
        };

        for (mensaje of mensajes) {
            if (mensaje.de.toString() === usuario || mensaje.para.toString() === usuario) {
                if (mensaje.createdAt.getTime() > mensajeMasReciente.createdAt.getTime()) {
                    mensajeMasReciente = mensaje;
                }
            }
        }

        //Pusehamos el ulitimo mensaje por cada usuario
        if (mensajeMasReciente.createdAt.getTime() === (new Date(1998, 11, 31).getTime())) {
            ultimosMensajes.push({
                mensaje: "Sin mensajes",
                fecha: null,
                contacto: usuario,
            })
        } else {
            ultimosMensajes.push({
                mensaje: mensajeMasReciente.mensaje,
                fecha: mensajeMasReciente.createdAt,
                contacto: usuario,
            });
        }
    }

    res.json({
        ok: true,
        ultimosMensajes
    })
}

module.exports = {
    obtenerChat,
    obtenerUltimosMensajes
}
const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const Notificacion = require('../models/notificacion');
const { generarJWT } = require('../helpers/jwt');
const { transporter } = require('../helpers/nodemailer-config');
const cloudinary = require('cloudinary').v2;

const crearUsuario = async (req, res = response) => {

    const { nombre, email, password } = req.body;

    try {

        const usuario = new Usuario(req.body);

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        hash = Math.floor((Math.random() * 100) + 54);
        usuario.hash = hash;

        // Guardar usuario en BD
        await usuario.save();

        const clientHost = process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "http://localhost:3000"
        const url = `${clientHost}/auth/register/confirmation/${hash}`;

        const mailOptions = {
            from: "agustinnodeprueba@gmail.com",
            to: email,
            subject: "MESSING-APP Confirmacion de email ",
            html: `
                <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
                <tr height="200px">  
                    <td bgcolor="" width="600px">
                        <h1 style="color: #fff; text-align:center">Mensaje de confirmacion de email</h1>
                        <p  style="color: #fff; text-align:center">
                            <span style="color: #e84393">${nombre}</span> 
                            <br></br>
    
                            Pulsa <a href="${url}">aquí</a> para activar tu cuenta

                        </p>
                    </td>
                </tr>
                <tr bgcolor="#fff">
                    <td style="text-align:center">
                        <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                    </td>
                </tr>
                </table>
            
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({
                    ok: false,
                    msg: "Error al enviar el email"
                });
            } else {
                console.log(`Email de confirmacion enviado a: ${email}`);
                res.status(200).json({
                    ok: true,
                });
            }

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}


const reenviarEmail = async (req, res = response) => {

    const { email } = req.body;

    try {

        const { hash, nombre } = await Usuario.findOne({ email });

        const clientHost = process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "http://localhost:3000"
        const url = `${clientHost}/auth/register/confirmation/${hash}`;

        const mailOptions = {
            from: "agustinnodeprueba@gmail.com",
            to: email,
            subject: "MESSING-APP Confirmacion de email ",
            html: `
                <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
                <tr height="200px">  
                    <td bgcolor="" width="600px">
                        <h1 style="color: #fff; text-align:center">Mensaje de confirmacion de email</h1>
                        <p  style="color: #fff; text-align:center">
                            <span style="color: #e84393">${nombre}</span> 
                            <br></br>
    
                            Pulsa <a href="${url}">aquí</a> para activar tu cuenta

                        </p>
                    </td>
                </tr>
                <tr bgcolor="#fff">
                    <td style="text-align:center">
                        <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                    </td>
                </tr>
                </table>
            
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({
                    ok: false,
                    msg: "Error al enviar el email"
                });
            } else {
                console.log(`Email de confirmacion enviado a: ${email}`);
                res.status(200).json({
                    ok: true
                });
            }

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const confirmarEmail = async (req, res) => {

    const { id } = req.params;

    try {
        const hashExiste = await Usuario.findOne({ hash: id });

        if (hashExiste) {

            const usuario = await Usuario.findByIdAndUpdate(hashExiste._id, { active: true, hash: null })

            res.status(202).json({
                ok: true,
                usuario
            })

        } else {

            res.status(401).json({
                ok: false,
                msg: 'Fallo al verificar email'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const editarUsuario = async (req, res = response) => {

    try {
        const id = req.params.id;
        const { descripcion, nombre } = req.body;
        const imagen = req.files?.imagen;

        if (nombre) {
            await Usuario.findByIdAndUpdate(id, { nombre });
            res.json({
                ok: true,
            });
        }
        else if (descripcion) {
            await Usuario.findByIdAndUpdate(id, { descripcion });
            res.json({
                ok: true,
            });
        }
        else if (imagen) {

            const usuario = await Usuario.findById(id);

            // Limpiar imágenes previas
            if (usuario.imagen) {
                const nombreArr = usuario.imagen.split('/');
                const nombre = nombreArr[nombreArr.length - 1];
                const [public_id] = nombre.split(".");
                cloudinary.uploader.destroy(public_id);
            }

            const { tempFilePath } = imagen;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

            usuario.imagen = secure_url;

            await usuario.save();

            res.json({
                ok: true,
                imagen: usuario.imagen
            });

        } else {
            res.status(400).json({
                ok: false,
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}



// login
const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        // Verificar si existe el correo
        let usuarioDB = await Usuario.findOne({ email })
            .populate("contactos", ["nombre", "email", "descripcion", "imagen", "online"])
            .populate({
                path: 'notificaciones',
                populate: [
                    { path: 'de' },
                ],
            });


        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'El email no se encuentra registrado'
            });
        }

        if (usuarioDB.active === false) {
            return res.status(401).json({
                ok: false,
                msg: 'Error al ingresar. Por favor confirmar email'
            });
        }

        // Validar el password
        const validPassword = bcrypt.compareSync(password, usuarioDB.password);
        if (!validPassword) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuarioDB.id);

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}


// renewToken
const renewToken = async (req, res) => {

    const uid = req.uid;

    try {

        // Generar un nuevo JWT
        const token = await generarJWT(uid);

        // Obtener el usuario por UID
        const usuario = await Usuario.findById(uid)
            .populate("contactos", ["nombre", "email", "descripcion", "imagen", "online"])
            .populate({
                path: 'notificaciones',
                populate: [
                    { path: 'de' },
                ],
            });

        res.json({
            ok: true,
            usuario,
            token,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}


const agregarContacto = async (req, res) => {

    const cid = req.body.id;
    const uid = req.params.id;

    try {

        const usuario = await Usuario.findById(uid);
        const contacto = await Usuario.findById(cid);

        usuario.contactos = [...usuario.contactos, contacto._id];

        await usuario.save();

        res.json({
            ok: true,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const eliminarContacto = async (req, res) => {
    const cid = req.body.id;
    const uid = req.params.id;

    try {

        const usuario = await Usuario.findById(uid);

        usuario.contactos = usuario.contactos.filter((contacto) => contacto._id.toString() !== cid.toString());

        await usuario.save();

        res.json({
            ok: true,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const mostrarUsuarios = async (req, res) => {
    const uid = req.uid;

    const { email } = req.params;
    // const regexp = new RegExp(termino, "i");

    try {

        const { contactos } = await Usuario.findById(uid);
        const usuarios = await Usuario.find();

        const usuariosRestantes = usuarios.filter((usuario) => {
            if (!contactos.includes(usuario._id) && uid !== usuario._id.toString()) {
                return usuario
            }
        });

        const usuariosEncontrados = usuariosRestantes.filter(usuario => {
            if (usuario.email.includes(email)) {
                return usuario
            }
        })

        res.json({
            ok: true,
            usuarios: usuariosEncontrados,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const agregarNotificacion = async (req, res) => {
    const { para, ...body } = req.body


    try {

        const notificacionCreada = new Notificacion(body)

        await notificacionCreada.save();

        const usuario = await Usuario.findById(para);

        usuario.notificaciones = [notificacionCreada._id, ...usuario.notificaciones]

        await usuario.save();

        const notificacion = await Notificacion.findById(notificacionCreada._id).populate("de")

        res.json({
            notificacion,
            ok: true,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const eliminarNotificacion = async (req, res) => {
    const uid = req.uid;
    const id = req.params.id;

    try {
        const usuario = await Usuario.findById(uid);

        usuario.notificaciones = usuario.notificaciones.filter(notificacion => notificacion._id.toString() !== id.toString())

        await Notificacion.findByIdAndDelete(id)

        await usuario.save();

        res.json({
            ok: true,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}


module.exports = {
    login,
    renewToken,
    editarUsuario,
    confirmarEmail,
    crearUsuario,
    reenviarEmail,
    agregarContacto,
    eliminarContacto,
    mostrarUsuarios,
    agregarNotificacion,
    eliminarNotificacion
}

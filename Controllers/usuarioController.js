const usuarioRepository = require('../repositories/usuarioRepository');



exports.login = async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;

    try {
        const usuario = await usuarioRepository.getUsuarioByUsername(nombre_usuario);
        if (!usuario || usuario.contraseña !== contraseña) {
            return res.status(401).json({ message: 'Usuario y/o Contraseña son inválidos' });
        }
        res.json({ message: 'Inicio de sesión exitoso', nombre_usuario: usuario.nombre_usuario });
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).send('Error al obtener el usuario');
    }
};
exports.registrar = async (req, res) => {
    const { nombre_completo, nombre_usuario, contraseña } = req.body;

    try {
        await usuarioRepository.createUsuario(nombre_completo, nombre_usuario, contraseña);
        res.json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error('Error al registrar el usuario:', err);
        res.status(500).send('Error al registrar el usuario');
    }
};


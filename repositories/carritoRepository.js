const dbConnection = require('../api/db');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = dbConnection;
    }

    return connection;
}

exports.getItemsByCarritoId = async (carrito_id) => {
    const conn = await getConnection();
    return new Promise((resolve, reject) =>
        conn.query('SELECT * FROM items_carrito WHERE carrito_id = ?', [carrito_id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        })
    );
}

exports.getUsuarioByUsername = async (nombre_usuario) => {
    const conn = await getConnection();
    return new Promise((resolve, reject) =>
        conn.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]);
        })
    );
}
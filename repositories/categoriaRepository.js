const dbConnection = require('../api/db');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = dbConnection;
    }

    return connection;
}

const updateCategoria = async (id, categoria) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('UPDATE categorias SET nombre = ? WHERE id = ?', [categoria.nombre, id]);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {  
    updateCategoria
};
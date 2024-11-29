const dbConnection = require('../api/db');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = dbConnection;
    }

    return connection;
}


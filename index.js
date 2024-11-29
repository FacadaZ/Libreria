const express = require('express');
const db = require('./api/db');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');


app.use(cors());
app.use(express.json());



const userRouter = require('./routes/usuarioRouter');
const categoriaRouter = require('./routes/categoriaRouter');
const carritoRouter = require('./routes/carritoRouter');
const listadoRouter = require('./routes/listadoRouter');


app.use('/api/usuario', userRouter);
app.use('/api/categoria', categoriaRouter); 
app.use('/carrito', carritoRouter);
app.use('/api', listadoRouter);

// =======================================================  recupera password  ================================================================

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
        user: '7fc3960698e0f4',
        pass: '0368fa5c8921bb'
    }
});

app.post('/recuperar', (req, res) => {
    const { nombre_usuario } = req.body;

    db.query('SELECT id FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], (err, result) => {
        if (err) {
            console.error('Error al verificar el nombre de usuario:', err);
            res.status(500).send('Error al verificar el nombre de usuario');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Nombre de usuario no encontrado');
            return;
        }

        const userId = result[0].id;
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 30000;  

        db.query('INSERT INTO password_resets (user_id, token, expires) VALUES (?, ?, ?)', [userId, token, expires], (err, result) => {
            if (err) {
                console.error('Error al crear la solicitud de recuperación de contraseña:', err);
                res.status(500).send('Error al crear la solicitud de recuperación de contraseña');
                return;
            }

            const mailOptions = {
                from: 'no-reply@example.com',
                to: nombre_usuario,
                subject: 'Codigo apra recuperar contraseña',
                text: `ingresa este token para resptableser tu contraselña: ${token}`
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo electrónico:', err);
                    res.status(500).send('Error al enviar el correo electrónico');
                    return;
                }

                res.json({ message: 'Correo electrónico de recuperación enviado' });
            });
        });
    });
});

app.post('/verificar-codigo', (req, res) => {
    const { token } = req.body;

    db.query('SELECT user_id, expires FROM password_resets WHERE token = ?', [token], (err, result) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            res.status(500).send('Error al verificar el token');
            return;
        }

        if (result.length === 0 || result[0].expires < Date.now()) {
            res.status(400).send('Token inválido o expirado');
            return;
        }

        res.json({ message: 'Código verificado correctamente', userId: result[0].user_id });
    });
});

app.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    db.query('SELECT user_id, expires FROM password_resets WHERE token = ?', [token], (err, result) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            res.status(500).send('Error al verificar el token');
            return;
        }

        if (result.length === 0 || result[0].expires < Date.now()) {
            res.status(400).send('Token inválido o expirado');
            return;
        }

        const userId = result[0].user_id;

        db.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [newPassword, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                res.status(500).send('Error al actualizar la contraseña');
                return;
            }

            db.query('DELETE FROM password_resets WHERE token = ?', [token], (err, result) => {
                if (err) {
                    console.error('Error al eliminar la solicitud de recuperación de contraseña:', err);
                    res.status(500).send('Error al eliminar la solicitud de recuperación de contraseña');
                    return;
                }

                res.json({ message: 'Contraseña actualizada correctamente' });
            });
        });
    });
});


// =======================================================  enviar comprovante ================================================================
// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'image/comprovantes'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Servir archivos estáticos desde la carpeta 'image'
app.use('/image', express.static(path.join(__dirname, 'image')));

// Endpoint para agregar un comprobante de pago con imagen
app.post('/comprobantes_pago', upload.single('ruta_comprobante'), (req, res) => {
    const { pedido_id } = req.body;
    const ruta_comprobante = `/image/comprovantes/${req.file.filename}`;

    if (!pedido_id || !ruta_comprobante) {
        return res.status(400).json({ error: 'Pedido ID y ruta del comprobante son requeridos' });
    }

    const query = 'INSERT INTO comprobantes_pago (pedido_id, ruta_comprobante) VALUES (?, ?)';
    db.query(query, [pedido_id, ruta_comprobante], (err, result) => {
        if (err) {
            console.error('Error al insertar el comprobante de pago:', err);
            return res.status(500).json({ error: 'Error al insertar el comprobante de pago' });
        }
        res.status(201).json({ message: 'Comprobante de pago agregado exitosamente', id: result.insertId });
    });
});

app.get('/comprobantes_pago/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM comprobantes_pago WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el comprobante de pago:', err);
            res.status(500).send('Error al obtener el comprobante de pago');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Comprobante de pago no encontrado');
            return;
        }

        const comprobante = result[0];
        comprobante.ruta_comprobante = `${req.protocol}://${req.get('host')}${comprobante.ruta_comprobante}`;
        res.json(comprobante);
    });
});

// =======================================================  usuarios  ================================================================
//http://localhost:3000/usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            res.status(500).send('Error al obtener los usuarios');
            return;
        }
        res.json(result);
    });
});

//http://localhost:3000/login
app.post('/login', (req, res) => {
    const { nombre_usuario, contraseña } = req.body;
    db.query('SELECT * FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?', [nombre_usuario, contraseña], (err, result) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            res.status(500).send('Error al obtener el usuario');
            return;
        }
        if (result.length === 0) {
            res.status(401).json({ message: 'Usuario y/o Contraseña son inválidos' });
            return;
        }
        const usuario = result[0];
        res.json({ message: 'Inicio de sesión exitosos', nombre_usuario: usuario.nombre_usuario, rol: usuario.rol });
    });
});

app.post('/registrar', (req, res) => {
    const { nombre_completo, nombre_usuario, contraseña, rol } = req.body;
    console.log('Datos recibidos:', { nombre_completo, nombre_usuario, contraseña, rol }); // Verificar los datos recibidos
    db.query('INSERT INTO usuarios (nombre_completo, nombre_usuario, contraseña, rol) VALUES (?, ?, ?, ?)', [nombre_completo, nombre_usuario, contraseña, rol], (err, result) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            res.status(500).send('Error al registrar el usuario');
            return;
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
});

// Obtener el id del usuario a partir del nombre de usuario
app.get('/usuario/:username', (req, res) => {
    const { username } = req.params;

    db.query('SELECT id FROM usuarios WHERE nombre_usuario = ?', [username], (err, result) => {
        if (err) {
            console.error('Error al obtener el id del usuario:', err);
            res.status(500).send('Error al obtener el id del usuario');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Usuario no encontrado');
            return;
        }

        res.json({ id: result[0].id });
    });
});

// =======================================================  Categorias  ================================================================
//http://localhost:3000/categorias
app.get('/categorias', (req, res) => {
    db.query('SELECT * FROM categorias', (err, result) => {
        if (err) {
            console.error('Error al obtener las categorias:', err);
            res.status(500).send('Error al obtener las categorias');
            return;
        }
        res.json(result);
    });
});

//http://localhost:3000/addCategorias
app.post('/addCategorias', (req, res) => {
    
    const { nombre } = req.body;
    db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre], (err, result) => {
        if (err) {
            console.error('Error al crear la categoria:', err);
            res.status(500).send('Error al crear la categoria');
            return;
        }
        res.status(201).json({ message: 'Categoria creada exitosamente', id: result.insertId });
    });
});

//http://localhost:3000/categorias/1
app.get('/categorias/:id', (req, res) => {
    const categoriaId = req.params.id;
    db.query('SELECT * FROM categorias WHERE id = ?', [categoriaId], (err, result) => {
        if (err) {
            console.error('Error al obtener la categoria:', err);
            res.status(500).send('Error al obtener la categoria');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Categoria no encontrada');
            return;
        }
        res.json(result[0]);
    });
});

//http://localhost:3000/categorias/1
app.put('/categorias/:id', (req, res) => {
    const categoriaId = req.params.id;
    const { nombre } = req.body;
    db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, categoriaId], (err, result) => {
        if (err) {
            console.error('Error al actualizar la categoria:', err);
            res.status(500).send('Error al actualizar la categoria');
            return;
        }
        res.json({ message: 'Categoria actualizada exitosamente' });
    });
});

//http://localhost:3000/categorias/1
app.delete('/categorias/:id', (req, res) => {
    const categoriaId = req.params.id;
    db.query('DELETE FROM categorias WHERE id = ?', [categoriaId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la categoria:', err);
            res.status(500).send('Error al eliminar la categoria');
            return;
        }
        res.json({ message: 'Categoria eliminada exitosamente' });
    });
});

//http://localhost:3000/categorias/1/productos
app.get('/categorias/:id/productos', (req, res) => {
    const categoriaId = req.params.id;
    db.query('SELECT * FROM productos WHERE categoria_id = ?', [categoriaId], (err, result) => {
        if (err) {
            console.error('Error al obtener los productos de la categoria:', err);
            res.status(500).send('Error al obtener los productos de la categoria');
            return;
        }
        res.json(result);
    });
});

// =======================================================  producto  ================================================================

//http://localhost:3000/productos
app.get('/productos', (req, res) => {
    const categoria = req.query.categoria;
    let query = 'SELECT * FROM productos';
    const params = [];

    if (categoria) {
        query += ' WHERE categoria_id = (SELECT id FROM categorias WHERE nombre = ?)';
        params.push(categoria);
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).send('Error al obtener los productos');
            return;
        }
        res.json(result);
    });
});
// http://localhost:3000/addProductos
app.post('/addProductos', (req, res) => {
    const { nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url } = req.body;
    db.query('INSERT INTO productos (nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url], (err, result) => {
        if (err) {
            console.error('Error al crear el producto:', err);
            res.status(500).send('Error al crear el producto');
            return;
        }
        res.status(201).json({ message: 'Producto creado exitosamente', id: result.insertId });
    });
});

//http://localhost:3000/productos/1
app.get('/productos/:id', (req, res) => {
    const productoId = req.params.id;

    db.query('SELECT * FROM productos WHERE id = ?', [productoId], (err, result) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            res.status(500).send('Error al obtener el producto');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Producto no encontrado');
            return;
        }

        res.json(result[0]);
    });
});

//http://localhost:3000/productos/1
app.put('/productos/:id', (req, res) => {
    const productoId = req.params.id;
    const { nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url } = req.body;
    
    db.query('UPDATE productos SET nombre = ?, autor = ?, año = ?, sinopsis = ?, precio = ?, cantidad = ?, categoria_id = ?, imagen_url = ? WHERE id = ?', [nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url, productoId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            res.status(500).send('Error al actualizar el producto');
            return;
        }

        res.json({ message: 'Producto actualizado exitosamente' });
    }
    );
});


//http://localhost:3000/productos/1
app.delete('/productos/:id', (req, res) => {
    const productoId = req.params.id;

    db.query('DELETE FROM productos WHERE id = ?', [productoId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            res.status(500).send('Error al eliminar el producto');
            return;
        }

        res.json({ message: 'Producto eliminado exitosamente' });
    });
}
);

// =======================================================  Carrito  ================================================================
let carrito = [];

//http://localhost:3000/carrito
app.get('/carrito', (req, res) => {
    res.json(carrito);
});

// http://localhost:3000/iniciar-compra
//crea el "carrito_id"
app.post('/iniciar-compra', (req, res) => {
    const { usuario_id } = req.body;

    db.query('SELECT id FROM carritos_compras WHERE usuario_id = ?', [usuario_id], (err, result) => {
        if (err) {
            console.error('Error al verificar el carrito del usuario:', err);
            res.status(500).send('Error al verificar el carrito del usuario');
            return;
        }

        if (result.length > 0) {
            // El usuario ya tiene un carrito
            res.json({ carrito_id: result[0].id });
        } else {
            // Crear un nuevo carrito para el usuario
            db.query('INSERT INTO carritos_compras (usuario_id) VALUES (?)', [usuario_id], (err, result) => {
                if (err) {
                    console.error('Error al crear el carrito del usuario:', err);
                    res.status(500).send('Error al crear el carrito del usuario');
                    return;
                }

                res.json({ carrito_id: result.insertId });
            });
        }
    });
});
//http://localhost:3000/addcarrito
//agrega un producto al carrito_id 
app.post('/addcarrito', (req, res) => {
    const { carrito_id, producto_id, cantidad } = req.body;

    db.query('SELECT cantidad FROM productos WHERE id = ?', [producto_id], (err, result) => {
        if (err) {
            console.error('Error al verificar el stock del producto:', err);
            res.status(500).send('Error al verificar el stock del producto');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Producto no encontrado');
            return;
        }

        const stockActual = result[0].cantidad;

        if (stockActual < cantidad) {
            res.status(400).send('Stock insuficiente');
            return;
        }

        db.query('INSERT INTO items_carrito (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)', [carrito_id, producto_id, cantidad], (err, result) => {
            if (err) {
                console.error('Error al agregar el producto al carrito:', err);
                res.status(500).send('Error al agregar el producto al carrito');
                return;
            }

            res.json({ message: 'Producto agregado al carrito' });
        });
    });
});

// http://localhost:3000/ObtenerCarritoId/:carrito_id
app.get('/carrito/ObtenerCarritoId/:carrito_id', (req, res) => {
    const { carrito_id } = req.params;

    db.query(`
        SELECT ic.id, ic.carrito_id, ic.producto_id, ic.cantidad, ic.creado_en, p.nombre, p.precio, p.imagen_url
        FROM items_carrito ic
        JOIN productos p ON ic.producto_id = p.id
        WHERE ic.carrito_id = ?
    `, [carrito_id], (err, result) => {
        if (err) {
            console.error('Error al obtener los productos del carrito:', err);
            res.status(500).send('Error al obtener los productos del carrito');
            return;
        }

        res.json(result);
    });
});


// http://localhost:3000/carrito/:id
app.delete('/carrito/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM items_carrito WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al buscar el producto en el carrito:', err);
            res.status(500).send('Error al buscar el producto en el carrito');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('Producto no encontrado en el carrito');
            return;
        }

        const productoEliminado = result[0];

        db.query('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?', [productoEliminado.cantidad, productoEliminado.producto_id], (err, result) => {
            if (err) {
                console.error('Error al devolver el stock del producto:', err);
                res.status(500).send('Error al devolver el stock del producto');
                return;
            }

            db.query('DELETE FROM items_carrito WHERE id = ?', [id], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el producto del carrito:', err);
                    res.status(500).send('Error al eliminar el producto del carrito');
                    return;
                }

                res.json({ message: 'Producto eliminado del carrito' });
            });
        });
    });
});

// http://localhost:3000/deletecarrito
app.delete('/deletecarrito', (req, res) => {
    const { carrito_id } = req.body;

    db.query('SELECT * FROM items_carrito WHERE carrito_id = ?', [carrito_id], (err, productos) => {
        if (err) {
            console.error('Error al buscar los productos en el carrito:', err);
            res.status(500).send('Error al buscar los productos en el carrito');
            return;
        }

        if (productos.length === 0) {
            res.status(404).send('No hay productos en el carrito');
            return;
        }

        productos.forEach(producto => {
            db.query('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?', [producto.cantidad, producto.producto_id], (err, result) => {
                if (err) {
                    console.error('Error al devolver el stock del producto:', err);
                }
            });
        });

        db.query('DELETE FROM items_carrito WHERE carrito_id = ?', [carrito_id], (err, result) => {
            if (err) {
                console.error('Error al vaciar el carrito:', err);
                res.status(500).send('Error al vaciar el carrito');
                return;
            }

            res.json({ message: 'Carrito vaciado' });
        });
    });
});

// =======================================================  finaizands compra   ================================================================
//http://localhost:3000/checkout
app.post('/checkout', (req, res) => {
    const { carrito_id, direccion_envio, usuario_id } = req.body;

    console.log('Datos recibidos:', { carrito_id, direccion_envio, usuario_id });

    if (!carrito_id) {
        res.status(400).send('No se encontró el carrito_id');
        return;
    }

    const query = `
        SELECT ic.id, ic.carrito_id, ic.producto_id, ic.cantidad, ic.creado_en, p.precio AS precio_unitario
        FROM items_carrito ic
        JOIN productos p ON ic.producto_id = p.id
        WHERE ic.carrito_id = ?
    `;

    db.query(query, [carrito_id], (err, items) => {
        if (err) {
            console.error('Error al obtener los items del carrito:', err);
            res.status(500).send('Error al obtener los items del carrito');
            return;
        }

        console.log('Items del carrito:', items);

        if (items.length === 0) {
            res.status(400).send('El carrito está vacío');
            return;
        }

        let total = 0;
        for (const item of items) {
            const cantidad = parseFloat(item.cantidad);
            const precio_unitario = parseFloat(item.precio_unitario);
            if (isNaN(cantidad) || isNaN(precio_unitario)) {
                console.error('Cantidad o precio unitario inválido:', { cantidad, precio_unitario });
                res.status(400).send('Cantidad o precio unitario inválido');
                return;
            }
            total += cantidad * precio_unitario;
        }

        console.log('Total del pedido:', total);

        db.query('INSERT INTO pedidos (usuario_id, total, direccion_envio) VALUES (?, ?, ?)', [usuario_id, total, direccion_envio], (err, result) => {
            if (err) {
                console.error('Error al insertar el pedido:', err);
                res.status(500).send('Error al insertar el pedido');
                return;
            }

            const pedido_id = result.insertId;
            console.log('Pedido insertado con ID:', pedido_id);

            const detalles = items.map(item => [pedido_id, item.producto_id, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]);
            db.query('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ?', [detalles], (err, result) => {
                if (err) {
                    console.error('Error al insertar los detalles del pedido:', err);
                    res.status(500).send('Error al insertar los detalles del pedido');
                    return;
                }

                console.log('Detalles del pedido insertados:', detalles);

                // Descontar el stock de los productos
                const updateStockQueries = items.map(item => {
                    return new Promise((resolve, reject) => {
                        db.query('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?', [item.cantidad, item.producto_id], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    });
                });

                Promise.all(updateStockQueries)
                    .then(() => {
                        db.query('DELETE FROM items_carrito WHERE carrito_id = ?', [carrito_id], (err, result) => {
                            if (err) {
                                console.error('Error al limpiar el carrito:', err);
                                res.status(500).send('Error al limpiar el carrito');
                                return;
                            }

                            console.log('Carrito limpiado');
                            res.json({ message: 'Compra finalizada con éxito', pedido_id });
                        });
                    })
                    .catch(err => {
                        console.error('Error al actualizar el stock:', err);
                        res.status(500).send('Error al actualizar el stock');
                    });
            });
        });
    });
});
// =======================================================  listar pedidos   ================================================================
// Endpoint para obtener los detalles de los pedidos
app.get('/api/pedidos', (req, res) => {
    const query = `
        SELECT p.id AS pedido_id, u.nombre_usuario AS cliente, pr.nombre AS producto, dp.cantidad, dp.subtotal, p.estado_pedido, cp.ruta_comprobante
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN detalles_pedido dp ON p.id = dp.pedido_id
        JOIN productos pr ON dp.producto_id = pr.id
        LEFT JOIN comprobantes_pago cp ON p.id = cp.pedido_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err);
            res.status(500).send(`Error al obtener los pedidos: ${err.message}`);
            return;
        }
        res.json(results);
    });
});

//http://localhost:3000/api/pedidos/1
app.put('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { estado_pedido } = req.body;

    if (!estado_pedido) {
        res.status(400).send('El estado del pedido es requerido');
        return;
    }

    db.query('UPDATE pedidos SET estado_pedido = ? WHERE id = ?', [estado_pedido, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del pedido:', err);
            res.status(500).send(`Error al actualizar el estado del pedido: ${err.message}`);
            return;
        }
        res.json({ id, estado_pedido });
    });
});

// =======================================================  search   ================================================================

// http://localhost:3000/search/la
app.get('/search/:nombre', (req, res) => {
    const { nombre } = req.params;
    db.query('SELECT * FROM productos WHERE nombre LIKE ?', [`%${nombre}%`], (err, result) => {
        if (err) {
            console.error('Error al buscar los productos:', err);
            res.status(500).send('Error al buscar los productos');
            return;
        }
        res.json(result);
    });
});


/*// =======================================================  no tiene esto   ================================================================
app.post('/productos/:id/incrementar-visualizaciones', (req, res) => {
    const libroId = req.params.id;
    const query = 'UPDATE productos SET visualizaciones = visualizaciones + 1 WHERE id = ?';

    connection.query(query, [libroId], (error, results) => {
        if (error) {
            console.error('Error al incrementar las visualizaciones:', error);
            res.status(500).send('Error al incrementar las visualizaciones');
        } else {
            res.status(200).send('Visualizaciones incrementadas');
        }
    });
});

// Ruta para obtener los libros más buscados
app.get('/productos/mas-buscados', (req, res) => {
    const query = 'SELECT * FROM productos ORDER BY visualizaciones DESC LIMIT 10';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener los libros más buscados:', error);
            res.status(500).send('Error al obtener los libros más buscados');
        } else {
            res.json(results);
        }
    });
});*/

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



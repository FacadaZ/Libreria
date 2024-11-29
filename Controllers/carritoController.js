const carritoRepository = require("../repositories/carritoRepository");

exports.getCarrito = async (req, res) => {
    const { carrito_id } = req.params;

    try {
        const items = await carritoRepository.getItemsByCarritoId(carrito_id);
        res.json(items);
    } catch (err) {
        console.error("Error al obtener los productos del carrito:", err);
        res.status(500).send("Error al obtener los productos del carrito");
    }
};

exports.addCarrito = async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;

    try {
        const carritoExistente =
            await carritoRepository.getCarritoByUsuarioIdAndProductoId(
                usuario_id,
                producto_id
            );
        if (carritoExistente) {
            return res
                .status(409)
                .json({ message: "Producto ya agregado al carrito" });
        }

        await carritoRepository.createCarrito(usuario_id, producto_id, cantidad);
        res
            .status(201)
            .json({ message: "Producto agregado al carrito exitosamente" });
    } catch (err) {
        console.error("Error al agregar el producto al carrito:", err);
        res.status(500).send("Error al agregar el producto al carrito");
    }
};

exports.iniciarCompra = async (req, res) => {
    const { usuario_id } = req.body;

    db.query(
        "SELECT id FROM carritos_compras WHERE usuario_id = ?",
        [usuario_id],
        (err, result) => {
            if (err) {
                console.error("Error al verificar el carrito del usuario:", err);
                res.status(500).send("Error al verificar el carrito del usuario");
                return;
            }

            if (result.length > 0) {
                res.json({ carrito_id: result[0].id });
            } else {
                db.query(
                    "INSERT INTO carritos_compras (usuario_id) VALUES (?)",
                    [usuario_id],
                    (err, result) => {
                        if (err) {
                            console.error("Error al crear el carrito del usuario:", err);
                            res.status(500).send("Error al crear el carrito del usuario");
                            return;
                        }

                        res.json({ carrito_id: result.insertId });
                    }
                );
            }
        }
    );
};

exports.deleteCarrito = async (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM carritos_compras WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar el carrito:", err);
            res.status(500).send("Error al eliminar el carrito");
            return;
        }

        res.json({ message: "Carrito eliminado exitosamente" });
    });
};


exports.checkout = async (req, res) => {
    const { carrito_id } = req.body;

    db.query(
        "INSERT INTO pedidos (carrito_id) VALUES (?)",
        [carrito_id],
        (err, result) => {
            if (err) {
                console.error("Error al confirmar la compra:", err);
                res.status(500).send("Error al confirmar la compra");
                return;
            }

            res.json({ message: "Compra confirmada exitosamente" });
        }
    );
}

exports.getProductosByCategoria = async (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM productos WHERE categoria_id = ?",
        [id],
        (err, result) => {
            if (err) {
                console.error("Error al obtener los productos por categoría:", err);
                res.status(500).send("Error al obtener los productos por categoría");
                return;
            }

            res.json(result);
        }
    );
}
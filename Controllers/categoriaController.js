const catagoriaRepository = require('../repositories/categoriaRepository');


exports.addCategorias = async (req, res) => {
    const { nombre } = req.body;

    try {
        const categoriaExistente = await catagoriaRepository.getCategoriaByNombre(nombre);
        if (categoriaExistente) {
            return res.status(409).json({ message: 'Categoria ya registrada' });
        }

        const id = await catagoriaRepository.createCategoria(nombre);
        res.status(201).json({ message: 'Categoria creada exitosamente', id });
    } catch (err) {
        console.error('Error al crear la categoria:', err);
        res.status(500).send('Error al crear la categoria');
    }
}
exports.getCategorias = (req, res) => {
    db.query('SELECT * FROM categorias', (err, result) => {
        if (err) {
            console.error('Error al obtener las categorias:', err);
            res.status(500).send('Error al obtener las categorias');
            return;
        }
        res.json(result);
    });
};

exports.getCategoriaById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM categorias WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la categoria:', err);
            res.status(500).send('Error al obtener la categoria');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Categoría no encontrada');
            return;
        }
        res.json(result[0]);
    });
}


exports.getProductos = (req, res) => {
    db.query('SELECT * FROM productos', (err, result) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).send('Error al obtener los productos');
            return;
        }
        res.json(result);
    });
}

exports.addProductos = async (req, res) => {
    const { nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url } = req.body;
    try {
        const productoExistente = await productoRepository.getProductoByNombre(nombre);
        if (productoExistente) {
            return res.status(409).json({ message: 'Producto ya registrado' });
        }

        const id = await productoRepository.createProducto(nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url);
        res.status(201).json({ message: 'Producto creado exitosamente', id });
    } catch (err) {
        console.error('Error al crear el producto:', err);
        res.status(500).send('Error al crear el producto');
    }
};

exports.getProductoById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM productos WHERE id = ?', [id], (err, result) => {
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
}

exports.updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url } = req.body;
    try {
        await productoRepository.updateProducto(id, { nombre, autor, año, sinopsis, precio, cantidad, categoria_id, imagen_url });
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar el producto:', err);
        res.status(500).send('Error al actualizar el producto');
    }
}

exports.deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await productoRepository.deleteProducto(id);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar el producto:', err);
        res.status(500).send('Error al eliminar el producto');
    }
}
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const result = await categoriaRepository.updateCategoria(id, { nombre });
        if (result.affectedRows === 0) {
            res.status(404).send('Categoría no encontrada');
        } else {
            res.json({ message: 'Categoría actualizada exitosamente' });
        }
    } catch (err) {
        console.error('Error al actualizar la categoría:', err);
        res.status(500).send('Error al actualizar la categoría');
    }
};


exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        await catagoriaRepository.deleteCategoria(id);
        res.json({ message: 'Categoria eliminada exitosamente' });
    } catch (err) {
        console.error('Error al eliminar la categoria:', err);
        res.status(500).send('Error al eliminar la categoria');
    }
}

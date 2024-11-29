const express = require('express');
const router = express.Router();

const categoriaController = require('../controllers/categoriaController');



router.get('/categorias', categoriaController.getCategorias);

router.post('/addCategorias', categoriaController.addCategorias);

router.put('/categorias/:id', categoriaController.updateCategoria);

router.delete('/categorias/:id', categoriaController.deleteCategoria);

router.get('/categorias/:id', categoriaController.getCategoriaById);





router.get('/productos', categoriaController.getProductos);

router.post('/addProductos', categoriaController.addProductos);

router.get('/productos/:id', categoriaController.getProductoById);

router.put('/productos/:id', categoriaController.updateProducto);

router.delete('/productos/:id', categoriaController.deleteProducto);








module.exports = router;
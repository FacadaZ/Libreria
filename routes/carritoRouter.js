const express = require('express');
const router = express.Router();

const carritoController = require('../Controllers/carritoController');

router.post('/addcarrito', carritoController.addCarrito);
router.post('/iniciar-compra', carritoController.iniciarCompra);
router.get('/ObtenerCarritoId/:carrito_id', carritoController.getCarrito);

router.delete('/carrito/:id'), carritoController.deleteCarrito;

router.post('/checkout', carritoController.checkout);

router.get('/categoria/:id/productos', carritoController.getProductosByCategoria);





module.exports = router;


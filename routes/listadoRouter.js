const express = require('express');
const router = express.Router();

const listadoController = require('../Controllers/listadoController');

http://localhost:3000/api/pedidos

router.get('/api/pedidos', listadoController.getPedidos);

router.put('/api/pedidos/:id', listadoController.updatePedidoEstado); 

module.exports = router;

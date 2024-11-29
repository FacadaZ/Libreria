const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

//http://localhost:3000/login
router.post('/login', usuarioController.login);
//http://localhost:3000/registrar
router.post('/registrar', usuarioController.registrar);




module.exports = router;
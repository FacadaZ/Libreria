const listadoRepository = require('../repositories/listadoRespository');


exports.getPedidos = async (req, res) => {
    try {
        const pedidos = await listadoRepository.getPedidos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

exports.updatePedidoEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_pedido } = req.body;
        await listadoRepository.updatePedidoEstado(id, estado_pedido);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/pedidos")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            const tbody = document.querySelector("#pedido-list tbody");
            tbody.innerHTML = "";
            const pedidosConBoton = new Set();

            data.forEach((pedido) => {
                console.log(`Pedido ID: ${pedido.pedido_id}`); 

                const row = document.createElement("tr");

                const clienteCell = document.createElement("td");
                clienteCell.textContent = pedido.cliente;
                row.appendChild(clienteCell);

                const productoCell = document.createElement("td");
                productoCell.textContent = pedido.producto;
                row.appendChild(productoCell);

                const cantidadCell = document.createElement("td");
                cantidadCell.textContent = pedido.cantidad;
                row.appendChild(cantidadCell);

                const totalCell = document.createElement("td");
                totalCell.textContent = pedido.subtotal;
                row.appendChild(totalCell);

                const estadoCell = document.createElement("td");
                estadoCell.textContent = pedido.estado_pedido;
                estadoCell.classList.add(`estado-${pedido.estado_pedido}`);
                row.appendChild(estadoCell);

                const comprobanteCell = document.createElement("td");

                if (!pedidosConBoton.has(pedido.pedido_id)) {
                    const aprobarBtn = document.createElement("button");
                    aprobarBtn.textContent = "Aprobar";
                    aprobarBtn.classList.add("btn-aprobar");
                    aprobarBtn.addEventListener("click", () => {
                        if (pedido.estado_pedido === "pendiente") {
                            fetch(`http://localhost:3000/api/pedidos/${pedido.pedido_id}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ estado_pedido: "completado" }),
                            })
                                .then((response) => {
                                    if (!response.ok) {
                                        throw new Error("Network response was not ok");
                                    }
                                    return response.json();
                                })
                                .then((updatedPedido) => {
                                    estadoCell.textContent = updatedPedido.estado_pedido;
                                    estadoCell.classList.remove("estado-pendiente");
                                    estadoCell.classList.add("estado-completado");
                                })
                                .catch((error) => {
                                    console.error("Error al actualizar el pedido:", error);
                                });
                        }
                    });
                    comprobanteCell.appendChild(aprobarBtn);
                    pedidosConBoton.add(pedido.pedido_id);
                }

                const accionesCell = document.createElement("td");
                const comprobanteImg = document.createElement("img");
                comprobanteImg.src = `${pedido.ruta_comprobante}`;
                comprobanteImg.alt = "Comprobante";
                comprobanteImg.style.width = "100px"; 
                comprobanteImg.classList.add("zoom");
                comprobanteImg.addEventListener("click", () => {
                    comprobanteImg.classList.toggle("zoomed");
                });
                accionesCell.appendChild(comprobanteImg);
                row.appendChild(accionesCell);

                row.appendChild(comprobanteCell);
                tbody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error al obtener los pedidos:", error);
        });
});
document.addEventListener("DOMContentLoaded", async () => {
    const detalleContainer = document.querySelector("#detalle-compra-container");
    const detalleTotal = document.querySelector("#detalle-compra-total");
    const btnConfirmarCompra = document.querySelector("#btn-confirmar-compra");
    const formComprobante = document.querySelector("#formComprobante");
    const inputComprobante = document.querySelector("#comprobante");

    // Mensajes de éxito y error
    const mensajeExito = document.createElement("p");
    mensajeExito.id = "mensaje-exito";
    mensajeExito.style.color = "green";
    const mensajeError = document.createElement("p");
    mensajeError.id = "mensaje-error";
    mensajeError.style.color = "red";
    btnConfirmarCompra.insertAdjacentElement("afterend", mensajeExito);
    btnConfirmarCompra.insertAdjacentElement("afterend", mensajeError);

    const carrito_id = localStorage.getItem("carrito_id");
    const usuario_id = localStorage.getItem("usuario_id");

    // Validar existencia de carrito y usuario
    if (!carrito_id) {
        alert("Carrito no encontrado. Por favor, añade productos al carrito.");
        window.location.href = "/html/Carrito.html";
        return;
    }

    let carrito = [];
    try {
        // Obtener el carrito
        const carritoEndpoint = `http://localhost:3000/carrito/ObtenerCarritoId/${carrito_id}`;
        const response = await fetch(carritoEndpoint);

        if (!response.ok) throw new Error('Error al obtener el carrito.');
        carrito = await response.json();

        if (!Array.isArray(carrito) || carrito.length === 0) {
            detalleContainer.innerHTML = "<p>No hay productos en tu carrito.</p>";
            return;
        }
    } catch (error) {
        console.error("Error:", error.message);
        detalleContainer.innerHTML = "<p>Error al cargar el carrito.</p>";
        return;
    }

    // Mostrar productos del carrito
    detalleContainer.innerHTML = "";
    let total = 0;

    for (const producto of carrito) {
        try {
            const productoEndpoint = `http://localhost:3000/productos/${producto.producto_id}`;
            const response = await fetch(productoEndpoint);
            if (!response.ok) throw new Error('Error al obtener los detalles del producto.');
            const productoDetalles = await response.json();

            const productoElement = document.createElement("tr");
            productoElement.innerHTML = `
                <td>${productoDetalles.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>${productoDetalles.precio * producto.cantidad} Bs</td>
            `;
            detalleContainer.appendChild(productoElement);
            total += productoDetalles.precio * producto.cantidad;
        } catch (error) {
            console.error("Error:", error.message);
            detalleContainer.innerHTML = "<p>Error al cargar los detalles del producto.</p>";
            return;
        }
    }

    detalleTotal.textContent = `${total} Bs`;

    // Confirmar compra
    btnConfirmarCompra.addEventListener("click", async () => {
        const file = inputComprobante.files[0];
        if (!file) {
            mensajeError.textContent = 'Por favor, adjunta un comprobante de pago.';
            mensajeExito.textContent = '';
            return;
        }

        const pedidoEndpoint = `http://localhost:3000/checkout`;

        try {
            // Enviar la solicitud de pedido
            const response = await fetch(pedidoEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    carrito_id: carrito_id,
                    direccion_envio: document.querySelector(".direccion input").value,
                    usuario_id: usuario_id
                }),
            });

            if (!response.ok) throw new Error('Error al confirmar la compra.');

            const data = await response.json();
            mensajeExito.textContent = "Compra finalizada con éxito.";
            mensajeError.textContent = "";

            // Mostrar detalles del pedido
            const detallesContainer = document.querySelector("#detalles-pedido");
            if (data.detalles && Array.isArray(data.detalles)) {
                detallesContainer.innerHTML = data.detalles.map(detalle => `
                    <div>
                        <p>Nombre: ${detalle.nombre}</p>
                        <p>Cantidad: ${detalle.cantidad}</p>
                        <p>Precio: ${detalle.precio} Bs</p>
                    </div>
                `).join("");
            } else {
                detallesContainer.innerHTML = "<p>No hay detalles del pedido disponibles.</p>";
            }

            // Subir comprobante de pago
            const formData = new FormData();
            formData.append('ruta_comprobante', file);
            formData.append('pedido_id', data.pedido_id);

            try {
                const responseComprobante = await fetch('http://localhost:3000/comprobantes_pago', {
                    method: 'POST',
                    body: formData
                });

                if (!responseComprobante.ok) throw new Error('Error al cargar el comprobante de pago.');
            } catch (error) {
                console.error(error);
                mensajeError.textContent = 'Error al cargar el comprobante de pago.';
                return;
            }
            localStorage.removeItem("carrito");
            setTimeout(() => {
                window.location.href = "/Index.html";
            }, 3000);
        } catch (error) {
            console.error("Error:", error.message);
            mensajeExito.textContent = "";
            mensajeError.textContent = error.message || "Hubo un problema al confirmar la compra.";
        }
    });
});

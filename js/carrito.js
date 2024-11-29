document.addEventListener("DOMContentLoaded", async () => {
    const carritoContainer = document.querySelector("#carrito-container");
    const carritoTotal = document.querySelector("#carrito-total");
    const btnComprarContainer = document.querySelector("#btn-comprar-container");
    const btnComprar = document.querySelector("#btn-comprar");

    const userInSession = JSON.parse(localStorage.getItem("userInSession"));
    let carrito = [];
    let carrito_id;

    if (userInSession) {
        carrito_id = localStorage.getItem("carrito_id");
    } else {
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    }

    if (!userInSession && carrito.length === 0) {
        console.error("No se encontró el carrito_id y el carrito está vacío");
        carritoContainer.innerHTML += "<p>El carrito está vacío</p>";
        btnComprarContainer.style.display = "none";
        return;
    }

    if (userInSession && !carrito_id) {
        console.error("No se encontró el carrito_id");
        return;
    }

    if (userInSession) {
        console.log("Carrito ID:", carrito_id);

        const carritoIdElement = document.createElement("p");
        carritoContainer.appendChild(carritoIdElement);

        const response = await fetch(
            `http://localhost:3000/carrito/ObtenerCarritoId/${carrito_id}`
        );
        if (!response.ok) {
            console.error("Error al obtener los productos del carrito");
            return;
        }
        const items = await response.json();

        if (items.length === 0) {
            carritoContainer.innerHTML += "<p>El carrito está vacío</p>";
            btnComprarContainer.style.display = "none";
            return;
        }

        const productos = await Promise.all(
            items.map(async (item, index) => {
                const responseProducto = await fetch(
                    `http://localhost:3000/productos/${item.producto_id}`
                );
                if (!responseProducto.ok) {
                    console.error(
                        `Error al obtener los detalles del producto ${item.producto_id}`
                    );
                    return null;
                }
                const producto = await responseProducto.json();
                return { ...item, ...producto, cantidad: item.cantidad, index };
            })
        );

        productos.forEach((producto) => {
            if (producto) {
                const productoElement = document.createElement("div");
                productoElement.classList.add("producto");
                productoElement.innerHTML = `
                    <img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100px; height: 150px;">
                    <p>Nombre: ${producto.nombre}</p>
                    <p>Precio: ${producto.precio} Bs</p>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <button class="btn-eliminar-api" data-index="${producto.index}">Eliminar</button>
                `;
                carritoContainer.appendChild(productoElement);
            }
        });

        const total = productos.reduce(
            (sum, producto) => sum + producto.precio * producto.cantidad,
            0
        );
        carritoTotal.innerHTML = `<p>Total: ${total} Bs</p>`;
    } else {
        carrito.forEach(async (item, index) => {
            const responseProducto = await fetch(
                `http://localhost:3000/productos/${item.producto_id}`
            );
            if (!responseProducto.ok) {
                console.error(
                    `Error al obtener los detalles del producto ${item.producto_id}`
                );
                return;
            }
            const producto = await responseProducto.json();

            const productoElement = document.createElement("div");
            productoElement.classList.add("producto");
            productoElement.innerHTML = `
                <img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100px; height: 150px;">
                <p>Nombre: ${producto.nombre}</p>
                <p>Precio: ${producto.precio} Bs</p>
                <p>Cantidad: ${item.cantidad}</p>
                <button class="btn-eliminar-local" data-index="${index}">Eliminar</button>
            `;
            carritoContainer.appendChild(productoElement);
        });

        const total = carrito.reduce(
            (sum, item) => sum + item.precio * item.cantidad,
            0
        );
        carritoTotal.innerHTML = `<p>Total: ${total} Bs</p>`;
    }

    btnComprarContainer.style.display = "block";

    document.addEventListener("click", async (e) => {
        const target = e.target;

        if (target.classList.contains("btn-eliminar-api")) {
            const index = target.getAttribute("data-index");
            console.log(`Eliminando producto de la API, índice: ${index}`);
            await eliminarProductoApi(index);
        }

        if (target.classList.contains("btn-eliminar-local")) {
            const index = target.getAttribute("data-index");
            console.log(`Eliminando producto del localStorage, índice: ${index}`);
            eliminarProductoLocal(index);
        }
    });

    btnComprar.addEventListener("click", async () => {
        if (userInSession) {
            window.location.href = '/html/detalle.html';
        } else {
            window.location.href = '/html/Login.html';

        }
    });
});

async function eliminarProductoApi(index) {
    const carrito_id = localStorage.getItem("carrito_id");

    try {
        const responseCarrito = await fetch(`http://localhost:3000/carrito/ObtenerCarritoId/${carrito_id}`);
        if (!responseCarrito.ok) {
            console.error("Error al obtener los productos del carrito");
            return;
        }
        const items = await responseCarrito.json();
        const itemId = items[index].id;

        console.log(`Eliminando producto de la API con ID: ${itemId}`);
        const response = await fetch(`http://localhost:3000/carrito/${itemId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("Error al eliminar el producto del carrito");
            return;
        }

        location.reload();
    } catch (error) {
        console.error("Error al eliminar el producto de la API:", error);
    }
}

function eliminarProductoLocal(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (index >= carrito.length) {
        console.error("Índice inválido para el carrito local");
        return;
    }

    console.log(`Eliminando producto del localStorage en el índice: ${index}`);
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    location.reload();
}
document.addEventListener("DOMContentLoaded", () => {
    const btnSeguirCompra = document.querySelector(".btn.seguir-compra");

    if (btnSeguirCompra) {
        btnSeguirCompra.addEventListener("click", () => {
            window.location.href = "/Index.html";
        });
    }
});
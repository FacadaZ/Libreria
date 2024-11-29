document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const libroId = urlParams.get('id');

    if (!libroId) {
        console.error('No se proporcionó un ID de libro en la URL');
        return;
    }

    try {
        const responseLibro = await fetch(`http://localhost:3000/productos/${libroId}`);
        if (!responseLibro.ok) {
            throw new Error('Error en la respuesta del servidor al obtener los datos del libro');
        }
        const libro = await responseLibro.json();
        console.log('Datos del libro:', libro);

        const responseCategorias = await fetch('http://localhost:3000/categorias');
        if (!responseCategorias.ok) {
            throw new Error('Error en la respuesta del servidor al obtener las categorías');
        }
        const categorias = await responseCategorias.json();
        console.log('Datos de las categorías:', categorias);

        let categoria;
        if (libro.categoria_id !== null) {
            categoria = categorias.find(cat => cat.id === libro.categoria_id);
        }
        console.log('Categoría del libro:', categoria);

        document.getElementById('libro-imagen').src = libro.imagen_url;
        document.getElementById('libro-precio').innerHTML = `<strong>Precio: </strong>${libro.precio} Bs`;
        document.getElementById('libro-stock').innerHTML = `<strong>Stock: </strong>${libro.cantidad}`;
        document.getElementById('libro-nombre').textContent = libro.nombre;
        document.getElementById('libro-autor').textContent = libro.autor;
        document.getElementById('libro-ano').textContent = libro.año;
        document.getElementById('libro-categoria').textContent = categoria ? categoria.nombre : 'Categoría no encontrada';
        document.getElementById('libro-sinopsis').textContent = libro.sinopsis;

        const SelecionarCantidad = document.getElementById('cantidad');
        SelecionarCantidad.innerHTML = '';
        for (let i = 1; i <= libro.cantidad; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Cantidad: ${i}`;
            SelecionarCantidad.appendChild(option);
        }

        document.querySelector('.add-carrito').addEventListener('click', async function () {
            const cantidadSeleccionada = parseInt(SelecionarCantidad.value);
            console.log('Cantidad seleccionada:', cantidadSeleccionada);

            if (libro.cantidad <= 0) {
                return;
            }

            if (cantidadSeleccionada > libro.cantidad) {
                alert('No hay suficiente stock disponible');
                return;
            }

            const userInSession = JSON.parse(localStorage.getItem("userInSession"));
            console.log('Usuario en sesión:', userInSession);

            const producto = {
                carrito_id: localStorage.getItem("carrito_id"),
                producto_id: libro.id,
                cantidad: cantidadSeleccionada
            };
            console.log('Producto a agregar:', producto);

            if (userInSession) {
                try {
                    const url = `http://localhost:3000/addcarrito`;
                    console.log('URL de la solicitud:', url);

                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(producto),
                    });

                    if (!response.ok) {
                        console.error("Error al agregar el producto al carrito del servidor");
                        return;
                    }

                    console.log("Producto agregado al carrito del servidor");
                } catch (error) {
                    console.error("Error al agregar el producto al servidor:", error);
                }
            } else {
                const guestCart = JSON.parse(localStorage.getItem("carrito")) || [];
                console.log('Carrito temporal antes de agregar:', guestCart);
                const existingItemIndex = guestCart.findIndex(item => item.producto_id === producto.producto_id);

                if (existingItemIndex !== -1) {
                    guestCart[existingItemIndex].cantidad += cantidadSeleccionada;
                    console.log('Producto existente actualizado:', guestCart[existingItemIndex]);
                } else {
                    guestCart.push({
                        producto_id: producto.producto_id,
                        nombre: libro.nombre,
                        autor: libro.autor,
                        precio: libro.precio,
                        cantidad: producto.cantidad,
                        imagen_url: libro.imagen_url
                    });
                    console.log('Nuevo producto agregado:', guestCart[guestCart.length - 1]);
                }

                localStorage.setItem("carrito", JSON.stringify(guestCart));
                console.log('Carrito temporal después de agregar:', guestCart);
            }

            window.location.href = '/html/Carrito.html';
        });
    } catch (error) {
        console.error('Error al obtener los datos del libro:', error);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const btnSeguirCompra = document.querySelector(".btn.seguir-compra");

    if (btnSeguirCompra) {
        btnSeguirCompra.addEventListener("click", () => {
            window.location.href = "/Index.html";
        });
    }
});
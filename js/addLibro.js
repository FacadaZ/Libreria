document.addEventListener('DOMContentLoaded', async function() {
    try {
        const responseCategorias = await fetch('http://localhost:3000/categorias');
        
        if (!responseCategorias.ok) {
            throw new Error('Error en la respuesta del servidor al obtener las categorías');
        }

        const categorias = await responseCategorias.json();

        const categorySelect = document.getElementById('inputCategoria');
        categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre; 
            categorySelect.appendChild(option);
        });

        const responseLibros = await fetch('http://localhost:3000/productos');
        
        if (!responseLibros.ok) {
            throw new Error('Error en la respuesta del servidor al obtener los productos');
        }

        const productos = await responseLibros.json();

        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; 

        productos.forEach(producto => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <span>Nombre: ${producto.nombre}</span><br>
                <span>Autor: ${producto.autor}</span><br>
                <img src="${producto.imagen_url}" alt="${producto.nombre}" style="max-width: 100px; max-height: 100px;"><br>
                <button class="edit-button" data-id="${producto.id}">Editar</button>
                <button class="delete-button" data-id="${producto.id}">Borrar</button>
            `;
            productList.appendChild(productItem);
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const response = await fetch(`http://localhost:3000/productos/${id}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener los datos del producto');
                    }
                    const producto = await response.json();
                    document.getElementById('inputNombre').value = producto.nombre;
                    document.getElementById('inputAutor').value = producto.autor;
                    document.getElementById('inputAño').value = producto.año;
                    document.getElementById('inputSinopsis').value = producto.sinopsis;
                    document.getElementById('inputPrecio').value = producto.precio;
                    document.getElementById('inputCantidad').value = producto.cantidad;
                    document.getElementById('inputCategoria').value = producto.categoria_id;
                    document.getElementById('inputImagen').value = producto.imagen_url;
                    document.getElementById('productoForm').setAttribute('data-id', id);
                    document.querySelector('button[type="submit"]').style.display = 'none';
                    document.getElementById('guardarProducto').style.display = 'inline';
                } catch (error) {
                    console.error('Error al cargar los datos del producto:', error);
                }
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const response = await fetch(`http://localhost:3000/productos/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        this.parentElement.remove();
                        console.log(`Producto con ID: ${id} eliminado`);
                        window.location.reload(); 
                    } else {
                        console.error('Error al eliminar el producto');
                    }
                } catch (error) {
                    console.error('Error al eliminar el producto:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener las categorías o productos:', error);
    }
});

document.getElementById('productoForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await guardarProducto();
});

document.getElementById('guardarProducto').addEventListener('click', async function() {
    await guardarProducto();
});

async function guardarProducto() {
    let errorMsg = '';
    const nombre = document.getElementById('inputNombre').value.trim();
    const autor = document.getElementById('inputAutor').value.trim();
    const año = document.getElementById('inputAño').value.trim();
    const sinopsis = document.getElementById('inputSinopsis').value.trim();
    const precio = document.getElementById('inputPrecio').value.trim();
    const cantidad = document.getElementById('inputCantidad').value.trim();
    const categoria = document.getElementById('inputCategoria').value.trim();
    const imagen_url = document.getElementById('inputImagen').value.trim();

    let hasError = false;

    if (!nombre) {
        document.getElementById('errorNombre').innerHTML = 'El nombre del producto es obligatorio.';
        hasError = true;
    } else {
        document.getElementById('errorNombre').innerHTML = '';
    }

    if (!autor) {
        document.getElementById('errorAutor').innerHTML = 'El autor es obligatorio.';
        hasError = true;
    } else {
        document.getElementById('errorAutor').innerHTML = '';
    }

    if (año && (isNaN(año) || año < 0)) {
        document.getElementById('errorAño').innerHTML = 'El año debe ser un número positivo.';
        hasError = true;
    } else {
        document.getElementById('errorAño').innerHTML = '';
    }

    if (!sinopsis) {
        document.getElementById('errorSinopsis').innerHTML = 'La sinopsis es obligatoria.';
        hasError = true;
    } else {
        document.getElementById('errorSinopsis').innerHTML = '';
    }

    if (!precio || isNaN(precio) || precio <= 0) {
        document.getElementById('errorPrecio').innerHTML = 'El precio debe ser un número positivo.';
        hasError = true;
    } else {
        document.getElementById('errorPrecio').innerHTML = '';
    }

    if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
        document.getElementById('errorCantidad').innerHTML = 'La cantidad debe ser un número positivo.';
        hasError = true;
    } else {
        document.getElementById('errorCantidad').innerHTML = '';
    }

    if (!categoria) {
        document.getElementById('errorCategoria').innerHTML = 'Debe seleccionar una categoría.';
        hasError = true;
    } else {
        document.getElementById('errorCategoria').innerHTML = '';
    }

    if (hasError) {
        return;
    }

    const id = document.getElementById('productoForm').getAttribute('data-id');
    const url = id ? `http://localhost:3000/productos/${id}` : 'http://localhost:3000/addProductos';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                autor: autor,
                año: año,
                sinopsis: sinopsis,
                precio: precio,
                cantidad: cantidad,
                categoria_id: categoria,
                imagen_url: imagen_url
            })
        });

        if (response.status === 201 || response.status === 200) {
            document.getElementById('msg-success-producto').style.display = 'block';
            document.getElementById('productoForm').reset();
            document.getElementById('productoForm').removeAttribute('data-id');
            document.querySelector('button[type="submit"]').style.display = 'inline';
            document.getElementById('guardarProducto').style.display = 'none';
            window.location.reload(); 
        } else if (response.status === 400) {
            document.getElementById('msg-error-producto').textContent = 'Error: Datos inválidos';
            document.getElementById('msg-error-producto').style.display = 'block';
        } else {
            document.getElementById('msg-error-producto').textContent = 'Error al agregar el producto';
            document.getElementById('msg-error-producto').style.display = 'block';
        }
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        document.getElementById('msg-error-producto').textContent = 'Error al agregar el producto';
        document.getElementById('msg-error-producto').style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', async function() {
    await cargarCategorias();
});

document.getElementById('categoriaForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    await guardarCategoria();
});

document.getElementById('guardarCategoria').addEventListener('click', async function() {
    await guardarCategoria();
});

async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:3000/categorias');
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError('La respuesta no es JSON');
        }

        const categorias = await response.json();

        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        categorias.forEach(categoria => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <span>${categoria.nombre}</span>
                <div class="button-container">
                    <button class="edit-button" data-id="${categoria.id}">Editar</button>
                    <button class="delete-button" data-id="${categoria.id}">Eliminar</button>
                </div>
            `;
            categoryList.appendChild(categoryItem);

            categoryItem.querySelector('.edit-button').addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const response = await fetch(`http://localhost:3000/categorias/${id}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener los datos de la categoría');
                    }
                    const categoria = await response.json();
                    document.getElementById('inputNombreCategoria').value = categoria.nombre;
                    document.getElementById('categoriaForm').setAttribute('data-id', id);
                    document.querySelector('button[type="submit"]').style.display = 'none';
                    document.getElementById('guardarCategoria').style.display = 'inline';
                } catch (error) {
                    console.error('Error al cargar los datos de la categoría:', error);
                }
            });

            categoryItem.querySelector('.delete-button').addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const response = await fetch(`http://localhost:3000/categorias/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        categoryItem.remove();
                        console.log(`Categoría con ID: ${id} eliminada`);
                    } else {
                        console.error('Error al eliminar la categoría');
                    }
                } catch (error) {
                    console.error('Error al eliminar la categoría:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
    }
}

async function guardarCategoria() {
    const nombreCategoria = document.getElementById('inputNombreCategoria').value;

    if (!nombreCategoria) {
        document.getElementById('validation-nombreCategoria').style.display = 'block';
        return;
    } else {
        document.getElementById('validation-nombreCategoria').style.display = 'none';
    }

    const id = document.getElementById('categoriaForm').getAttribute('data-id');
    const url = id ? `http://localhost:3000/categorias/${id}` : 'http://localhost:3000/addCategorias';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombreCategoria })
        });

        if (response.status === 201 || response.status === 200) {
            document.getElementById('msg-success-categoria').style.display = 'block';
            document.getElementById('msg-error-categoria').style.display = 'none';
            document.getElementById('categoriaForm').reset();
            document.getElementById('categoriaForm').removeAttribute('data-id');
            document.querySelector('button[type="submit"]').style.display = 'inline';
            document.getElementById('guardarCategoria').style.display = 'none';
            await cargarCategorias(); 
        } else if (response.status === 400) {
            document.getElementById('msg-error-categoria').textContent = 'Error: Datos inválidos';
            document.getElementById('msg-error-categoria').style.display = 'block';
            document.getElementById('msg-success-categoria').style.display = 'none';
        } else {
            document.getElementById('msg-error-categoria').textContent = 'Error al agregar la categoría';
            document.getElementById('msg-error-categoria').style.display = 'block';
            document.getElementById('msg-success-categoria').style.display = 'none';
        }
    } catch (error) {
        console.error('Error al agregar la categoría:', error);
        document.getElementById('msg-error-categoria').textContent = 'Error al agregar la categoría';
        document.getElementById('msg-error-categoria').style.display = 'block';
        document.getElementById('msg-success-categoria').style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', async function() {
    async function fetchAndDisplayBooks(url, targetElementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor al obtener los libros: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError('La respuesta no es JSON');
            }

            const libros = await response.json();
            const itemsSection = document.getElementById(targetElementId);
            itemsSection.innerHTML = '';

            if (libros.length === 0) {
                itemsSection.innerHTML = '<p>Categoría vacía</p>';
            } else {
                libros.forEach(libro => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item';
                    itemDiv.innerHTML = `
                        <a href="/html/Descripcion.html?id=${libro.id}">
                            <img src="${libro.imagen_url}" alt="${libro.nombre}">
                            <p>${libro.nombre}</p>
                            <p class="price">${libro.precio} Bs</p>
                        </a>
                    `;
                    itemsSection.appendChild(itemDiv);
                });
            }
        } catch (error) {
            console.error(`Error al obtener los libros desde la URL ${url}:`, error);
        }
    }

    async function fetchCategoryName(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor al obtener la categoría: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError('La respuesta no es JSON');
            }

            const categoria = await response.json();
            const categoriaNombre = document.getElementById('categoria-nombre');
            categoriaNombre.textContent = categoria.nombre;
        } catch (error) {
            console.error(`Error al obtener la categoría desde la URL ${url}:`, error);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const categoriaId = urlParams.get('id');
    if (categoriaId) {
        const categoriaUrl = `http://localhost:3000/categorias/${categoriaId}/productos`;
        const categoriaNombreUrl = `http://localhost:3000/categorias/${categoriaId}`;
        await fetchCategoryName(categoriaNombreUrl);
        await fetchAndDisplayBooks(categoriaUrl, 'categoria-items');
    }
});
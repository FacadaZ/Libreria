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
        } catch (error) {
            console.error(`Error al obtener los libros desde la URL ${url}:`, error);
        }
    }

    async function fetchAndDisplayCategories(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor al obtener las categorías: ${response.status} ${response.statusText}`);
            }
    
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError('La respuesta no es JSON');
            }
    
            const categorias = await response.json();
            const categoryList = document.getElementById('category-list');
            categoryList.innerHTML = '';
    
            categorias.forEach(categoria => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `/html/categoria.html?id=${categoria.id}`;
                a.textContent = categoria.nombre;
                li.appendChild(a);
                categoryList.appendChild(li);
            });
        } catch (error) {
            console.error('Error al obtener las categorías:', error);
        }
    }

    await fetchAndDisplayBooks('http://localhost:3000/productos', 'mas-buscados-items');
    await fetchAndDisplayCategories('http://localhost:3000/categorias');

    const userInSession = JSON.parse(localStorage.getItem("userInSession"));
    if (userInSession && userInSession.nombre_usuario) {
        const welcomeMessage = document.querySelector("#welcome-message");
        welcomeMessage.innerHTML = `Bienvenido:  ${userInSession.nombre_usuario}`;
    }

    const logoutButton = document.getElementById('logout-button');
    const adminPanelButton = document.getElementById('admin-panel-button');
    if (userInSession) {
        logoutButton.style.display = 'inline-block';
        if (userInSession.rol === 'administrador') {
            adminPanelButton.style.display = 'inline-block';
        }
    } else {
        logoutButton.style.display = 'none';
        adminPanelButton.style.display = 'none';
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userInSession');
        window.location.href = '/Index.html';
    });

    adminPanelButton.addEventListener('click', () => {
        window.location.href = '/html/admin/PanelAdm.html';
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async () => {
        const searchValue = searchInput.value.trim();

        if (searchValue === '') {
            await fetchAndDisplayBooks('http://localhost:3000/productos', 'mas-buscados-items');
        } else {
            await fetchAndDisplayBooks(`http://localhost:3000/search/${searchValue}`, 'mas-buscados-items');
        }
    });
});
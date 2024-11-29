document.addEventListener('DOMContentLoaded', async function() {
    try {
        const responseLibros = await fetch('http://localhost:3000/productos');
        
        if (!responseLibros.ok) {
            throw new Error('Error en la respuesta del servidor al obtener los libros');
        }

        const contentType = responseLibros.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError('La respuesta no es JSON');
        }

        const libros = await responseLibros.json();
        console.log('Todos los libros:', libros);

        libros.forEach(libro => {
            console.log(`ID: ${libro.id}, Categoria ID: ${libro.categoria_id}, Nombre: ${libro.nombre}`);
        });

        const librosPoesia = libros.filter(libro => libro.categoria_id === 1);
        console.log('Libros de la categoría con categoria_id = 1:', librosPoesia);

        const itemsSection = document.getElementById('poesia-items');
        itemsSection.innerHTML = ''; 

        librosPoesia.forEach(libro => {
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
        console.error('Error al obtener los libros de la categoría:', error);
    }
});
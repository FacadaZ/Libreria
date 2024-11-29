document.querySelector("#btn-login").addEventListener("click", async (e) => {
    e.preventDefault();

    const [validationUsername, validationPassword, msgError] =
        document.querySelectorAll("#validation-username, #validation-password, #msg-error-login");

    validationUsername.style.display = "none";
    validationPassword.style.display = "none";
    msgError.style.display = "none";

    const inputUsername = document.querySelector("#inputUsername");
    const inputPassword = document.querySelector("#inputPassword");
    let hasError = false;

    if (inputUsername.value.trim() === "") {
        hasError = true;
        validationUsername.style.display = "block";
    }
    if (inputPassword.value.trim() === "") {
        hasError = true;
        validationPassword.style.display = "block";
    }

    if (hasError) return;

    const usuario = {
        nombre_usuario: inputUsername.value,
        contraseña: inputPassword.value,
    };

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(usuario),
        });

        if (response.status === 401) {
            throw new Error("Usuario y/o Contraseña son inválidos");
        }
        if (response.status !== 200) {
            throw new Error("Error en el inicio de sesión");
        }

        const data = await response.json().catch(() => {
            throw new Error("Respuesta del servidor no contiene JSON válido");
        });

        if (!data.nombre_usuario || !data.rol) {
            throw new Error("Respuesta del servidor no contiene nombre_usuario o rol");
        }

        localStorage.setItem(
            "userInSession",
            JSON.stringify({ nombre_usuario: data.nombre_usuario, rol: data.rol })
        );
        
        /*onsole.log("Usuario guardado en localStorage", localStorage.getItem("userInSession"));*/
        
        let carritoId = await obtenerCarritoId(data.nombre_usuario);
        
        localStorage.setItem("carrito_id", carritoId);
        
        console.log("Carrito ID asignado al usuario:", carritoId);
        
        await mostrarItemsCarrito(carritoId);
        
        await mergeGuestCartWithUserCart(carritoId);
        
        const responseUsuario = await fetch(`http://localhost:3000/usuario/${data.nombre_usuario}`);
        if (!responseUsuario.ok) {
            throw new Error('Error al obtener el id del usuario');
        }
        const usuarioData = await responseUsuario.json();
        localStorage.setItem("usuario_id", usuarioData.id);

        if (data.rol === "administrador") {
            document.location.href = "/html/admin/PanelAdm.html";
        } else {
            document.location.href = "/Index.html";
        }
    } catch (error) {
        console.error("Error:", error);
        msgError.innerHTML = error.message;
        msgError.style.display = "block";
    }
});

async function obtenerCarritoId(username) {
    try {
        console.log(`Obteniendo carrito para el usuario: ${username}`);
        const responseUsuario = await fetch(`http://localhost:3000/usuario/${username}`);
        if (!responseUsuario.ok) {
            throw new Error('Error al obtener el id del usuario');
        }
        const usuario = await responseUsuario.json();
        const usuarioId = usuario.id;
        console.log(`ID del usuario obtenido: ${usuarioId}`);

        const response = await fetch(`http://localhost:3000/usuario/${username}/carrito`);
        if (response.status === 404) {
            console.log('No se encontró un carrito existente, creando uno nuevo...');
            const responseNuevoCarrito = await fetch("http://localhost:3000/iniciar-compra", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ usuario_id: usuarioId }),
            });
            if (!responseNuevoCarrito.ok) {
                throw new Error('Error al crear el carrito del usuario');
            }
            const nuevoCarrito = await responseNuevoCarrito.json();
            console.log("Nuevo carrito creado con ID:", nuevoCarrito.carrito_id); // Mostrar el nuevo carrito_id en la consola
            return nuevoCarrito.carrito_id;
        } else if (!response.ok) {
            throw new Error('Error al obtener el carrito del usuario');
        } else {
            const carrito = await response.json();
            console.log("Carrito existente encontrado con ID:", carrito.carrito_id); // Mostrar el carrito_id existente en la consola
            return carrito.carrito_id;
        }
    } catch (error) {
        console.error('Error en obtenerCarritoId:', error);
        throw error;
    }
}

async function mergeGuestCartWithUserCart(carritoId) {
    const guestCart = JSON.parse(localStorage.getItem("carrito")) || [];
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
        const response = await fetch("http://localhost:3000/addcarrito", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                carrito_id: carritoId,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
            }),
        });

        if (!response.ok) {
            console.error(`Error al agregar el producto ${item.producto_id} al carrito`);
        }
    }

    localStorage.removeItem("carrito");
    console.log(`Carrito fusionado para el carrito_id ${carritoId}`);
}

async function mostrarItemsCarrito(carritoId) {
    try {
        const response = await fetch(`http://localhost:3000/carrito/ObtenerCarritoId/${carritoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los ítems del carrito');
        }
        const items = await response.json();
        console.log('Ítems del carrito:', items);

        items.forEach(item => {
            console.log(`ID: ${item.id}, Carrito ID: ${item.carrito_id}, Producto ID: ${item.producto_id}, Cantidad: ${item.cantidad}, Creado en: ${item.creado_en}`);
        });
    } catch (error) {
        console.error('Error al obtener los ítems del carrito:', error);
    }
}
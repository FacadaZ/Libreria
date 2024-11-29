document.querySelector("#btn-register").addEventListener('click', (e) => {
    e.preventDefault();

    const [validationFullname, validationUsername, validationPassword, msgError, msgSuccess] =
        document.querySelectorAll("#validation-fullname, #validation-username, #validation-password, #msg-error-register, #msg-success-register");

    validationFullname.style.display = "none";
    validationUsername.style.display = "none";
    validationPassword.style.display = "none";
    msgError.style.display = "none";
    msgSuccess.style.display = "none";

    const inputFullname = document.querySelector("#inputFullname");
    const inputUsername = document.querySelector("#inputUsername");
    const inputPassword = document.querySelector("#inputPassword");
    let hasError = false;

    if (inputFullname.value.trim() === "") {
        hasError = true;
        validationFullname.style.display = "block";
    }
    if (inputUsername.value.trim() === "") {
        hasError = true;
        validationUsername.style.display = "block";
    }
    if (inputPassword.value.trim() === "") {
        hasError = true;
        validationPassword.innerHTML = "La contraseña no puede estar vacía";
        validationPassword.style.display = "block";
    } else if (inputPassword.value.trim().length < 5) {
        hasError = true;
        validationPassword.innerHTML = "La contraseña debe tener al menos 5 caracteres";
        validationPassword.style.display = "block";
    }

    if (hasError) return;

    const usuario = {
        nombre_completo: inputFullname.value,
        nombre_usuario: inputUsername.value,
        contraseña: inputPassword.value,
        rol: "cliente"
    };

    fetch('http://localhost:3000/registrar', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    })
    .then((response) => {
        if (!response.ok) {
            if (response.status === 500) {
                throw new Error('Usuario ya registrado');
            }
            throw new Error(response.status);
        }
        return response.json();
    })
    .then((data) => {
        msgSuccess.innerHTML = "Usuario registrado exitosamente";
        msgSuccess.style.display = "block";

        setTimeout(() => {
            window.location.href = "/html/Login.html";
        }, 2000); 
    })
    .catch((error) => {
        console.error("Error:", error);
        if (error.message === 'Usuario ya registrado') {
            msgError.innerHTML = "El usuario ya está registrado";
        } else {
            msgError.innerHTML = "error al registrar";
        }
        msgError.style.display = "block";
    });
});

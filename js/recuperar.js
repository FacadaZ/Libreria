document.getElementById('recoverForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre_usuario = document.getElementById('inputNombreUsuario').value;

    if (!nombre_usuario) {
        document.getElementById('validation-nombre_usuario').style.display = 'block';
        return;
    } else {
        document.getElementById('validation-nombre_usuario').style.display = 'none';
    }

    fetch('http://localhost:3000/recuperar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_usuario: nombre_usuario })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('msg-success-recover').style.display = 'block';
            document.getElementById('msg-success-recover').textContent = data.message;
            document.getElementById('msg-error-recover').style.display = 'none';

            document.getElementById('recoverForm').style.display = 'none';
            document.getElementById('verifyForm').style.display = 'block';
        } else {
            document.getElementById('msg-error-recover').style.display = 'block';
            document.getElementById('msg-error-recover').textContent = 'Error al enviar el código';
            document.getElementById('msg-success-recover').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('msg-error-recover').style.display = 'block';
        document.getElementById('msg-error-recover').textContent = 'Error al enviar el código';
        document.getElementById('msg-success-recover').style.display = 'none';
    });
});

document.getElementById('verifyForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const token = document.getElementById('inputToken').value;

    if (!token) {
        document.getElementById('validation-token').style.display = 'block';
        return;
    } else {
        document.getElementById('validation-token').style.display = 'none';
    }

    fetch('http://localhost:3000/verificar-codigo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (response.status === 400) {
            throw new Error('El token ha expirado o no es válido');
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            document.getElementById('msg-success-verify').style.display = 'block';
            document.getElementById('msg-success-verify').textContent = data.message;
            document.getElementById('msg-error-verify').style.display = 'none';

            document.getElementById('verifyForm').style.display = 'none';
            document.getElementById('resetForm').style.display = 'block';
        } else {
            document.getElementById('msg-error-verify').style.display = 'block';
            document.getElementById('msg-error-verify').textContent = 'Error al verificar el código';
            document.getElementById('msg-success-verify').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        document.getElementById('msg-error-verify').style.display = 'block';
        document.getElementById('msg-error-verify').textContent = error.message;
        document.getElementById('msg-success-verify').style.display = 'none';
    });
});

document.getElementById('resetForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const token = document.getElementById('inputToken').value;
    const newPassword = document.getElementById('inputNewPassword').value;

    if (!token || !newPassword) {
        document.getElementById('validation-reset').style.display = 'block';
        return;
    } else {
        document.getElementById('validation-reset').style.display = 'none';
    }

    fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, newPassword: newPassword })
    })
    .then(response => {
        if (response.status === 400) {
            throw new Error('El token ha expirado o no es válido');
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            document.getElementById('msg-success-reset').style.display = 'block';
            document.getElementById('msg-success-reset').textContent = data.message;
            document.getElementById('msg-error-reset').style.display = 'none';
            setTimeout(() => {
                window.location.href = '/html/Login.html';
            }, 3000);
        } else {
            document.getElementById('msg-error-reset').style.display = 'block';
            document.getElementById('msg-error-reset').textContent = 'Error al restablecer la contraseña';
            document.getElementById('msg-success-reset').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        document.getElementById('msg-error-reset').style.display = 'block';
        document.getElementById('msg-error-reset').textContent = error.message;
        document.getElementById('msg-success-reset').style.display = 'none';
    });
});
document.getElementById('resendCode').addEventListener('click', function(event) {
    event.preventDefault();

    const nombre_usuario = document.getElementById('inputNombreUsuario').value;

    if (!nombre_usuario) {
        document.getElementById('validation-nombre_usuario').style.display = 'block';
        return;
    } else {
        document.getElementById('validation-nombre_usuario').style.display = 'none';
    }

    fetch('http://localhost:3000/recuperar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_usuario: nombre_usuario })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('msg-success-recover').style.display = 'block';
            document.getElementById('msg-success-recover').textContent = data.message;
            document.getElementById('msg-error-recover').style.display = 'none';
        } else {
            document.getElementById('msg-error-recover').style.display = 'block';
            document.getElementById('msg-error-recover').textContent = 'Error al enviar el código';
            document.getElementById('msg-success-recover').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('msg-error-recover').style.display = 'block';
        document.getElementById('msg-error-recover').textContent = 'Error al enviar el código';
        document.getElementById('msg-success-recover').style.display = 'none';
    });
});
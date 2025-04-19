document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('usuario'));

    if (!userData || Number(userData.tipoUsuario) !== 0) {
        alert('Acceso denegado')
        window.location.href = '../../index.html';
    }

})
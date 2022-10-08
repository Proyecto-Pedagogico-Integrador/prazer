
const url = "http://localhost:4000/login"
console.log('conectado a ', url)
const username = document.getElementById('username')
const password = document.getElementById('password')
const formLogin = document.querySelector('form')

const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
        {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value
                })
            })
            .then(response =>response.json())
            
                .then(data =>{
                    if(data.msg === "Empleado Aceptado"){
                        Swal.fire({
                            icon: 'success',
                            title: `${data.msg}`,
                            showConfirmButton: false,
                            timer: 1800
                          })
                          .then(() => {
                            //Redirigimos la pagina cuando inicie sesion
                           window.location.href="http://127.0.0.1:3000/Client/Producto/index.html"
                           });
                    }else{
                        Swal.fire({
                            icon: 'error',
                            title: `${data.msg}`,
                            showConfirmButton: false,
                            timer: 2000
                          });
                    }
                   
                })
               /*  ; */
        }
})

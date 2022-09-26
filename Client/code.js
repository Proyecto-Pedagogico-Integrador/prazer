// Definicion de variables
const url = 'http://localhost:4000/productos'
const contenedor = document.querySelector('tbody')
let resultados = ''

const modalArticulo = new bootstrap.Modal(document.getElementById('modalArticulo'))
const formArticulo = document.querySelector('form')
const nombre = document.getElementById('nombre')
const precio = document.getElementById('precio')
const peso = document.getElementById('peso')
const cantidad = document.getElementById('cantidad')
let opcion = ''

btnCrear.addEventListener('click', ()=>{
    nombre.value = ''
    precio.value = ''
    peso.value = ''
    cantidad.value = ''
    modalArticulo.show()
    opcion = 'crear'
})


//función mostrar
const mostrar = (productoBD) =>{
    console.log('entra');
    productoBD.forEach(producto =>{
        console.log('entra 2');
        console.log(productoBD);
        resultados += `<tr> 
        <td>${productoBD.ID_PRODUCTO}</td>
        <td>${productoBD.NOMBRE}</td>
        <td>${productoBD.PRECIO}</td>
        <td>${productoBD.PESO}</td>
        <td>${productoBD.CANTIDAD}</td>
        <td class="text-center"><a class="btnEditar btn btn-primary">Editar</a><a class="btnEliminar btn btn-danger">Eliminar</a>
        </tr>`
        console.log('entra 3');
    })
    contenedor.innerHTML = resultados
}

// Procedimiento Mostrar
fetch(url)
.then(response => response.json())
.then(data => mostrar(data))
.catch(error =>console.log(error))
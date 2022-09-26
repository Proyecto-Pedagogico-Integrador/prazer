// Definicion de variables
const url = 'http://localhost:4000/productos'
const contenedor = document.querySelector('tbody')
console.log("contenedor", contenedor)
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
    productoBD.forEach(producto =>{
        resultados += `<tr> 
        <td>${producto.ID_PRODUCTO}</td>
        <td>${producto.NOMBRE}</td>
        <td>${producto.PRECIO}</td>
        <td>${producto.PESO}</td>
        <td>${producto.CANTIDAD}</td>
        <td class="text-center"><a class="btnEditar btn btn-primary">Editar</a><a class="btnEliminar btn btn-danger">Eliminar</a>
        </tr>`
    })
    console.log("resultados", resultados)
    contenedor.innerHTML = resultados
    console.log("contenedor", contenedor)
}

// Procedimiento Mostrar
fetch(url)
.then(response => response.json())
.then(data => mostrar(data))
.catch(error =>console.log(error))
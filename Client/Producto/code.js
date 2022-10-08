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

btnCrear.addEventListener('click', () => {
    nombre.value = ''
    precio.value = ''
    peso.value = ''
    cantidad.value = ''
    modalArticulo.show()
    opcion = 'crear'

})


//función mostrar
const mostrar = (productoBD) => {
    productoBD.forEach(producto => {
        resultados += `<tr> 
        <td>${producto.ID_PRODUCTO}</td>
        <td>${producto.NOMBRE}</td>
        <td>${producto.PRECIO}</td>
        <td>${producto.PESO}</td>
        <td>${producto.CANTIDAD}</td>
        <td class="text-center"><a class="btnEditar btn">Editar</a><a class="btnBorrar btn btn-danger">Eliminar</a></td>
        </tr>`
    })
    contenedor.innerHTML = resultados
}

// Procedimiento Mostrar
fetch(url)
    .then(response => response.json())
    .then(data => mostrar(data))
    .catch(error => console.log(error))


const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}

on(document, 'click', '.btnBorrar', e => {
    const fila = e.target.parentNode.parentNode
    const id = fila.firstElementChild.innerHTML
    const nombre = fila.children[1].innerHTML
    console.log(`Id producto ${id} Nombre ${nombre}`)
    {
        Swal.fire({
            html:
                `<b> ¿Está seguro de eliminar el producto ${nombre}?</b>` +
                '<br/> <br/> Recuerde que al confirmar, este registro se perderá',
            width: 400,
            heightAuto: true,
            imageWidth: 240,
            imageHeight: 240,
            color: '#9063cd',
            showCancelButton: true,
            confirmButtonColor: '#9063cd',
            cancelButtonColor: '#2c2a29',
            confirmButtonText: 'Si, estoy seguro!',
            cancelButtonText: 'Cancelar',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(url + '/' + id, {
                    method: 'delete'
                })
                    .then(res => res.json())
                Swal.fire({
                    html:
                        '<b>El producto fue eliminado!</b>',
                    icon: 'success',
                    width: 400,
                    heightAuto: true,
                    imageWidth: 240,
                    imageHeight: 240,
                    color: '#9063cd',
                    showConfirmButton: true,
                    timer: 3000,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
    
                })
            
            }
        })
        setTimeout(() => {
            location.reload()  
        }, 3000);
    }
})

// Procedimiento Editar
let idForm = 0;
on(document, 'click', '.btnEditar', e => {
    const fila = e.target.parentNode.parentNode
    idForm = fila.children[0].innerHTML
    const nombreForm = fila.children[1].innerHTML
    const precioForm = fila.children[2].innerHTML
    const pesoForm = fila.children[3].innerHTML
    const cantidadForm = fila.children[4].innerHTML
    console.log(`Id ${idForm} nombre ${nombreForm} precio ${precioForm} peso ${pesoForm} cantidad ${cantidadForm}`)
    nombre.value = nombreForm
    precio.value = precioForm
    peso.value = pesoForm
    cantidad.value = cantidadForm
    modalArticulo.show()
    opcion = 'editar'
})

// Procedimiento para Crear y Editar
formArticulo.addEventListener('submit', (e) => {
    e.preventDefault();
    if (opcion == 'crear') {
        console.log('Opcion Crear')
        {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre.value,
                    precio: precio.value,
                    peso: peso.value,
                    cantidad: cantidad.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    const nuevoProducto = []
                    nuevoProducto.push(data)
                    mostrar(nuevoProducto)
                    modalArticulo.hide()

                })
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Producto Creado Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 4000);

    }
    if (opcion == 'editar') {
        console.log('Opcion Editar')
        {
            fetch(url + '/' + idForm, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre.value,
                    precio: precio.value,
                    peso: peso.value,
                    cantidad: cantidad.value
                })
            })
                .then(response => response.json())
            modalArticulo.hide()
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Producto Actualizado Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 2000);
       
    }
   
})
// Definicion de variables
const url = 'http://localhost:4000/proveedores'
const contenedor = document.querySelector('tbody')
let resultados = ''

const modalProveedor = new bootstrap.Modal(document.getElementById('modalProveedor'))
const formProveedor = document.querySelector('form')
const nombre = document.getElementById('nombre')
const direccion = document.getElementById('direccion')
let opcion = ''

btnCrear.addEventListener('click', () => {
    nombre.value = ''
    direccion.value = ''
    modalProveedor.show()
    opcion = 'crear'
})

//función mostrar
const mostrar = (proveedorBD) => {
    proveedorBD.forEach(proveedor => {
        resultados += `<tr>
        <td>${proveedor.ID_PROVEEDOR}</td>
        <td>${proveedor.NOMBRE}</td>
        <td>${proveedor.DIRECCION}</td>
        <td class="text-center"><a class="btnEditar btn btn-primary">Editar</a><a class="btnBorrar btn btn-danger">Eliminar</a></td>
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
    console.log(`Id proveedor ${id} Nombre ${nombre}`)
    {
        Swal.fire({
            html:
                `<b> ¿Está seguro de eliminar el proveedor ${nombre}?</b>` +
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
                        '<b>El proveedor fue eliminado!</b>',
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
    const direccionForm = fila.children[2].innerHTML
    console.log(`Id ${idForm} nombre ${nombreForm} direccion ${direccionForm}`)
    nombre.value = nombreForm
    direccion.value = direccionForm
    modalProveedor.show()
    opcion = 'editar'
})

// Procedimiento para Crear y Editar
formProveedor.addEventListener('submit', (e) => {
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
                    direccion: direccion.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    const nuevoProveedor = []
                    nuevoProveedor.push(data)
                    mostrar(nuevoProveedor)
                    modalProveedor.hide()

                })
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Proveedor Creado Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 2000);

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
                    direccion: direccion.value
                })
            })
                .then(response => response.json())
            modalProveedor.hide()
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Proveedor Actualizado Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 2000);
       
    }
   
})
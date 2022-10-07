// Definicion de variables
const url = "http://localhost:4000/materiaPrima"
const url2 = "http://localhost:4000/proveedores"
const contenedor = document.querySelector("tbody")
const seleccion = document.querySelector("select")
let resultados = ''
let resultados2 = ''

const modalMPrima = new bootstrap.Modal(document.getElementById('modalMPrima'))
const formMPrima = document.querySelector('form')
const nombre = document.getElementById('nombre')
const costo = document.getElementById('costo')
const cantidad = document.getElementById('cantidad')
const proveedor = document.getElementById('proveedor')
let opcion = ''

btnCrear.addEventListener('click', () => {
    nombre.value = ''
    costo.value = ''
    cantidad.value = ''
    proveedor.value = ''
    modalMPrima.show()
    opcion = 'crear'
})

//función mostrar
const mostrar = (mPrimaBD) => {
    mPrimaBD.forEach((mPrima) => {
        resultados += `<tr> 
        <td>${mPrima.ID_MATERIA_PRIMA}</td>
        <td>${mPrima.NOMBRE}</td>
        <td>${mPrima.COSTO}</td>
        <td>${mPrima.CANTIDAD}</td>
        <td>${mPrima.NOMBRE_PROVEEDOR}</td>
        <td class="text-center"><a class="btnEditar btn">Editar</a><a class="btnBorrar btn btn-danger">Eliminar</a>
        </tr>`
    })
    contenedor.innerHTML = resultados
}

// Procedimiento Mostrar
fetch(url)
    .then((response) => response.json())
    .then((data) => mostrar(data))
    .catch((error) => console.log(error))

const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}

//Función borrar

on(document, 'click', '.btnBorrar', e => {
    const fila = e.target.parentNode.parentNode
    const id = fila.firstElementChild.innerHTML
    const nombre = fila.children[1].innerHTML
    console.log(`Id matria prima ${id} Nombre ${nombre}`)
    {
        Swal.fire({
            html:
                `<b> ¿Está seguro de eliminar la materia prima ${nombre}?</b>` +
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
    const costoForm = fila.children[2].innerHTML
    const cantidadForm = fila.children[3].innerHTML
    const proveedorForm = fila.children[4].innerHTML
    console.log(`Id ${idForm} nombre ${nombreForm} costo ${costoForm} cantidad ${cantidadForm} proveedor ${proveedorForm}`)
    nombre.value = nombreForm
    costo.value = costoForm
    cantidad.value = cantidadForm
    proveedor.value = proveedorForm
    modalMPrima.show()
    opcion = 'editar'
})

// Procedimiento para Crear y Editar
formMPrima.addEventListener('submit', (e) => {
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
                    costo: costo.value,
                    cantidad: cantidad.value,
                    proveedor: proveedor.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    const nuevaMPrima = []
                    nuevaMPrima.push(data)
                    mostrar(nuevaMPrima)
                    modalMPrima.hide()

                })
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Materia Prima Creada Exitosamente',
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
                    costo: costo.value,
                    cantidad: cantidad.value,
                    proveedor: proveedor.value
                })
            })
                .then(response => response.json())
            modalMPrima.hide()
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Materia Prima Actualizada Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 2000);
       
    }
   
})

//función mostrar proveedores
const mostrarP = (proveedorBD) => {
    proveedorBD.forEach((proveedores) => {
        resultados2 += 
        
        `<option value="${proveedores.ID_PROVEEDOR}">${proveedores.NOMBRE}</option>`
        
    })
    seleccion.innerHTML = resultados2
}

// Procedimiento Mostrar
fetch(url2)
    .then((response) => response.json())
    .then((data) => mostrarP(data))
    .catch((error) => console.log(error))

const on2 = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}
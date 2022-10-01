// Definicion de variable
const url = 'http://localhost:4000/empleados'
const contenedor = document.querySelector('tbody')
let resultadosRH = ''
let resultadoTipoEmpleado = ''
let resultadoEmpleado = ''

const modalEmpleado = new bootstrap.Modal(document.getElementById('modalEmpleado'))
const formArticulo = document.querySelector('form')
const cedula = document.getElementById('cedula')
const primerNombre = document.getElementById('primerNombre')
const segundoNombre = document.getElementById('segundoNombre')
const primerApellido = document.getElementById('primerApellido')
const segundoApellido = document.getElementById('segundoApellido')
const correo = document.getElementById('correo')
const contrasena = document.getElementById('contrasena')
const telefono = document.getElementById('telefono')
const fechaNacimiento = document.getElementById('fechaNacimiento')
const salario = document.getElementById('salario')
const eps = document.getElementById('eps')
const genero = document.getElementById('genero')
const telefonoEmergencia = document.getElementById('telefonoEmergencia')
const idRh = document.getElementById('idRh')
const idTipoEmpleado = document.getElementById('idTipoEmpleado')

btnCrear.addEventListener('click', () => {
    cedula.value = ''
    primerNombre.value = ''
    segundoNombre.value = ''
    primerApellido.value = ''
    segundoApellido.value = ''
    correo.value = ''
    contrasena.value = ''
    telefono.value = ''
    fechaNacimiento.value = ''
    console.log('fech',fechaNacimiento.innerText)
    salario.value = ''
    eps.value = ''
    genero.value = ''
    telefonoEmergencia.value = ''
    idRh.value = ''
    idTipoEmpleado.value = ''
    modalEmpleado.show()
    opcion = 'crear'
})


//función mostrar tipo rh
const mostrarRH = (rhBD) => {
    rhBD.forEach(rh => {
        resultadosRH += `<option value=${rh.ID_RH}>${rh.NOMBRE}</option>`
    })
    idRh.innerHTML = resultadosRH
}

// Procedimiento Mostrar
fetch(url + '/tipo_rh')
    .then(response => response.json())
    .then(data => mostrarRH(data))
    .catch(error => console.log(error))



// funcion mostrar tipo empleado
const mostrarTipoEmpleado = (tipoEmpleadoBD) =>{
    tipoEmpleadoBD.forEach(tipoEmpleado =>{
        
        resultadoTipoEmpleado += `<option value=${tipoEmpleado.ID_TIPO_EMPLEADO}>${tipoEmpleado.NOMBRE}</option>`
    })
    idTipoEmpleado.innerHTML = resultadoTipoEmpleado
}

// Procedimiento Mostrar Tipo Empleado
fetch(url + '/tipo_empleado')
    .then(response => response.json())
    .then(data => mostrarTipoEmpleado(data))
    .catch(error => console.log(error))

// funcion mostrar tipo empleado
const mostrarEmpleado = (empleadoBD) =>{
    empleadoBD.forEach(empleado =>{
        let fechaN = empleado.FECHA_DE_NACIMIENTO.slice(0,10)
        resultadoEmpleado += `<tr> 
        <td>${empleado.ID_EMPLEADO}</td>
        <td>${empleado.CEDULA}</td>
        <td>${empleado.PRIMER_NOMBRE}</td>
        <td>${empleado.SEGUNDO_NOMBRE}</td>
        <td>${empleado.PRIMER_APELLIDO}</td>
        <td>${empleado.SEGUNDO_APELLIDO}</td>
        <td>${empleado.CORREO}</td>
        <td>${empleado.TELEFONO}</td>
        <td>${fechaN}</td>
        <td>${empleado.SALARIO}</td>
        <td>${empleado.EPS}</td>
        <td>${empleado.GENERO}</td>
        <td>${empleado.TELEFONO_EMERGENCIA}</td>
        <td>${empleado.NOMBRE_RH}</td>
        <td>${empleado.NOMBRE_TIPO_EMPLEADO}</td>
        <td class="text-center"><a class="btnEditar btn btn-primary">Editar</a><a class="btnBorrar btn btn-danger">Eliminar</a>
        </tr>`
    })
    contenedor.innerHTML = resultadoEmpleado
}

// Procedimiento Mostrar Tipo Empleado
fetch(url)
    .then(response => response.json())
    .then(data => mostrarEmpleado(data))
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
    const primerNombre = fila.children[2].innerHTML
    const primerApellido = fila.children[4].innerHTML
    console.log(`Id empleado ${id} Nombre ${primerNombre} Apellido ${primerApellido}`)
    {
        Swal.fire({
            html:
                `<b> ¿Está seguro de eliminar el empleado ${primerNombre} ${primerApellido}?</b>` +
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
                        '<b>El empelado fue eliminado!</b>',
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
    const cedulaForm = fila.children[1].innerHTML
    const primerNombreForm = fila.children[2].innerHTML
    const segundoNombreForm = fila.children[3].innerHTML
    const primerApellidoForm = fila.children[4].innerHTML
    const segundoApellidoForm = fila.children[5].innerHTML
    const correoForm = fila.children[6].innerHTML
    const telefonoForm = fila.children[7].innerHTML
    const fechaNacimientoForm = fila.children[8]
    const salarioForm = fila.children[9].innerHTML
    const epsForm = fila.children[10].innerHTML
    const generoForm = fila.children[11].innerHTML
    const telefonoEmergenciaForm = fila.children[12].innerHTML
    let nombre_Rh = fila.children[13].innerHTML
    const nombreTipoEmpleadoForm = fila.children[14].innerHTML
    let rh = document.querySelector("#idRh")
    let te = document.getElementById('idTipoEmpleado')
    cedula.value = cedulaForm
    primerNombre.value = primerNombreForm
    segundoNombre.value = segundoNombreForm
    primerApellido.value = primerApellidoForm
    segundoApellido.value = segundoApellidoForm
    correo.value = correoForm
    telefono.value = telefonoForm
    fechaNacimiento.value = fechaNacimientoForm.innerText
    salario.value = salarioForm
    eps.value = epsForm
    genero.value = generoForm
    telefonoEmergencia.value = telefonoEmergenciaForm
    for (let i = 0; i < 8; i++) {
        if(rh[i].innerText == nombre_Rh){
            rh.value = rh[i].value
        } 
    }
    for (let i = 0; i < 2; i++) {
        if(te[i].innerText == nombreTipoEmpleadoForm){
            te.value = te[i].value
        } 
    }
    modalEmpleado.show()
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
                    cedula: cedula.value,
                    primerNombre: primerNombre.value,
                    segundoNombre: segundoNombre.value,
                    primerApellido: primerApellido.value,
                    segundoApellido:segundoApellido.value,
                    correo:correo.value,
                    contrasena:contrasena.value,
                    telefono:telefono.value,
                    fechaNacimiento:fechaNacimiento.value,
                    salario:salario.value,
                    eps:eps.value,
                    genero:genero.value,
                    telefonoEmergencia:telefonoEmergencia.value,
                    idRh:idRh.value,
                    idTipoEmpleado:idTipoEmpleado.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    const nuevoEmpleado = []
                    nuevoEmpleado.push(data)
                    mostrarEmpleado(nuevoEmpleado)
                    modalEmpleado.hide()

                })
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Empleado Creado Exitosamente',
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
                    cedula: cedula.value,
                    primerNombre: primerNombre.value,
                    segundoNombre: segundoNombre.value,
                    primerApellido: primerApellido.value,
                    segundoApellido:segundoApellido.value,
                    correo:correo.value,
                    telefono:telefono.value,
                    fechaNacimiento:fechaNacimiento.value,
                    salario:salario.value,
                    eps:eps.value,
                    genero:genero.value,
                    telefonoEmergencia:telefonoEmergencia.value,
                    idRh:idRh.value,
                    idTipoEmpleado:idTipoEmpleado.value
                })
            })
                .then(response => response.json())
                modalEmpleado.hide()
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Empleado Actualizado Exitosamente',
                showConfirmButton: false,
                timer: 2000,
            })
        }
        setTimeout(() => {
            location.reload()
        }, 2000);
       
    }
   
})
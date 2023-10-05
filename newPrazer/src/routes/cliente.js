const express = require("express");
const router = express.Router();

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/add", (req, res) => {
  res.render("cliente/add");
});

router.post("/add", async (req, res) => {
  try {
    const { nombre, nit, telefono, direccion } = req.body;
    const newCliente = {
      nombre,
      nit,
      telefono,
      direccion,
    };
    const validarCliente = await pool.query(
      `SELECT  nombre, nit, telefono, direccion from cliente WHERE nit = '${newCliente.nit}'`
    );

    console.log("newCliente", newCliente);
    if (validarCliente.length > 0) {
      console.log("validarCliente", validarCliente);
      if (validarCliente[0].nit == newCliente.nit) {
        req.flash("message", "Cliente YA EXISTE");
        res.redirect("/Cliente");
      }
    } else {
      await pool.query("INSERT INTO cliente set ?", [newCliente]);
      req.flash("success", "Cliente guardado exitosamente");
      res.redirect("/Cliente");
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/", isLoggedIn, async (req, res) => {
  const cliente = await pool.query("SELECT * FROM cliente");
  res.render("cliente/list", { cliente });
});

router.get("/delete/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;
  await pool.query("DELETE FROM cliente WHERE id_cliente = ?", [id_cliente]);
  req.flash("success", "Cliente eliminado exitosamente");
  res.redirect("/Cliente");
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const cliente = await pool.query(
    "SELECT * FROM cliente WHERE id_cliente = ?",
    [id]
  );
  console.log(cliente);
  res.render("cliente/edit", { cliente: cliente[0] });
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, telefono, direccion } = req.body;
  const newCliente = {
    nombre,
    nit,
    telefono,
    direccion,
  };
  const validarCliente = await pool.query(
    `SELECT  nombre, nit, telefono, direccion WHERE id_cliente = ${id}`
  );
  if (
    validarCliente[0].nombre === newCliente.nombre &&
    validarCliente[0].nit === newCliente.nit &&
    validarCliente[0].telefono === newCliente.telefono &&
    validarCliente[0].direccion === newCliente.direccion
  ) {
    req.flash("message", "Cliente no ha cambiado");
    res.redirect("/Cliente");
  } else {
    await pool.query("UPDATE cliente set ? WHERE id_cliente = ?", [
      newCliente,
      id,
    ]);
    req.flash("success", "Cliente actualizado exitosamente");
    res.redirect("/Cliente");
  }
});

router.get("/listFactura/:id_cliente", isLoggedIn, async (req, res) => {
  const { id_cliente } = req.params;
  const factura = await pool.query(
    "SELECT * FROM factura where id_cliente = ?",
    [id_cliente]
  );
  const row = await pool.query(
    "SELECT id_cliente as cliente FROM cliente where id_cliente = ?",
    [id_cliente]
  );
  console.log(row);
  res.render("cliente/listFactura", { factura, row });
});

router.get("/addFactura/:id_cliente", async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const row = await pool.query(
      "SELECT id_cliente as cliente FROM cliente where id_cliente = ?",
      [id_cliente]
    );
    console.log("Add" + row[0].cliente);

    const productosList = await pool.query("SELECT * FROM producto");

    res.render(`cliente/addFactura`, { row: row[0].cliente, productosList });
  } catch (error) {
    // Maneja el error aquí
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/addFactura/:row", async (req, res) => {
  try {
    const { row } = req.params;
    const {
      productosSeleccionados,
      cantidadProductosSeleccionados,
      cantidadBD,
      precio,
    } = req.body;

    const productosFiltrados = [];
    const productosNoValidos = [];
    const productosPedido = []
    if (productosSeleccionados !== undefined) {
      // Itera sobre los productos seleccionados y sus cantidades
      for (let i = 0; i < productosSeleccionados.length; i++) {
        const id_producto = productosSeleccionados[i];
        const cantidad = parseInt(cantidadProductosSeleccionados[i]);
        const cantidadDataBase = parseInt(cantidadBD[i]);
        const precioProducto = parseInt(precio[i]);
        const cantidadNoExcedeDB = cantidad > cantidadDataBase ? false : true;
        const diferencia = cantidadDataBase - cantidad;
        const total = cantidad * precioProducto;

        if (cantidad > 0 && cantidadNoExcedeDB === true) {
          productosFiltrados.push({
            ID: id_producto,
            CANTIDAD: parseInt(cantidad),
            CANTIDADDB: parseInt(cantidadDataBase),
            PRECIO: parseInt(precioProducto),
            CANTIDAD_EXCEDE_DB: cantidadNoExcedeDB,
            DIFERENCIA: diferencia,
            TOTAL: parseInt(total),
          });
        } else if (cantidadNoExcedeDB === false) {
          productosNoValidos.push({
            ID: id_producto,
            CANTIDAD: parseInt(cantidad),
            CANTIDADDB: parseInt(cantidadDataBase),
            CANTIDAD_EXCEDE_DB: cantidadNoExcedeDB,
            DIFERENCIA: diferencia,
          });
        }
      }

      if (productosNoValidos.length > 0) {
        let listaIDs = productosNoValidos.map((producto) => producto.ID);
        req.flash("message", `Hay productos no válidos: ${listaIDs}`);
        return res.redirect("/Cliente");
      }

      const fechaActual = new Date();
      const formatoFecha = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });

      const [
        { value: month },
        ,
        { value: day },
        ,
        { value: year },
        ,
        { value: hour },
        ,
        { value: minute },
        ,
        { value: second },
        ,
        { value: dayPeriod },
      ] = formatoFecha.formatToParts(fechaActual);

      const fechaFormateada = `${year}-${month}-${day} ${hour}:${minute}:${second} ${dayPeriod}`;
      console.log(fechaFormateada);
      const fechaMySQL = await pool.query(
        "SELECT DATE_FORMAT(?, '%Y-%m-%d %H:%i:%s') as fecha",
        [fechaFormateada]
      );
      console.log(fechaMySQL);

      const sumaTotal = productosFiltrados.reduce(
        (total, producto) => total + producto.TOTAL,
        0
      );

      let iva = sumaTotal * 0.19;

      const insertFactura = await pool.query(
        "INSERT INTO factura (total, iva, fecha_factura, factura_oficial, id_empleado, id_cliente) VALUES (?, ?, ?, 'si', ?, ?)",
        [sumaTotal, iva, fechaMySQL[0].fecha, req.user.id, row]
      );
      const id_factura = await pool.query("select id_factura from factura where fecha_factura = ? and id_empleado = ? and id_cliente = ?",[fechaMySQL[0].fecha, req.user.id, row]);
      console.log(id_factura)
      
      for (let i = 0; i < productosFiltrados.length; i++) {
        productosPedido.push({
          ID: productosFiltrados[i].ID,
          CANTIDAD: productosFiltrados[i].CANTIDAD,
          ID_FACTURA: id_factura[0].id_factura // Asegúrate de extraer el valor correcto de id_factura
        });
      }
      
      for (let i = 0; i < productosPedido.length; i++) {
        const insertPedido = await pool.query("INSERT INTO pedido_producto (cantidad_producto, id_producto, id_factura) VALUES (?, ?, ?)", [productosPedido[i].CANTIDAD, productosPedido[i].ID, productosPedido[i].ID_FACTURA]);
      }
      req.flash("success", "Se reciben productos válidos");
      return res.redirect("/Cliente");
    } else {
      req.flash("message", "No ha enviado productos");
      return res.redirect("/Cliente");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/add", (req, res) => {
  res.render("cliente/add");
});

router.post("/validarNombre", async (req, res) => {
  try {
    const { nombre } = req.body;
    const validarNombre = await pool.query(
      `SELECT nombre FROM cliente WHERE nombre = ?`,
      [nombre]
    );

    res.json({ existe: validarNombre.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/validarNit", async (req, res) => {
  try {
    const { nit } = req.body;
    const validarNit = await pool.query(
      `SELECT nit FROM cliente WHERE nit = ?`,
      [nit]
    );

    res.json({ existe: validarNit.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  try {
    const { nombre, nit, telefono, direccion } = req.body;
    const newCliente = {
      nombre,
      nit,
      telefono,
      direccion,
    };
    console.log("newCliente", newCliente);
    await pool.query("INSERT INTO cliente set ?", [newCliente]);
    req.flash(
      "success",
      `El cliente ${newCliente.nombre} ha sido creado exitosamente`
    );
    res.redirect("/Cliente");
  } catch (error) {
    console.log(error);
  }
});

router.get("/:page?", async (req, res) => {
  try {
    const limit = 5;
    const currentPage = req.params.page ? parseInt(req.params.page) : 1;
    const offset = (currentPage - 1) * limit;

    const [results, itemCount] = await Promise.all([
      pool.query("SELECT * FROM cliente LIMIT ? OFFSET ?", [limit, offset]),
      pool.query("SELECT COUNT(*) as itemCount FROM cliente"),
    ]);

    const pageCount = Math.ceil(itemCount[0].itemCount / limit);

    res.render("cliente/list", {
      cliente: results,
      pageCount,
      itemCount: itemCount[0].itemCount,
      currentPage,
      pages: Array.from({ length: pageCount }, (_, i) => i + 1),
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/delete/:id_cliente", isLoggedIn, async (req, res) => {
  const { id_cliente } = req.params;
  const nombre = await pool.query(
    "SELECT nombre FROM cliente WHERE id_cliente = ?",
    [id_cliente]
  );
  console.log(nombre);
  await pool.query("DELETE FROM cliente WHERE id_cliente = ?", [id_cliente]);
  req.flash("success", `El cliente ${nombre} ha sido eliminado exitosamente`);
  res.redirect("/cliente");
});

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const cliente = await pool.query(
    "SELECT * FROM cliente WHERE id_cliente = ?",
    [id]
  );
  console.log(cliente);
  res.render("cliente/edit", { cliente: cliente[0] });
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
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
    req.flash(
      "success",
      `El cliente ${newCliente.nombre} ha sido actualizado exitosamente`
    );
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
      nombreProducto,
    } = req.body;

    const productosFiltrados = [];
    const productosPedido = [];

    console.log(productosSeleccionados, productosSeleccionados.length);

    // Itera sobre los productos seleccionados y sus cantidades
    for (let i = 0; i < productosSeleccionados.length; i++) {
      const id_producto = productosSeleccionados[i];
      const cantidad = parseInt(cantidadProductosSeleccionados[i]);
      const cantidadDataBase = parseInt(cantidadBD[i]);
      const precioProducto = parseInt(precio[i]);
      const diferencia = cantidadDataBase - cantidad;
      const total = cantidad * precioProducto;

      if (cantidad > 0) {
        productosFiltrados.push({
          ID: id_producto,
          CANTIDAD: parseInt(cantidad),
          CANTIDADDB: parseInt(cantidadDataBase),
          PRECIO: parseInt(precioProducto),
          DIFERENCIA: diferencia,
          TOTAL: parseInt(total),
        });
      }
    }
    console.log(productosFiltrados)
    
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
    const id_factura = await pool.query(
      "select id_factura from factura where fecha_factura = ? and id_empleado = ? and id_cliente = ?",
      [fechaMySQL[0].fecha, req.user.id, row]
    );

    for (let i = 0; i < productosFiltrados.length; i++) {
      productosPedido.push({
        ID: productosFiltrados[i].ID,
        CANTIDAD: productosFiltrados[i].CANTIDAD,
        ID_FACTURA: id_factura[0].id_factura, // Asegúrate de extraer el valor correcto de id_factura
        DIFERENCIA: productosFiltrados[i].DIFERENCIA,
      });
    }

    for (let i = 0; i < productosPedido.length; i++) {
      const insertPedido = await pool.query(
        "INSERT INTO pedido_producto (cantidad_producto, id_producto, id_factura) VALUES (?, ?, ?)",
        [
          productosPedido[i].CANTIDAD,
          productosPedido[i].ID,
          productosPedido[i].ID_FACTURA,
        ]
      );

      const updatePedido = await pool.query(
        "UPDATE producto SET cantidad = ? WHERE id_producto = ?",
        [productosPedido[i].DIFERENCIA, productosPedido[i].ID]
      );
    }
    console.log("productosFiltrados", productosFiltrados);
    console.log("productosPedido", productosPedido);
    req.flash("success", "Se ha recibido correctamente tu pedido");
    return res.redirect("/Cliente");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error interno del servidor");
  }
});

router.get("/showFactura/:id_factura", async (req, res) => {
  try {
    const { id_factura } = req.params;
    const cliente = await pool.query(
      ` SELECT distinct
          B.*,A.fecha_factura
        FROM 
          factura AS A 
        INNER JOIN 
          cliente B 
            ON A.id_cliente = B.id_cliente 
        WHERE 
          A.id_factura = ?
        limit 1`,
      [id_factura]
    );
    console.log(cliente);
    let row = cliente[0].id_cliente;
    console.log(row);
    const productosList = await pool.query(
      `SELECT 
          b.id_producto,
          c.nombre,
          b.cantidad_producto,
          c.precio,
          (b.cantidad_producto*c.precio) as subtotal
      FROM 
        factura AS A
      LEFT JOIN 
        pedido_producto AS B
          ON A.id_factura = B.id_factura
      INNER JOIN 
        producto AS C
          ON B.id_producto = C.id_producto 
      WHERE A.id_factura = ${id_factura}`
    );

    const total = await pool.query(
      `WITH base as 
          ( SELECT 
            b.id_producto, 
            c.nombre, 
            b.cantidad_producto, 
            c.precio,
            (b.cantidad_producto*c.precio) as subtotal 
            FROM 
              factura AS A 
            LEFT JOIN 
              pedido_producto AS B 
                ON A.id_factura = B.id_factura 
            INNER JOIN 
              producto AS C 
                ON B.id_producto = C.id_producto 
            WHERE A.id_factura = ${id_factura}
          ) 
            SELECT 
              SUM(subtotal) as total
            from base`
    );
    console.log(productosList);
    console.log(total);
    res.render(`cliente/showFactura`, { cliente, productosList, total, row });
  } catch (error) {
    // Maneja el error aquí
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

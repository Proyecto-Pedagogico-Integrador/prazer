const express = require("express");
const router = express.Router();

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/", isLoggedIn, async (req, res) => {
  const factura = await pool.query(
    `WITH base AS (
      SELECT 
          llave AS id_factura,
          id_producto,
          nombre_producto,
          cantidad,
          precio_unitario,
          subtotal
      FROM detalle_factura
  ),
  totales AS (
      SELECT 
          id_factura,
          SUM(subtotal) * 0.19 AS iva,
          SUM(subtotal) + (SUM(subtotal) * 0.19) AS total
      FROM base
      GROUP BY id_factura
  )
  SELECT 
      a.nombre_cliente,
      a.nit,
      a.fecha_factura,
      b.iva,
      b.total,
      a.empleado,
      a.llave as id_factura
  FROM detalle_factura a
  INNER JOIN totales b 
      ON a.llave = b.id_factura
  GROUP BY 
      a.nombre_cliente,
      a.nit,
      a.fecha_factura,
      a.empleado,
      a.llave,
      b.iva,
      b.total;
  `
  );
  res.render("factura/listFactura", { factura });
});

router.get("/addFactura", async (req, res) => {
  try {
    const productosList = await pool.query(
      "SELECT * FROM producto where cantidad > 0"
    );
    const clienteList = await pool.query("SELECT * FROM cliente");
    res.render(`factura/addFactura`, { productosList, clienteList });
  } catch (error) {
    // Maneja el error aquí
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/addFactura", async (req, res) => {
  try {
    const {
      productosSeleccionados,
      cantidadProductosSeleccionados,
      cantidadBD,
      precio,
      nombreProducto,
      row,
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
    console.log(productosFiltrados);

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
    let total = sumaTotal + iva;

    const insertFactura = await pool.query(
      "INSERT INTO factura (total, iva, fecha_factura, factura_oficial, id_empleado, id_cliente) VALUES (?, ?, ?, 'si', ?, ?)",
      [total, iva, fechaMySQL[0].fecha, req.user.id, row]
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

    const insertDetalleFactura = await pool.query(
      `INSERT INTO detalle_factura (
          nombre_cliente,
          nit,
          direccion,
          id_producto,
          nombre_producto,
          cantidad,
          precio_unitario,
          subtotal,
          total,
          fecha_factura,
          llave,
          empleado,
          id_factura
      )
      SELECT
          c.nombre as nombre_cliente,
          c.id_cliente as nit,
          c.direccion,
          pd.id_producto,
          p.nombre as nombre_producto,
          pd.cantidad_producto as cantidad,
          p.precio as precio_unitario,
          (pd.cantidad_producto * p.precio) as subtotal,
          (pd.cantidad_producto * p.precio) as total,
          '${fechaMySQL[0].fecha}' as fecha_factura,
          ${productosPedido[0].ID_FACTURA} as llave,
          '${req.user.username}' as empleado,
          ${productosPedido[0].ID_FACTURA} as id_factura
      FROM factura f
      INNER JOIN cliente c
          ON f.id_cliente = c.id_cliente
      INNER JOIN pedido_producto pd
          ON f.id_factura = pd.id_factura
      INNER JOIN producto p
          ON pd.id_producto = p.id_producto
      WHERE f.id_factura =  ${productosPedido[0].ID_FACTURA}`
    );
    console.log("productosFiltrados", productosFiltrados);
    console.log("productosPedido", productosPedido);
    console.log(insertDetalleFactura);
    req.flash("success", "Se ha recibido correctamente tu pedido");
    return res.redirect("/factura");
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
            nombre_cliente,
            nit,
            direccion
          FROM detalle_factura
          WHERE llave = ?`,
      [id_factura]
    );
    console.log(cliente);

    const productosList = await pool.query(
      `SELECT 
            id_producto,
            nombre_producto,
            cantidad,
            precio_unitario,
            subtotal
        FROM detalle_factura
        WHERE llave = ${id_factura}`
    );

    const total = await pool.query(
      `WITH base as 
            ( SELECT 
                id_producto,
                nombre_producto,
                cantidad,
                precio_unitario,
                subtotal
              FROM detalle_factura
              WHERE llave = ${id_factura}
            ) 
              SELECT 
                SUM(subtotal) as total
              from base`
    );

    const total_iva = total[0].total + total[0].total * 0.19;
    console.log(productosList);
    console.log(total);
    res.render(`factura/showFactura`, {
      cliente,
      productosList,
      total,
      total_iva
    });
  } catch (error) {
    // Maneja el error aquí
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

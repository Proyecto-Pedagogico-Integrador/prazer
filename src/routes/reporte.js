const express = require("express");
const router = express.Router();

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/", async (req, res) => {
  try {
    const cantidadMaxima = await pool.query(
      `SELECT 
        nombre, 
        cantidad as atributo,
        'cantidad maxima' as tipo 
      FROM producto 
      order by cantidad desc 
      limit 1`
    );

    const cantidadMinima = await pool.query(
      `SELECT 
        nombre, 
        cantidad as atributo, 
        'cantidad minima' as tipo 
      FROM producto 
      order by cantidad asc 
      limit 1`
    );

    const precioMayor = await pool.query(
      `SELECT 
        nombre, 
        precio as atributo, 
        'precio mas alto' as tipo 
      FROM producto 
      order by precio desc 
      limit 1`
    );

    const precioMenor = await pool.query(
      `SELECT 
        nombre, 
        precio as atributo,
        'precio mas bajo' as tipo 
      FROM producto 
      order by precio asc 
      limit 1
      `
    );

    res.render("reporte/listReporte", {
      cantidadMaxima,
      cantidadMinima,
      precioMayor,
      precioMenor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get(
  "/listFacturaReporte/:fechaInicio/:fechaFin",
  isLoggedIn,
  async (req, res) => {
    const { fechaInicio, fechaFin } = req.params; // Obtener las fechas del parámetro de la URL
    try {
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
      SELECT DISTINCT
          a.llave AS id_factura,
          a.nombre_cliente,
          a.fecha_factura,
          b.iva,
          b.total
      FROM detalle_factura a
      INNER JOIN totales b 
          ON a.llave = b.id_factura
      WHERE a.fecha_factura BETWEEN ? AND ?`,
        [fechaInicio + " 00:00:00", fechaFin + " 23:59:59"]
      );
      console.log(factura);
      res.json({ factura });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

module.exports = router;

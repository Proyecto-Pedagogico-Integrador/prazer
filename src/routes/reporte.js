const express = require('express');
const router = express.Router();

const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get('/', async (req, res) => {
  try {
    const cantidadMaxima = await pool.query(
      `SELECT 
        nombre, 
        cantidad as atributo,
        'cantidad maxima' as tipo 
      FROM producto 
      order by cantidad desc 
      limit 1`);
    
    const cantidadMinima = await pool.query(
      `SELECT 
        nombre, 
        cantidad as atributo, 
        'cantidad minima' as tipo 
      FROM producto 
      order by cantidad asc 
      limit 1`);

    const precioMayor = await pool.query(
      `SELECT 
        nombre, 
        precio as atributo, 
        'precio mas alto' as tipo 
      FROM producto 
      order by precio desc 
      limit 1`);

    const precioMenor = await pool.query(
      `SELECT 
        nombre, 
        precio as atributo,
        'precio mas bajo' as tipo 
      FROM producto 
      order by precio asc 
      limit 1
      `)

    res.render('reporte/listReporte',{ cantidadMaxima, cantidadMinima, precioMayor, precioMenor});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
    
  });

  router.get("/listFacturaReporte/:fechaInicio/:fechaFin", isLoggedIn, async (req, res) => {
    const { fechaInicio, fechaFin } = req.params; // Obtener las fechas del parámetro de la URL
    try {
        const factura = await pool.query(
            `SELECT 
                f.id_factura, 
                c.nombre, 
                f.fecha_factura, 
                f.iva, 
                f.total 
            FROM factura f
            INNER JOIN cliente c
                ON f.id_cliente = c.id_cliente
            WHERE fecha_factura BETWEEN ? AND ?`,
            [fechaInicio + ' 00:00:00', fechaFin + ' 23:59:59']
        );
        console.log(factura)
        res.json({ factura});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
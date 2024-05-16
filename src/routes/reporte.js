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

  router.get("/listFacturaReporte", isLoggedIn, async (req, res) => {
    const fechaConsulta = req.query.fecha; // Obtener la fecha del query string
  
    try {
      const factura = await pool.query(
        "SELECT factura.id_factura, cliente.nombre, factura.fecha_factura, factura.iva, factura.total FROM factura INNER JOIN cliente WHERE fecha_factura BETWEEN ? AND ?",
        [fechaConsulta + ' 00:00:00', fechaConsulta + ' 23:59:59']
      );
  
      res.render("reporte/listFacturaReporte", { factura });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  });

module.exports = router;
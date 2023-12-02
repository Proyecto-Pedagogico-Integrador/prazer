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

module.exports = router;
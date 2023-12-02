const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('reporte/listReporte');
  });

module.exports = router;
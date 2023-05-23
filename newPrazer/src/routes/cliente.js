const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('cliente/add');
});

router.post("/add", async (req, res) => {
    try {
        const { nombre, nit, telefono, direccion } = req.body
        const newCliente = {
            nombre, 
            nit, 
            telefono, 
            direccion
        }
        await pool.query('INSERT INTO cliente set ?',[newCliente]);
        req.flash('success', 'Cliente guardado exitosamente');
        res.redirect('/cliente');
    } catch (error) {
        console.log(error)
    }
})

router.get('/', isLoggedIn, async (req, res) => {
    const cliente = await pool.query('SELECT * FROM cliente');
    res.render('cliente/list', { cliente });
});

router.get('/delete/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;
    await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [id_cliente]);
    req.flash('success', 'Cliente eliminado exitosamente');
    res.redirect('/Cliente');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const cliente = await pool.query('SELECT * FROM cliente WHERE id_cliente = ?', [id]);
    console.log(cliente);
    res.render('cliente/edit', {cliente: cliente[0]});
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, nit, telefono, direccion } = req.body
    const newCliente = {
        nombre, 
        nit, 
        telefono, 
        direccion
    }
    await pool.query('UPDATE cliente set ? WHERE id_cliente = ?', [newCliente, id]);
    req.flash('success', 'Cliente actualizado exitosamente');
    res.redirect('/Cliente');
});

router.get('/listFactura/:id_cliente', isLoggedIn, async (req, res) => {
    const { id_cliente } = req.params;
    const factura = await pool.query('SELECT * FROM factura where id_cliente = ?',[id_cliente]);
    const row =  await pool.query('SELECT id_cliente as cliente FROM cliente where id_cliente = ?',[id_cliente]);
    console.log(row)
    res.render('cliente/listFactura', { factura,row });
});

router.get('/addFactura/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;
    const row =  await pool.query('SELECT id_cliente as cliente FROM cliente where id_cliente = ?',[id_cliente]);
    console.log("Add"+row)
    const producto = await pool.query('SELECT * FROM producto')
    res.render(`cliente/addFactura`,{row,producto});
});

module.exports = router;

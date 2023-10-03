const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('producto/add');
});

router.post("/add", async (req, res) => {
    try {
        const { nombre, precio, peso, cantidad } = req.body
        const newProducto = {
            nombre, 
            precio, 
            peso, 
            cantidad
        }
        const nombreWithoutSpaces = nombre.replace(/\s/g, '');

        const validarProducto = await pool.query(`SELECT REPLACE(TRIM(BOTH ' ' FROM nombre), ' ', '') as nombre, precio, peso,cantidad FROM producto WHERE REPLACE(TRIM(BOTH ' ' FROM nombre), ' ', '') = '${nombreWithoutSpaces}'`);
        console.log('validarProducto',validarProducto);
        console.log('newProducto',nombreWithoutSpaces);
        
        if (validarProducto[0].nombre === nombreWithoutSpaces){
            req.flash('message', 'El producto ya existe');
            res.redirect('/producto');
        }else{
            await pool.query('INSERT INTO producto set ?',[newProducto]);
            req.flash('success', 'Producto guardado exitosamente');
            res.redirect('/producto');
        }
       
    } catch (error) {
        console.log(error)
    }
})


router.get('/', isLoggedIn, async (req, res) => {
    const producto = await pool.query('SELECT * FROM producto');
    res.render('producto/list', { producto });
});

router.get('/delete/:id_producto', async (req, res) => {
    const { id_producto } = req.params;
    await pool.query('DELETE FROM producto WHERE id_producto = ?', [id_producto]);
    req.flash('success', 'Producto eliminado exitosamente');
    res.redirect('/producto');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const producto = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
    console.log(producto);
    res.render('producto/edit', {producto: producto[0]});
});


router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, peso, cantidad } = req.body;
    const newProducto = {
        nombre,
        precio,
        peso,
        cantidad
    }

    const validarProducto = await pool.query(`SELECT nombre, precio, peso, cantidad FROM producto WHERE id_producto = ${id}`);
    console.log('validarProducto:', validarProducto);
    console.log('newProducto:', newProducto);

    // Check if the properties of validarProducto match the properties of newProducto
    if (
        validarProducto[0].nombre === newProducto.nombre &&
        validarProducto[0].precio === newProducto.precio &&
        validarProducto[0].peso === newProducto.peso &&
        validarProducto[0].cantidad === newProducto.cantidad
    ) {
        req.flash('message', 'Producto no ha cambiado');
        res.redirect('/producto');
    } else {
        await pool.query('UPDATE producto SET ? WHERE id_producto = ?', [newProducto, id]);
        req.flash('success', 'Producto actualizado exitosamente');
        res.redirect('/producto');
    }
});


module.exports = router;
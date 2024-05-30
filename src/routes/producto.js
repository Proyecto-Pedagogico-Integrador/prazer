const express = require("express");
const router = express.Router();
const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");

router.get("/add", (req, res) => {
  res.render("producto/add");
});

router.post("/validarNombre", async (req, res) => {
  try {
    const { nombre } = req.body;
    const validarNombre = await pool.query(
      `SELECT nombre FROM producto WHERE nombre = ?`,
      [nombre]
    );

    res.json({ existe: validarNombre.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/validarCodigo", async (req, res) => {
  try {
    const { codigo } = req.body;
    const validarCodigo = await pool.query(
      `SELECT id_producto FROM producto WHERE id_producto = ?`,
      [codigo]
    );

    res.json({ existe: validarCodigo.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  try {
    const { nombre, precio, peso, cantidad } = req.body;
    const newProducto = { nombre, precio, peso, cantidad };
    await pool.query("INSERT INTO producto SET ?", [newProducto]);
    req.flash(
      "success",
      `El producto ${newProducto.nombre} ha sido creado exitosamente`
    );
    res.redirect("/producto");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query = '', page = 1 } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;

    const results = await pool.query(
      "SELECT * FROM producto WHERE LOWER(nombre) LIKE ? LIMIT ? OFFSET ?", 
      [`%${query.toLowerCase()}%`, limit, offset]
    );

    const itemCountResult = await pool.query(
      "SELECT COUNT(*) as itemCount FROM producto WHERE LOWER(nombre) LIKE ?", 
      [`%${query.toLowerCase()}%`]
    );
    const itemCount = itemCountResult[0].itemCount;

    const pageCount = Math.ceil(itemCount / limit);

    res.json({
      productos: results,
      pageCount,
      itemCount,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:page?", async (req, res) => {
  try {
    const limit = 5;
    const currentPage = req.params.page ? parseInt(req.params.page) : 1;
    const offset = (currentPage - 1) * limit;

    const [results, itemCount] = await Promise.all([
      pool.query("SELECT * FROM producto LIMIT ? OFFSET ?", [limit, offset]),
      pool.query("SELECT COUNT(*) as itemCount FROM producto"),
    ]);

    const pageCount = Math.ceil(itemCount[0].itemCount / limit);

    res.render("producto/list", {
      producto: results,
      pageCount,
      itemCount: itemCount[0].itemCount,
      currentPage,
      pages: Array.from({ length: pageCount }, (_, i) => i + 1),
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/delete/:id_producto", async (req, res) => {
  const { id_producto } = req.params;
  try {
    await pool.query("DELETE FROM producto WHERE id_producto = ?", [id_producto]);
    req.flash("success", "Producto eliminado exitosamente");
    res.redirect("/producto");
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    req.flash("error", "Hubo un error al intentar eliminar el producto");
    res.redirect("/producto");
  }
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await pool.query("SELECT * FROM producto WHERE id_producto = ?", [id]);
    res.render("producto/edit", { producto: producto[0] });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    req.flash("error", "Hubo un error al obtener el producto");
    res.redirect("/producto");
  }
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, peso, cantidad } = req.body;
  const newProducto = { nombre, precio, peso, cantidad };

  try {
    await pool.query("UPDATE producto SET ? WHERE id_producto = ?", [newProducto, id]);
    req.flash("success", "Producto actualizado exitosamente");
    res.redirect("/producto");
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    req.flash("error", "Hubo un error al intentar actualizar el producto");
    res.redirect("/producto");
  }
});

module.exports = router;

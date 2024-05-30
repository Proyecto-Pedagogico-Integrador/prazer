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

router.post("/validarIdCliente", async (req, res) => {
  try {
    const { id_cliente } = req.body;
    const validarIdCliente = await pool.query(
      `SELECT id_cliente FROM cliente WHERE id_cliente = ?`,
      [id_cliente]
    );

    res.json({ existe: validarIdCliente.length > 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  try {
    const { id_cliente, nombre, telefono, direccion } = req.body;
    const newCliente = { id_cliente, nombre, telefono, direccion };
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

router.get("/search", async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;

    const results = await pool.query(
      "SELECT * FROM cliente WHERE LOWER(nombre) LIKE ? ORDER BY nombre ASC LIMIT ? OFFSET ?",
      [`%${query.toLowerCase()}%`, limit, offset]
    );

    const itemCountResult = await pool.query(
      "SELECT COUNT(*) as itemCount FROM cliente WHERE LOWER(nombre) LIKE ?",
      [`%${query.toLowerCase()}%`]
    );
    const itemCount = itemCountResult[0].itemCount;

    const pageCount = Math.ceil(itemCount / limit);

    res.json({
      clientes: results,
      pageCount,
      itemCount,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:page?", async (req, res) => {
  try {
    const limit = 5;
    const currentPage = req.params.page ? parseInt(req.params.page) : 1;
    const offset = (currentPage - 1) * limit;

    const [results, itemCount] = await Promise.all([
      pool.query(
        "SELECT id_cliente, nombre, telefono, direccion FROM cliente ORDER BY nombre ASC LIMIT ? OFFSET ? ",
        [limit, offset]
      ),
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
  try {
    const nombre = await pool.query(
      "SELECT nombre FROM cliente WHERE id_cliente = ?",
      [id_cliente]
    );
    if (!nombre.length) {
      throw new Error("Cliente no encontrado");
    }

    let facturas = await pool.query(
      "SELECT id_factura FROM factura WHERE id_cliente = ?",
      [id_cliente]
    );

    for (let i = 0; i < facturas.length; i++) {
      await pool.query("DELETE FROM pedido_producto WHERE id_factura = ?", [
        facturas[i].id_factura,
      ]);
      await pool.query(
        `UPDATE detalle_factura SET id_factura = NULL WHERE id_factura = ${facturas[i].id_factura}`
      );
    }

    await pool.query("DELETE FROM factura WHERE id_cliente = ?", [id_cliente]);

    await pool.query("DELETE FROM cliente WHERE id_cliente = ?", [id_cliente]);

    req.flash(
      "success",
      `El cliente ${nombre[0].nombre} ha sido eliminado exitosamente`
    );
    res.redirect("/cliente");
  } catch (err) {
    console.error("Error ejecutando las consultas:", err);
    req.flash("error", "Hubo un error al intentar eliminar el cliente.");
    res.redirect("/cliente");
  }
});

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const cliente = await pool.query(
    "SELECT * FROM cliente WHERE id_cliente = ?",
    [id]
  );
  res.render("cliente/edit", { cliente: cliente[0] });
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { id_cliente, nombre, telefono, direccion } = req.body;
  const newCliente = { id_cliente, nombre, telefono, direccion };

  const validarCliente = await pool.query(
    "SELECT  id_cliente, nombre, telefono, direccion FROM cliente WHERE id_cliente = ?",
    [id]
  );

  if (
    validarCliente[0].nombre === newCliente.nombre &&
    validarCliente[0].id_cliente === newCliente.id_cliente &&
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

module.exports = router;

const { Router } = require("express");
const router = Router();
const DB = require("../config/config.js");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Ruta status 200 BUMBUM",
  });
});



router.get("/productos", async (req, res) => {
  try {
    let sql = `SELECT * FROM PRODUCTO`;
    let productoBD = [];
    let result = await DB.Open(sql, [], false);
    result.rows.map((producto) => {
      let userSchema = {
        ID_PRODUCTO: producto[0],
        NOMBRE: producto[1],
        PRECIO: producto[2],
        PESO: producto[3],
        CANTIDAD: producto[4]
      };
      productoBD.push(userSchema);
    });
    console.log(productoBD);
    res.json(productoBD);
  } catch (error) {
    console.log(error);
  }
});
router.post("/register", async (req, res) => {
  //Se recibe la informaciond del frontend
  const {
    usuario,
    nombre1,
    nombre2,
    apellido1,
    apellido2,
    email,
    password,
    password2,
  } = req.body;
  //Se comparan las contraseñas enviadas por el frontend
  if (password !== password2)
    return res
      .status(400)
      .json({ msg: "Contraseña y confirmar contraseña son incorrectos." });

  //Se modifica la contraseña enviada
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  //Se crea el usuario en la bd.
  sql =
    "INSERT INTO usuarios(id_usuario,primer_nombre,segundo_nombre,primer_apellido,segundo_apellido,correo,contrasena,usuario) VALUES (id_usuario.nextval,:nombre1,:nombre2,:apellido1,:apellido2,:email,:hashPassword,:usuario)";
  try {
    await DB.Open(
      sql,
      [nombre1, nombre2, apellido1, apellido2, email, hashPassword, usuario],
      true
    );

    res.json({
      message: "Todo bien todo correcto y yo me que alegro",
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;

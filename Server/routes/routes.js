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

router.delete("/productos/:id", async(req, res) =>{
  try {
    const {id} = req.params;
    console.log(id)
    let sql = 'Delete from producto where id_producto = :id'
    let result = await DB.Open(sql, [id], true);
    console.log('Eliminado', result)
    res.json(result)
  } catch (error) {
    console.log(error)
  }
})

router.post("/productos", async(req, res) =>{
  try {
    const {nombre, precio, peso, cantidad} = req.body
    let sql = 'Insert into PRODUCTO (ID_PRODUCTO,NOMBRE,PRECIO,PESO,CANTIDAD) values (id_producto.nextval,:nombre,:precio,:peso,:cantidad)'
    await DB.Open(sql, [nombre, precio, peso, cantidad], true)
    res.json({
      message: "Todo bien todo correcto y yo me que alegro",
    });
  } catch (error) {
    console.log(error)
  }
 

})

router.put("/productos/:id", async(req,res)=>{
  try {
    const {id} = req.params;
    console.log(id)
    const {nombre, precio, peso, cantidad} = req.body
    let sql = 'Update producto set nombre = :nombre, precio = :precio, peso =:peso, cantidad =:cantidad where id_producto =:id'
    await DB.Open(sql, [nombre, precio, peso, cantidad, id], true)
    console.log(`producto actualizado`)
  } catch (error) {
    console.log(error)
  }
})

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





//Servicios para materia prima

router.get("/materiaPrima", async (req, res) => {
  try {
    let sql = `SELECT * FROM MATERIA_PRIMA`;
    let mPrimaBD = [];
    let result = await DB.Open(sql, [], false);
    result.rows.map((mPrima) => {
      let userSchema = {
        ID_MATERIA_PRIMA: mPrima[0],
        NOMBRE: mPrima[1],
        COSTO: mPrima[2],
        CANTIDAD: mPrima[3],
        ID_PROVEEDOR: mPrima[4]
      };
      mPrimaBD.push(userSchema);
    });
    console.log(mPrimaBD);
    res.json(mPrimaBD);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/materiaPrima/:id", async(req, res) =>{
  try {
    const {id} = req.params;
    console.log(id)
    let sql = 'Delete from MATERIA_PRIMA where ID_MATERIA_PRIMA = :id'
    let result = await DB.Open(sql, [id], true);
    console.log('Eliminado', result)
    res.json(result)
  } catch (error) {
    console.log(error)
  }
})

router.post("/materiaPrima", async(req, res) =>{
  try {
    const {nombre, costo, cantidad, proveedor} = req.body
    let sql = 'Insert into MATERIA_PRIMA (ID_MATERIA_PRIMA,NOMBRE,COSTO,CANTIDAD,ID_PROVEEDOR) values (id_producto.nextval,:nombre,:costo,:cantidad,:proveedor)'
    await DB.Open(sql, [nombre, costo, cantidad, proveedor], true)
    res.json({
      message: "Todo bien todo correcto y yo me que alegro",
    });
  } catch (error) {
    console.log(error)
  }
})

router.put("/materiaPrima/:id", async(req,res)=>{
  try {
    const {id} = req.params;
    console.log(id)
    const {nombre, costo, cantidad, proveedor} = req.body
    let sql = 'Update MATERIA_PRIMA set NOMBRE = :nombre, COSTO = :costo, CANTIDAD =:cantidad, ID_PROVEEDOR =:proveedor where ID_MATERIA_PRIMA =:id'
    await DB.Open(sql, [nombre, costo, cantidad, proveedor, id], true)
    console.log(`Materia prima actualizado`)
  } catch (error) {
    console.log(error)
  }
})

//Servicio para proveedores

router.get("/proveedor", async (req, res) => {
  try {
    let sql = `SELECT * FROM PROVEEDOR`;
    let proveedorBD = [];
    let result = await DB.Open(sql, [], false);
    result.rows.map((proveedor) => {
      let userSchema = {
        ID_PROVEEDOR: proveedor[0],
        NOMBRE: proveedor[1],
        DIRECCION: proveedor[2],
      };
      proveedorBD.push(userSchema);
    });
    console.log(proveedorBD);
    res.json(proveedorBD);
  } catch (error) {
    console.log(error);
  }
});
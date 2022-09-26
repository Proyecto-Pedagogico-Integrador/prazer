const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const router = require('../routes/routes');
// Configuraciones

app.set('port', 4000);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors()); //Dar permisos para usar la api
app.use(router);

app.listen(app.get('port'), () => {
   console.log(`Server status 200 on port ${app.get('port')}`)
});
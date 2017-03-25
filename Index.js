var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var loug = require('loug');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', function (socket) {

    console.log('user connect');
    /*socket.on('disconnect', function () {
        console.log('Usuario desconectado');
    });*/

    //establecer las variables para la conexion
    var connection = mysql.createConnection({

     
    });

    //conectar a la base de datos
    connection.connect(function (error) {

        if (error) {
            throw error;
        } else {
            console.log('Conexion Correcta');
        }
    });
    /**
     * 
     * @param {Number} fila Fila es la variable que viene del for para encontrar la Columna del registro
     * @param {Number} index index es una variable la cual sirve para para encontrar la FILA del registro  
     * @param {Number} agente agente es el agente que se está buscando en los registros
     */
    function ConsultarPosicion(fila, index, agente) {
        return new Promise((resolve, reject) => {
            var query = connection.query('select C' + fila + ', IdFilas from tablero where IdFilas=' + index + ' and C' + fila + ' IN (' + agente + ')', [], function (error, result) {
                //  loug('resultado =>', result);
                if (error) {
                    // throw error;
                    return reject(error);
                } else {
                    var resultado = result;
                    if (resultado.length > 0) {
                        // loug(fila, index);
                        //   loug('fila',fila);
                        //    loug(resultado);
                        // return;
                        //      prueeba1 = JSON.stringify(resultado);
                        //    prueba = Object.keys(resultado);

                        return resolve({
                            Columna: fila,
                            Fila: index
                        });
                    } else {
                        //  return reject('registro no encontrado');
                        // console.log('Registro no encontrado');
                    }
                }
            });

        })

    }
    /**
     * 
     * @param {Number} agente El agente que se esta buscando en la base de datos
     */
    function EncontrarAgente(agente) {
        return new Promise((resolve, reject) => {
            for (var fila = 1; fila < 11; fila++) {
                posicion = 0;
                for (var index = 1; index < 4; index++) {
                    ConsultarPosicion(fila, index, agente).then(values => {
                        return resolve(values);
                    })
                }
            }

        })

    }

    function MoverAgente1() {
        //traigo el movimiento del agente
        var query = connection.query('select * from agente1', [], function (error, result) {
            // Valido si trajo algo la base de datos
            if (error) {
                throw error;
            } else {
                var resultado = result;
                if (resultado.length > 0) {

                    var movi = JSON.parse(JSON.stringify(result))[0];
                    console.log('movi==>', movi);

                    //console.log('result2', result2);
                    //   console.log(movi.Movimiento);
                    EncontrarAgente(1).then(result2 => {
                        if (movi.Movimiento == 2) {
                            // loug(result2.Posicion, result2.Filaposicion);
                            MoverColumna = result2.Columna + 1;
                            MoverFila = result2.Fila - 1;
                            if (MoverFila != 0 && MoverColumna != 10 && MoverColumna != 0) {
                                // console.log(MoverColumna, MoverFila);
                                var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                            } else {
                                console.log('movimiento invalido');
                            }
                        }
                    })
                    // return;
                } else {
                    console.log('Registro no encontrado');
                }
            }
        });
    }

    function GenerarObstaculos() {

        var cont = 0;
        var cont2 = Math.floor(Math.random() * (4 - 1) + 1);
        //Borrar todos los obstaculos anteriores
        for (con2 = 3; con2 < 9; con2++) {
            for (var index = 1; index < 4; index++) {

                var query = connection.query('update tablero set C' + con2 + '=0 where IdFilas=' + index + ' and C' + con2 + ' IN(3);');
            }
        }

        //Generar obstaculos 
        for (con2 = 3; con2 < 9; con2++) {

            cont2 = Math.floor(Math.random() * (4 - 1) + 1);
            while (cont == cont2) {
                cont2 = Math.floor(Math.random() * (3 - 1) + 1);
            }
            var query = connection.query('update tablero set C' + con2 + '=3 where IdFilas=' + cont2 + ' and C' + con2 + ' IN(0);');
            cont = cont2;
        }
    };

    // hacer la consulta 
    function EnviarDatos() {
        socket.emit('Cargar Datos', function (resultado) {
            var query = connection.query('SELECT * from tablero;', [], function (error, result) {
                if (error) {
                    throw error;
                } else {
                    var resultado = result;
                    if (resultado.length > 0) {
                        io.emit('Cargar Datos', result);
                        //  io.emit('Cargar Datos', valores.split(separador));
                    } else {
                        console.log('Registro no encontrado');
                    }
                }
            });
        });
    };

    MoverAgente1();
    //  EncontrarAgente(1);
    EnviarDatos();
    setInterval(() => {
        EnviarDatos();
    }, 1000);

    setInterval(() => {

        GenerarObstaculos();
    }, 3000);


});
http.listen(3000, function () {
    console.log('Corriendo en el puerto 3000');
});
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var loug = require('loug');
app.use(express.static('Img'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

var connection = mysql.createConnection({
    /* host: '191.102.85.226',
      user: 'admin_ia',
      password: 'ia.giecom-1720',
      database: 'tableroia',
      port: 3306*/

    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bdtablero',
    port: 3306


});

//conectar a la base de datos
connection.connect(function (error) {

    if (error) {
        throw error;
    } else {
        console.log('Conexion Correcta');
    }
});
io.on('connection', function (socket) {

    console.log('user connect');
    var clientIp = socket.request.connection.remoteAddress;
    console.log('eventName', {
        ip: clientIp
    });
    /*socket.on('disconnect', function () {
        console.log('Usuario desconectado');
    });*/

    //establecer las variables para la conexion

    /**
     * 
     * @param {Number} fila Fila es la variable que viene del for para encontrar la Columna del registro
     * @param {Number} index index es una variable la cual sirve para para encontrar la FILA del registro  
     * @param {Number} agente agente es el agente que se está buscando en los registros
     */
    function ConsultarPosicion(fila, index, agente) {
        return new Promise((resolve, reject) => {
            var query = connection.query('select C' + fila + ', IdFilas from tablero where IdFilas=' + index + ' and C' + fila + ' IN (' + agente + ')', [], function (error, result) {
                if (error) {
                    return reject(error);
                } else {
                    var resultado = result;
                    if (resultado.length > 0) {
                        return resolve({
                            Columna: fila,
                            Fila: index
                        });
                    } else {

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

    function EncontrarObstaculo(Columna, fila) {
        return new Promise((resolve, reject) => {
            loug(Columna);
            if (Columna != 0 && Columna != 11 && fila != 0 && fila != 4) {
                var query = connection.query('select C' + Columna + ', IdFilas from tablero where IdFilas=' + fila + ' and C' + Columna + ' IN (0)', [], function (error, result) {
                    if (error) {
                        throw error;
                    } else {
                        var resultado = result;
                        var estado = true;
                        if (resultado.length > 0) {
                            estado = true;
                            console.log('Obstaculo no encontrado');
                            return resolve(estado);

                        } else {
                             estado = false;
                            loug('obstaculo encontrado');
                            return resolve(estado)
                           

                        }
                    }

                })
            }
        })

    }

    function MoverAgente1() {
        //traigo el movimiento del agente
        var query = connection.query('select Movimiento from agente1', [], function (error, result) {
            // Valido si trajo algo la base de datos
            if (error) {
                throw error;
            } else {
                var resultado = result;
                var movi = JSON.parse(JSON.stringify(result))[0];

                if (resultado.length > 0) {
                    if (movi.Movimiento != 0) {
                        loug('movimiento agente 1=>', movi.Movimiento)
                        // encuentro en que posicion esta el agente
                        EncontrarAgente(1).then(result2 => {
                            loug('lo encuentra');
                            if (movi.Movimiento == 1) {
                                var MoverColumna = result2.Columna;
                                var MoverFila = result2.Fila - 1;
                                var EstadoObstaculo;
                                //Valiido si existen obstaculos en la posicion que me voy a mover
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    // valido que el agente no se salga de los limites y que no se mueva donde este un obstaculo
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 2) {

                                var MoverColumna = result2.Columna + 1;
                                var MoverFila = result2.Fila - 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {
                                        loug('movimiento 2');
                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 3) {
                                MoverColumna = result2.Columna + 1;
                                MoverFila = result2.Fila;
                                var EstadoObstaculo;
                                loug(EstadoObstaculo);
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 4) {
                                MoverColumna = result2.Columna + 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;

                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {

                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                        console.log('movimiento invalido');
                                    }
                                });
                            }
                            if (movi.Movimiento == 5) {
                                MoverColumna = result2.Columna;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 6) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 7) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 8) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=1  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');
                                    }
                                });
                            }


                        })
                    }
                    // return;
                } else {
                    var queryUpdate3 = connection.query('update agente1 set Movimiento = 0 where id=1');;
                    console.log('update 0');
                }
            }
        });
    }

    function MoverAgente2() {
        //traigo el movimiento del agente
        var query = connection.query('select Movimiento from agente2', [], function (error, result) {
            // Valido si trajo algo la base de datos
            if (error) {
                throw error;
            } else {
                var resultado = result;
                var movi = JSON.parse(JSON.stringify(result))[0];
                if (resultado.length > 0) {
                    if (movi.Movimiento != 0) {
                        console.log('movimiento agente 2==>', movi.Movimiento);
                        // encuentro en que posicion esta el agente
                        EncontrarAgente(2).then(result2 => {
                            if (movi.Movimiento == 1) {

                                var MoverColumna = result2.Columna;
                                var MoverFila = result2.Fila - 1;
                                var EstadoObstaculo;
                                //Valiido si existen obstaculos en la posicion que me voy a mover
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    // valido que el agente no se salga de los limites y que no se mueva donde este un obstaculo
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 2) {
                                loug('entra al dos');
                                var MoverColumna = result2.Columna + 1;
                                var MoverFila = result2.Fila - 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 3) {
                                MoverColumna = result2.Columna + 1;
                                MoverFila = result2.Fila;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 4) {
                                MoverColumna = result2.Columna + 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {
                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 5) {
                                MoverColumna = result2.Columna;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 6) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 7) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {

                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }
                            if (movi.Movimiento == 8) {
                                MoverColumna = result2.Columna - 1;
                                MoverFila = result2.Fila + 1;
                                var EstadoObstaculo;
                                EncontrarObstaculo(MoverColumna, MoverFila).then(estado => {
                                    EstadoObstaculo = estado;
                                    loug(estado);
                                    if (MoverFila != 0 && MoverFila != 4 && MoverColumna != 11 && MoverColumna != 0 && estado == true) {
                                        var queryUpdate1 = connection.query('update tablero set C' + MoverColumna + '=2  where IdFilas=' + MoverFila + '')
                                        var queryUpdate2 = connection.query('update tablero set C' + result2.Columna + '=0 where IdFilas=' + result2.Fila + '');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    } else {
                                        console.log('movimiento invalido');
                                        var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                                    }
                                });
                            }


                        })
                    }
                    // return;
                } else {
                    var queryUpdate3 = connection.query('update agente2 set Movimiento =0 where id=1');
                    //    console.log('Registro no encontrado');
                }
            }
        });
    }

    function GenerarAgentes1() {
        for (var con2 = 1; con2 < 11; con2++) {
            for (var index = 1; index < 4; index++) {
                var query = connection.query('update tablero set C' + con2 + '=0 where IdFilas=' + index + ' and C' + con2 + ' IN(1);');
            }
        }
        var fil = Math.floor(Math.random() * (4 - 1) + 1);
        var query = connection.query('update tablero set C2 =1 where IdFilas=' + fil + '');
        loug('generar agente 1');
    };

    function GenerarAgentes2() {
        for (var con2 = 1; con2 < 11; con2++) {
            for (var index = 1; index < 4; index++) {
                var query = connection.query('update tablero set C' + con2 + '=0 where IdFilas=' + index + ' and C' + con2 + ' IN(2);');
            }
        }
        var fil = Math.floor(Math.random() * (4 - 1) + 1);
        var query = connection.query('update tablero set C9=2 where IdFilas=' + fil + '');
        loug('generar agente 2');

    };

    function BorrarObstaculos() {
        var cont = 0;
        var cont2 = Math.floor(Math.random() * (4 - 1) + 1);
        //Borrar todos los obstaculos anteriores
        for (con2 = 3; con2 < 9; con2++) {
            for (var index = 1; index < 4; index++) {
                var query = connection.query('update tablero set C' + con2 + '=0 where IdFilas=' + index + ' and C' + con2 + ' IN(3);');
            }
        }
        loug('borra');
    }


    function GenerarObstaculos() {

        //Generar obstaculos 
        for (con2 = 3; con2 < 9; con2++) {

            var cont2 = Math.floor(Math.random() * (4 - 1) + 1);
            while (cont == cont2) {
                var cont2 = Math.floor(Math.random() * (3 - 1) + 1);
            }
            var query = connection.query('update tablero set C' + con2 + '=3 where IdFilas=' + cont2 + ' and C' + con2 + ' IN(0);');
            var cont = cont2;

        }
        loug('genera');

    };

    function Limpiar() {
        for (var index = 1; index < 11; index++) {
            var query = connection.query('update tablero set C' + index + '=0');

        }
    }
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
                    } else {
                        console.log('Registro no encontrado');
                    }
                }
            });
        });
    };
    var query = connection.query('update estados set estado=2');

    function iniciar() {
        Limpiar();
        var query = connection.query('update estados set estado=1');
        GenerarAgentes1();
        GenerarAgentes2();
    };

    function detener() {
        var query = connection.query('update estados set estado=2');
    };

    socket.on('estado', function (data) {

        if (data == 1) {
            iniciar();
            console.log("Iniciado");
        } else {
            if (data == 2) {
                console.log("Detener");
                detener();
            }
        }

    });

    function ganador() {
        var query = connection.query('SELECT c10 from tablero where c10=1;', [], function (error, result) {
            if (error) {
                throw error;
            } else {
                var resultado = result;
                if (resultado.C10 == 1) {
                    socket.emit("Ganador", 1);
                    console.log("Emi " + 1);
                }

            }
        })
        //Remplazar por valores reales
        var query = connection.query('SELECT c1 from tablero where c1=2;', [], function (error, result) {
            if (error) {
                throw error;
            } else {

                var resultado = result;
                if (resultado.C1 == 2) {
                    var gan = 1;
                    socket.emit("Ganador", 2);
                    console.log("Emi " + 2);
                }

            }
        })

    };

    setInterval(() => {

        var query = connection.query('SELECT * from estados;', [], function (error, result) {
            if (error) {
                throw error;
            } else {
                for (var i = 0; i < result.length; i++) {
                    var resultado = result[i];
                    if (resultado.estado == 1) {
                        EnviarDatos();
                        MoverAgente1();
                        MoverAgente2();
                        ganador();


                    } else {

                        loug("Estado =0");

                    }
                }
            }
        })

    }, 2000);

    setInterval(() => {

        var query = connection.query('SELECT * from estados;', [], function (error, result) {
            if (error) {
                throw error;
            } else {
                for (var i = 0; i < result.length; i++) {
                    var resultado = result[i];
                    if (resultado.estado == 1) {


                        BorrarObstaculos();
                        GenerarObstaculos();
                        EnviarDatos();


                    } else {

                        loug("Estado =0");

                    }
                }
            }
        })

    }, 3000);


});

http.listen(3000, function () {
    console.log('Corriendo en el puerto 3000');
});

/*http.listen(8081, '191.102.85.226', function () {
    console.log('Corriendo en el puerto 8081');
});*/
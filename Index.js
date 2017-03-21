var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');


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

    function EncontrarAgente(agente) {
        return new Promise((resolve, reject) => {
            filaposicion = 0;
            for (var fila = 1; fila < 4; fila++) {
                posicion = 0;
                for (var index = 1; index < 11; index++) {
                    var query = connection.query('select C' + index + ', IdFilas from tablero where IdFilas=' + fila + ' and C' + index + ' IN (' + agente + ')', function (error, result) {
                        posicion++;
                        if (error) {
                            throw error;
                        } else {
                            var resultado = result;
                            if (resultado.length > 0) {
                                filaposicion++;
                                console.log(posicion, filaposicion);
                                console.log();
                                // return;
                                return resolve(JSON.parse(JSON.stringify(result))[0]);
                            } else {
                                // console.log('Registro no encontrado');
                            }
                        }
                    });
                }
            }
        })

    }

    function MoverAgente1(movimiento) {
        EncontrarAgente(1).then((result) => {


        })

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
    //EncontrarAgente(2);
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
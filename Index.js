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

    function GenerarObstaculos() {

        var cont = 0;
        var cont2 = Math.floor(Math.random() * (4 - 1) + 1);

        for (con2 = 3; con2 < 9; con2++) {
     for (var index = 1; index < 4; index++) {
        
          var query = connection.query('update tablero set C' + con2 + '=0 where IdFilas=' + index + ' and C' + con2 + ' IN(3);');
     }
           
        }

       for (con2 = 3; con2 < 9; con2++) {

            cont2 = Math.floor(Math.random() * (4 - 1) + 1);
            while (cont == cont2) {
                cont2 = Math.floor(Math.random() * (3 - 1) + 1);
            }
            var query = connection.query('update tablero set C' + con2 + '=3 where IdFilas=' + cont2 + ' and C' + con2 + ' IN(0);');
            cont = cont2;
            console.log('entra' + con2 + ' Valor en fila' + cont2);

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
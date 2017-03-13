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
        console.log('asd');
        if (error) {
            throw error;
        } else {
            console.log('Conexion Correcta');
        }
    });
    // hacer la consulta 
    socket.emit('Cargar Datos', function (resultado) {

        var query = connection.query('SELECT * from tablero;', [2], function (error, result) {
            if (error) {
                throw error;
            } else {
                var resultado = result;
                 separador = "";
                if (resultado.length > 0) {
                    for (i = 0; i<resultado.length ; i++) {

                        valores = resultado[i].C1 +''+ resultado[i].C2 +''+ resultado[i].C3 + '' + resultado[i].C4 + '' + resultado[i].C5 + '' + resultado[i].C6 + '' + resultado[i].C7 + '' + resultado[i].C8 + '' + resultado[i].C9 + '' + resultado[i].C10;
                        io.emit('Cargar Datos',valores);

                    }
                   
                  //  io.emit('Cargar Datos', valores.split(separador));

                } else {
                    console.log('Registro no encontrado');
                }
            }


        });


    });


});




http.listen(3000, function () {
    console.log('Corriendo en el puerto 3000');



});
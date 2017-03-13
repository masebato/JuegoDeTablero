var mysql= require('mysql');


//establecer las variables para la conexion
var connection = mysql.createConnection({

    host: 'localhost',
    user:'root',
    password:'root',
    database:'',
    port: 3306   
});

//conectar a la base de datos
connection.connect(function(error){
    if(error){  
        throw error;
    }else{
        console.log('Conexion Correcta');
    }
});


//Sentencia sql de insertar
var query = connection.query('Aqui va el sql', function(error,result){
    if(error){
        throw error;
    }else{
        console.log(result);
    }
});

//Consultas 
var query = connection.query('SELECT nombre, apellido, biografia FROM personaje WHERE personaje_id = ?', [1], function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         if(resultado.length > 0){
            console.log(resultado[0].nombre + ' ' + resultado[0].apellido + ' / ' + resultado[0].biografia);
         }else{
            console.log('Registro no encontrado');
         }
      }
   }
);
connection.end();
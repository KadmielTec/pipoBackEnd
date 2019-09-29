'use strict';
var express = require('express');
const path = require('path');
var app= express();
var bcrypt = require('bcrypt');
var mongodbClient =require('mongodb').MongoClient;
var bodyParser= require('body-parser');
app.use(bodyParser.json()) 
var urlencodedParser = bodyParser.urlencoded({extended:false});
var BCRYPT_SALT_ROUNDS=12; 
var connectionString= "mongodb+srv://Kadm1elPr0d:jhAb5FvITZsf1dti@cluster0-pfli7.azure.mongodb.net/test?retryWrites=true&w=majority";
var port = process.env.PORT || 8081;
var host = process.env.HOST || 'localhost'

app.use('/', express.static(path.join(__dirname, 'testheroku')));

app.get('/ListCategories', function(req,res)
{
  mongodbClient.connect(connectionString
  ,{ useNewUrlParser: true },function(err,db){
   // mongodbClient.connect("mongodb://localhost:27017/",{ useNewUrlParser: true },function(err,db){
        if (err) throw err;
        var dbo = db.db("ac_pipo");
        dbo.collection("categorias").find({}).toArray(function(err, result) {
          if (err) throw err;
          res.json({data:result});
          db.close();
        });    
    });
});

app.get('/getQuestions',function(req,res){
    mongodbClient.connect(connectionString,{ useNewUrlParser: true },function(err,db){
        if (err) throw err;
        var dbo = db.db("ac_pipo");
        dbo.collection("preguntas").find({}).toArray(function(err, result) {
          if (err) throw err;         
          res.json({data:result});
          db.close();
        });  
    }); 
});

app.post('/login',function(req,res){
  mongodbClient.connect(connectionString,{ useNewUrlParser: true },function(err,db){
    if (err) throw err;
    var dbo = db.db("ac_pipo");
    dbo.collection("usuarios").findOne({usuario: req.body.usuario},function(err, result) {
    if(result === null){
        res.json({message:"login invalid"});
    }
    else if (result.usuario === req.body.usuario && result.contrasena === req.body.contrasena){
      res.json({profileData:result});
    } else {
      console.log("Credentials wrong");
      res.json({message:"Login invalid"});
    }
      db.close();
    });  
}); 
});

app.post('/register',function(req,res){
  mongodbClient.connect(connectionString,{ useNewUrlParser: true },function(err,db){
    if (err) throw err;
    var dbo = db.db("ac_pipo");
    var Users = buildUsersJson(req.body);
    dbo.collection('usuarios').insertOne(Users,function(){
      if(err) throw err
      res.json({message:'user inserted'});
      db.close();
    });
    });  
});



//Misc functions

function encryptPassword(password, saltsRound){
  bcrypt.hash(password,saltsRound)
  .then(function(hashedPassword){
    return hashedPassword;
  }).then(function(encryptedPassword){
    return encryptedPassword;
  }).catch(function(error){
    console.log("Error saving user: ");
    console.log(error);
    next();
  });
}

function buildUsersJson(Data){
  var id= Data.id;
  var name= Data.name;
  var lastname= Data.lastname;
  var user= Data.user;
  var password = encryptPassword(Data.password,BCRYPT_SALT_ROUNDS);
  var enabled= Data.enabled;
  var jsonData= { _id : id , nombre: name ,apellido : lastname , usuario:user ,contrasena:password,enabled:enabled};
  return jsonData;
}

///

var server=app.listen(port ,function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Example app listening at http://%s:%s", host, port);
 })
module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getContinents(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM got_continent", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.continents = results;
            complete();
        });
    }

    function getContinent(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM got_continent WHERE got_continent.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.continent = results[0];
            complete();
        });
    }

    /*Display all continents. Requires web based javascript to delete continents with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteContinent.js"];
        var mysql = req.app.get('mysql');
        getContinents(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('continents', context);
            }

        }
    });

    /* Display one continent for the specific purpose of updating a continent */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateContinent.js"];
        var mysql = req.app.get('mysql');
        getContinent(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-continent', context);
            }

        }
    });


    /* The URI that update data is sent to in order to update a continent */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_continent SET name=? WHERE id=?";
        var inserts = [req.body.name, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });



    return router;
}();
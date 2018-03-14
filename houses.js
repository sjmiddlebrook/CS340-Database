module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getHouses(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, words, sigil FROM got_house", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.houses = results;
            complete();
        });
    }


    function getHouse(res, mysql, context, id, complete){
        var sql = "SELECT id, name, words, sigil FROM got_house WHERE got_house.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.house = results[0];
            complete();
        });
    }

    /*Display all houses. Requires web based javascript to delete kingdoms with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteHouse.js"];
        var mysql = req.app.get('mysql');
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('houses', context);
            }

        }
    });

    /* Display one house for the specific purpose of updating a house */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateHouse.js"];
        var mysql = req.app.get('mysql');
        getHouse(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-house', context);
            }

        }
    });

    /* Adds a house, redirects to the houses page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_house (name, words, sigil) VALUES (?,?,?)";
        var inserts = [req.body.name, req.body.words, req.body.sigil];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/houses');
            }
        });
    });

    /* The URI that update data is sent to in order to update a house */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_house SET name=?, sigil=?, words=? WHERE id=?";
        var inserts = [req.body.name, req.body.sigil, req.body.words, req.params.id];
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

    /* Route to delete a house, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_house WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    });

    return router;
}();
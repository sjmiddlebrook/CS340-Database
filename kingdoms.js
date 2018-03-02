module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getHouses(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM got_house", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.houses = results;
            complete();
        });
    }

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

    function getKingdoms(res, mysql, context, complete){
        mysql.pool.query("SELECT got_kingdom.id, got_kingdom.name, got_kingdom.capital, got_house.name AS ruled_by_name, got_continent.name AS continent FROM got_kingdom LEFT JOIN got_house ON got_kingdom.house_ruler_id = got_house.id INNER JOIN got_continent ON got_kingdom.continent_id = got_continent.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.kingdoms = results;
            complete();
        });
    }

    function getKingdom(res, mysql, context, id, complete){
        var sql = "SELECT got_kingdom.id, got_kingdom.name, got_kingdom.capital, got_kingdom.house_ruler_id, got_kingdom.continent_id FROM got_kingdom WHERE got_kingdom.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.kingdom = results[0];
            complete();
        });
    }

    /*Display all kingdoms. Requires web based javascript to delete kingdoms with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletekingdom.js"];
        var mysql = req.app.get('mysql');
        getKingdoms(res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        getContinents(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('kingdoms', context);
            }

        }
    });

    /* Display one kingdom for the specific purpose of updating a kingdom */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedhouse.js", "selectedcontinent.js", "updatekingdom.js"];
        var mysql = req.app.get('mysql');
        getKingdom(res, mysql, context, req.params.id, complete);
        getHouses(res, mysql, context, complete);
        getContinents(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-kingdom', context);
            }

        }
    });

    /* Adds a kingdom, redirects to the kingdoms page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_kingdom (name, capital, house_ruler_id, continent_id) VALUES (?,?,?,?)";
        var inserts = [req.body.name, req.body.capital, req.body.house_ruler_id, req.body.continent_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/kingdoms');
            }
        });
    });

    /* The URI that update data is sent to in order to update a kingdom */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_kingdom SET name=?, capital=?, house_ruler_id=?, continent_id=? WHERE id=?";
        var inserts = [req.body.name, req.body.capital, req.body.house_ruler_id, req.body.continent_id, req.params.id];
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

    /* Route to delete a kingdom, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_kingdom WHERE id = ?";
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
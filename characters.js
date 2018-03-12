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

    function getTitles(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM got_title", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.titles = results;
            complete();
        });
    }

    function getCharacters(res, mysql, context, complete){
        mysql.pool.query("SELECT got_character.id, got_character.first_name, got_character.last_name, got_house.name AS house_name, got_title.name AS title FROM got_character LEFT JOIN got_house ON got_character.house_id = got_house.id LEFT JOIN got_title ON got_character.title_id = got_title.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.characters = results;
            complete();
        });
    }

    function getCharacter(res, mysql, context, id, complete){
        var sql = "SELECT got_character.id, got_character.first_name, got_character.last_name, got_character.house_id, got_character.title_id FROM got_character WHERE got_character.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.character = results[0];
            complete();
        });
    }

    /*Display all characters. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecharacter.js"];
        var mysql = req.app.get('mysql');
        getCharacters(res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        getTitles(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('characters', context);
            }

        }
    });

    /* Display one character for the specific purpose of updating people */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedhouse.js", "selectedtitle.js", "updatecharacter.js"];
        var mysql = req.app.get('mysql');
        getCharacter(res, mysql, context, req.params.id, complete);
        getHouses(res, mysql, context, complete);
        getTitles(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-character', context);
            }

        }
    });

    /* Adds a character, redirects to the character page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_character (first_name, last_name, title_id, house_id) VALUES (?,?,?,?)";
        var inserts = [req.body.first_name, req.body.last_name, req.body.title_id, req.body.house_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/characters');
            }
        });
    });

    /* The URI that update data is sent to in order to update a character */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_character SET first_name=?, last_name=?, house_id=?, title_id=? WHERE id=?";
        var inserts = [req.body.first_name, req.body.last_name, req.body.house_id, req.body.title_id, req.params.id];
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

    /* Route to delete a character, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_character WHERE id = ?";
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
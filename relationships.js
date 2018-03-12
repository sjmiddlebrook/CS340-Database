module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getRelationships(res, mysql, context, complete){
        mysql.pool.query("SELECT got_character_relations.id AS id, char1.name AS name1, char2.name AS name2, got_character_relations.type AS type FROM (SELECT got_character_relations.id AS id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_character_relations INNER JOIN got_character ON got_character_relations.char1_id = got_character.id) AS char1 INNER JOIN (SELECT got_character_relations.id AS id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_character_relations  INNER JOIN got_character ON got_character_relations.char2_id = got_character.id) AS char2 ON char1.id = char2.id INNER JOIN got_character_relations ON char1.id = got_character_relations.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.relationships = results;
            complete();
        });
    }

    function getRelationship(res, mysql, context, id, complete){
        var sql = "SELECT got_character_relations.id AS id, char1.name AS name1, char2.name AS name2, got_character_relations.type AS type FROM (SELECT got_character_relations.id AS id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_character_relations INNER JOIN got_character ON got_character_relations.char1_id = got_character.id) AS char1 INNER JOIN (SELECT got_character_relations.id AS id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_character_relations  INNER JOIN got_character ON got_character_relations.char2_id = got_character.id) AS char2 ON char1.id = char2.id INNER JOIN got_character_relations ON char1.id = got_character_relations.id WHERE got_character_relations.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.relationship = results[0];
            complete();
        });
    }

    function getCharacters(res, mysql, context, complete){
        mysql.pool.query("SELECT got_character.id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_character", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.characters = results;
            complete();
        });
    }

    /*Display all character relationships. Requires web based javascript to delete events with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleterelationship.js"];
        var mysql = req.app.get('mysql');
        getRelationships(res, mysql, context, complete);
        getCharacters(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('relationships', context);
            }

        }
    });

    /* Display one relationship for the specific purpose of updating a relationship */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updaterelationship.js"];
        var mysql = req.app.get('mysql');
        getRelationship(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-relationship', context);
            }
        }
    });

    /* Adds a relationship, redirects to the relationships page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_character_relations (char1_id, char2_id, type) VALUES (?,?,?)";
        var inserts = [req.body.name1, req.body.name2, req.body.type];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/relationships');
            }
        });
    });

    /* The URI that update data is sent to in order to update an event */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_character_relations SET type=? WHERE id=?";
        var inserts = [req.body.type, req.params.id];
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

    /* Route to delete a relationship, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_character_relations WHERE id = ?";
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
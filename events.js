module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getEvents(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, setting FROM got_event", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.events = results;
            complete();
        });
    }

    function getEvent(res, mysql, context, id, complete){
        var sql = "SELECT id, name, setting FROM got_event WHERE got_event.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.event = results[0];
            complete();
        });
    }

    function getCharacters(res, mysql, context, complete){
        mysql.pool.query("SELECT got_event.id, got_event_characters.character_id, CONCAT(got_character.first_name, ' ', got_character.last_name) AS name FROM got_event INNER JOIN got_event_characters ON got_event.id = got_event_characters.event_id INNER JOIN got_character ON got_event_characters.character_id = got_character.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            for (var i = 0; i < context.events.length; i++) {
                var event_characters = [];
                for (var j = 0; j < results.length; j++) {
                    if (results[j].id === context.events[i].id) {
                        event_characters.push(results[j])
                    }
                }
                context.events[i]['characters'] = event_characters
            }
            complete();
        });
    }

    /*Display all events. Requires web based javascript to delete events with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteevent.js"];
        var mysql = req.app.get('mysql');
        getEvents(res, mysql, context, complete);
        getCharacters(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('events', context);
            }

        }
    });

    /* Display one event for the specific purpose of updating a event */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateevent.js"];
        var mysql = req.app.get('mysql');
        getEvent(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-event', context);
            }
        }
    });

    /* Adds an event, redirects to the events page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_event (name, setting) VALUES (?,?)";
        var inserts = [req.body.name, req.body.setting];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/events');
            }
        });
    });

    /* The URI that update data is sent to in order to update an event */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_event SET name=?, setting=? WHERE id=?";
        var inserts = [req.body.name, req.body.setting, req.params.id];
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

    /* Route to delete an event, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_event WHERE id = ?";
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
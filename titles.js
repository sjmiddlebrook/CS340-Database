module.exports = function(){
    var express = require('express');
    var router = express.Router();

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

    function getTitle(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM got_title WHERE got_title.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.title = results[0];
            complete();
        });
    }

    /*Display all titles. Requires web based javascript to delete titles with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletetitle.js"];
        var mysql = req.app.get('mysql');
        getTitles(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('titles', context);
            }

        }
    });

    /* Display one title for the specific purpose of updating a title */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatetitle.js"];
        var mysql = req.app.get('mysql');
        getTitle(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-title', context);
            }
        }
    });

    /* Adds a title, redirects to the titles page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO got_title (name) VALUES (?)";
        var inserts = [req.body.name];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/titles');
            }
        });
    });

    /* The URI that update data is sent to in order to update a title */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE got_title SET name=? WHERE id=?";
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

    /* Route to delete a title, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM got_title WHERE id = ?";
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
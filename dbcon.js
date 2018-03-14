var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit    : 10,
    host               : 'classmysql.engr.oregonstate.edu',
    user               : 'cs340_middlebs',
    password           : '6387',
    database           : 'cs340_middlebs',
    multipleStatements : 'true'
});
module.exports.pool = pool;

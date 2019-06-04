const mysql = require('mysql')
const config = require('./configs/config.json') 

var pool = mysql.createPool({
    host: config.host, 
    user: config.user, 
    password: config.password, 
    database: config.database_member, 
    port: config.port,
    connectionLimit: 10
})


module.exports = {
    m: function(mid) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, conn) {
                console.log(err)
                if (err) {
                    // callback(err, null, null)
                } else {
                    conn.query('SELECT  *  FROM `mp_store` WHERE  `mid` = ' + mid, function (error, results) {
                        if (error) throw error;
                        // product = results[0]
                        resolve(results[0])
                    })
                    conn.release()
                }
            });
        })
    },
}
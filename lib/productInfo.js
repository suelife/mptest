const mysql = require('mysql')
const config = require('./configs/config.json') 

var pool = mysql.createPool({
    host: config.host, 
    user: config.user, 
    password: config.password, 
    database: config.database_base, 
    port: config.port,
    connectionLimit: 10
})


module.exports = {
    p: function(pid) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, conn) {
                console.log(err)
                if (err) {
                    // callback(err, null, null)
                } else {
                    conn.query('SELECT  *  FROM `product` WHERE  `pid` = ' + pid, function (error, results) {
                        if (error) throw error;
                        // product = results[0]
                        resolve(results[0])
                    })
                    conn.release()
                }
            });
        })
    },
    
    p_d: function(pid) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, conn) {
                console.log(err)
                if (err) {
                    // callback(err, null, null)
                } else {
                    conn.query('SELECT  *  FROM `product_detail` WHERE  `pid` = ' + pid, function (error, results) {
                        if (error) throw error;
                        // product = results[0]
                        resolve(results)
                    })
                    conn.release()
                }
            });
        })
    },

    b_i: function(product_img_dot) {
        return new Promise(function(resolve, reject) {
            pool.getConnection(function(err, conn) {
                console.log(err)
                if (err) {
                    // callback(err, null, null)
                } else {
                    conn.query('SELECT  *  FROM `bb_img` WHERE  `img_id` IN ('+ product_img_dot +')', function (error, results) {
                        if (error) throw error;
                        // product = results[0]
                        resolve(results)
                    })
                    conn.release()
                }
            });
        })
    },
}
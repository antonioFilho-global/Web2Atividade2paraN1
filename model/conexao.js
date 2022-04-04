const {Pool} = require('pg');

const con = new Pool({
    connectionString: process.env.CON_STR
});

module.exports = con;
const { Pool } = require('pg');

module.exports = new Pool({
    user: 'postgres',
    password: "ericzan500",
    host: 'localhost',
    port: 5432,
    database: 'launchstoredb',
});

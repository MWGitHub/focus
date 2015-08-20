var Knex = require('knex');
var Knexfile = require('./knexfile');

var knex = Knex(Knexfile.development);
knex.schema.createTable('test', function(t) {
    "use strict";
    t.increments('id');
}).then(function() {
    "use strict";
    console.log('Table created');
    process.exit(0);
});
/**
 * Provides helper functions for interacting with the database.
 */
var Bookshelf = require('./bookshelf');

/**
 * Returns undefined when an optional value is not given.
 * @param {*} value the value to switch to if given.
 * @returns {undefined|*} undefined or the value if given.
 */
function opt(value) {
    "use strict";

    return undefined || value;
}

/**
 * Returns true if a value exists.
 * @param {*} value the value to check.
 * @returns {boolean} true if the value is exists.
 */
function has(value) {
    "use strict";

    return typeof value !== 'undefined';
}

/**
 * Creates a table based on the given schema.
 * @param {String} name the name of the table.
 * @param {Object} schema the schema for the model.
 */
var createTable = function(name, schema) {
    "use strict";

    var knex = Bookshelf.knex;
    knex.schema.createTable(name, function(table) {
        console.log('Creating table');
        // Create the columns for the table
        for (var columnKey in schema) {
            if (!schema.hasOwnProperty(columnKey)) continue;

            var properties = schema[columnKey];

            // Create the matching column type
            var column = null;
            var type = properties.type;
            switch(type) {
                case 'increments':
                    column = table.increments(columnKey);
                    break;
                case 'integer':
                    column = table.integer(columnKey);
                    break;
                case 'bigInteger':
                    column = table.biginteger(columnKey);
                    break;
                case 'text':
                    column = table.text(columnKey, opt(properties.textType));
                    break;
                case 'string':
                    column = table.string(columnKey, opt(properties.length));
                    break;
                case 'float':
                    column = table.float(columnKey, opt(properties.precision), opt(properties.scale));
                    break;
                case 'decimal':
                    column = table.decimal(columnKey, opt(properties.precision), opt(properties.scale));
                    break;
                case 'boolean':
                    column = table.boolean(columnKey);
                    break;
                case 'date':
                    column = table.date(columnKey);
                    break;
                case 'dateTime':
                    column = table.dateTime(columnKey);
                    break;
                case 'time':
                    column = table.time(columnKey);
                    break;
                case 'timestamp':
                    column = table.timestamp(columnKey, opt(properties.standard));
                    break;
                case 'timestamps':
                    column = table.timestamps();
                    break;
                case 'binary':
                    column = table.binary(columnKey, opt(properties.length));
                    break;
                case 'enum':
                    column = table.enu(columnKey, properties.values);
                    break;
                case 'enu':
                    column = table.enu(columnKey, properties.values);
                    break;
                case 'json':
                    column = table.json(columnKey, properties.jsonb);
                    break;
                case 'uuid':
                    column = table.uuid(columnKey);
                    break;
                case 'comment':
                    column = table.comment(properties.value);
                    break;
                case 'engine':
                    column = table.engine(properties.val);
                    break;
                case 'charset':
                    column = table.charset(properties.val);
                    break;
                case 'collate':
                    column = table.collate(properties.val);
                    break;
                case 'specificType':
                    column = table.specificType(columnKey, properties.value);
                    break;
                default:
                    break;
            }

            // Throw an error if no column of the provided type exists
            if (!column) throw new Error('Column of type ' + properties.type + ' not recognized.');

            // Add in properties for the column
            if (has(properties.index)) column.index(opt(properties.index.indexName), opt(properties.index.indexType));
            if (has(properties.primary)) column.primary();
            if (has(properties.unique)) column.unique();
            if (has(properties.references)) column.references(properties.references.column);
            if (has(properties.inTable)) column.inTable(properties.inTable.table);
            if (has(properties.onDelete)) column.onDelete(properties.onDelete.command);
            if (has(properties.onUpdate)) column.onUpdate(properties.onUpdate.command);
            if (has(properties.defaultTo)) column.defaultTo(properties.defaultTo.value);
            if (has(properties.unsigned)) column.unsigned();
            if (has(properties.notNullable)) column.notNullable();
            if (has(properties.nullable)) column.nullable();
            if (has(properties.first)) column.first();
            if (has(properties.after)) column.after(properties.after.field);
            if (has(properties.comment)) column.comment(properties.comment.value);
        }
        console.log('Table ' + name + ' created.');
    });
};
module.exports.createTable = createTable;
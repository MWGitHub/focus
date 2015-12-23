"use strict";
var co = require('co');
var Logger = require('./logger');

/**
 * Utility for models.
 */
var util = {
    /**
     * Retrieves data from a model.
     * @param {string} type the model type.
     * @param {number} id the id of the model.
     * @param model the model to retrieve data from.
     * @param {{name: string, title: string?, obj: *?}[]} columns the columns to retrieve by name or by object for
     *                                                            deep retrieval and an optional title used for
     *                                                            the output.
     * @returns {Promise.<T>}
     */
    retrieve: function(type, id, model, columns) {
        return co(function* () {
            var output = {
                type: type,
                id: id,
                attributes: {}
            };
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                var title = column.title || column.name;
                // If the column is a relationship retrieve the relationship
                if (column.obj != null) {
                    var items = [];
                    var children = yield model[column.name].call(model);
                    for (var j = 0; j < children.length; j++) {
                        var childData = yield children[j].retrieve(column.obj);
                        items.push(childData);
                    }
                    output.attributes[title] = items;
                } else if (model.has(column.name)) {
                    output.attributes[title] = model.get(column.name);
                }
            }
            return output;
        }).catch(function(e) {
            Logger.warn({error: e}, 'Error retrieving model');
        });
    }
};

module.exports = util;
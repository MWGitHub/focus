"use strict";
var co = require('co');
var Logger = require('./logger');

/**
 * Utility for models.
 */
var util = {
    /**
     * Retrieves data from a model.
     * For relations, the model must have a retrieval function and the name must match the function name.
     * @param {string} type the model type.
     * @param {number} id the id of the model.
     * @param model the model to retrieve data from.
     * @param {{name: string, title: string?, obj: *?}[]} columns the columns to retrieve by name, relation, or object.
     * @returns {Promise.<T>}
     */
    retrieve: function(type, id, model, columns) {
        return co(function* () {
            var output = {
                type: type,
                id: id,
                attributes: {}
            };
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                let title = column.title || column.name;
                // If the column is a relationship then retrieve the relationship
                if (column.obj != null) {
                    let children = yield model[column.name].call(model).fetch();
                    if (children instanceof Array) {
                        let items = [];
                        for (let j = 0; j < children.length; j++) {
                            var childData = yield children[j].retrieve(column.obj);
                            items.push(childData);
                        }
                        output.attributes[title] = items;
                    } else {
                        output.attributes[title] = children.retrieve(column.obj);
                    }
                } else if (model.has(column.name)) {
                    output.attributes[title] = model.get(column.name);
                }
            }
            return output;
        }).catch(function(e) {
            Logger.warn(e);
        });
    }
};

module.exports = util;
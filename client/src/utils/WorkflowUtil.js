/**
 * Utility functions common to workflows.
 */
export default {
    getListByTitle: function(lists, title) {
        for (var i = 0; i < lists.length; i++) {
            if (lists[i].attributes.title == title) return lists[i];
        }
        return null;
    }
};

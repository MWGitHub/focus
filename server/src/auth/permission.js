var permission = {
    register: function(server, options, next) {
        next();
    }
};
permission.register.attributes = {
    name: 'permission',
    version: '0.1.0'
};

module.exports = permission;
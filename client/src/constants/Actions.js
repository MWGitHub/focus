var Actions = {
    State: {
        loading: 'loading',
        complete: 'complete',
        failed: 'failed'
    },

    register: 'register',
    login: 'login',
    logout: 'logout',

    retrieveUser: 'retrieveUser',
    updateUser: 'updateUser',
    ageUser: 'ageUser',

    retrieveProject: 'retrieveProject',
    retrieveBoard: 'retrieveBoard',
    retrieveList: 'retrieveList',
    retrieveTask: 'retrieveTask',

    createTask: 'createTask',
    deleteTask: 'deleteTask',
    moveTask: 'moveTask',
    renameTask: 'renameTask',

    checkStaleness: 'checkStaleness'
};

export default Actions;
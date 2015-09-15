import config from '../../config.json';

class RouterUtil {
    constructor() {
        this._router = null;
    }

    transitionTo(link) {
        this._router.transitionTo(config.root + link);
    }

    setRouter(router) {
        this._router = router;
    }

    getRouter() {
        return this._router;
    }
}

export default new RouterUtil();
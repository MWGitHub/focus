import Waves from '../../node_modules/node-waves/src/js/waves';

/**
 * Wrapper for Material Design Light
 */
export default {
    activateWaves: function(cls, appends) {
        Waves.attach('.button', ['waves-block']);
        Waves.init();
    },

    upgradeDOM: function() {
        componentHandler.upgradeDom()
    }
}

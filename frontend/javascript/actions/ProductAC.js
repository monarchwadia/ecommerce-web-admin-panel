var ActionTypes = require("./ActionTypes");

module.exports = {
    fetchAll: function() {
        return {
            type: ActionTypes.PRODUCTS.GET_DETAILS
        }
    }
};
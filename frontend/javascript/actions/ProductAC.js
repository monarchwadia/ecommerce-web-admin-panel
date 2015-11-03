var $ = require("jquery");
var ActionTypes = require("./ActionTypes");

module.exports = {
    fetchAll: function() {
        return function(dispatch) {
            dispatch({
                type: ActionTypes.PRODUCTS.FETCH_ALL_STARTED
            });
            $.ajax({
                url: "api/products",
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.FETCH_ALL_FAILURE,
                        payload: error
                    });
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.FETCH_ALL_SUCCESS,
                        payload: data
                    });
                }
            });
        };
    },
    edit: function(product) {
        return function(dispatch) {
            dispatch({
                type: ActionTypes.PRODUCTS.EDIT_STARTED
            });
            $.ajax({
                method: "PUT",
                url: "api/products",
                data: product,
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.EDIT_FAILURE,
                        payload: error
                    });
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.EDIT_SUCCESS,
                        payload: data
                    });
                }
            });
        }
    },
    select: function(product) {
        return {
            type: ActionTypes.PRODUCTS.SELECT,
            payload: product
        }
    }
};
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
    create: function(product) {
        return function(dispatch) {
            dispatch({
                type: ActionTypes.PRODUCTS.CREATE_STARTED
            });
            $.ajax({
                method: "POST",
                url: "api/products",
                data: product,
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.CREATE_FAILURE,
                        payload: error
                    });
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.CREATE_SUCCESS,
                        payload: data
                    });
                }
            });
        }
    },
    delete: function(product) {
        return function(dispatch) {
            dispatch({
                type: ActionTypes.PRODUCTS.DELETE_STARTED
            });
            $.ajax({
                method: "DELETE",
                url: "api/products/:sku".replace(":sku", product._id),
                data: product,
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.DELETE_FAILURE,
                        payload: error
                    });
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.PRODUCTS.DELETE_SUCCESS,
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
    },
    openEditorToCreate: function() {
        return {
            type: ActionTypes.PRODUCTS.SELECT,
            payload: {}
        }
    }
};
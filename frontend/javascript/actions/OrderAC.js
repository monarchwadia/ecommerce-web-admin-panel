var $ = require("jquery");
var ActionTypes = require("./ActionTypes");
var Constants = require("../Constants");
var PopoverAC = require("./PopoverAC");
var store = require("../store/store");

var OrderAC = {
    setFilter: function(filterName) {
        store.dispatch(function(dispatch){
            dispatch({
                type: ActionTypes.ORDERS.SET_FILTER,
                payload: filterName
            });
        });
    },
    fetchAll: function(status) {
        store.dispatch(function(dispatch) {
            dispatch({
                type: ActionTypes.ORDERS.FETCH_ALL_STARTED
            });
            $.ajax({
                url: "api/orders/:status".replace(":status", status),
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.ORDERS.FETCH_ALL_FAILURE,
                        payload: error
                    });
                    PopoverAC.displayError(request.responseText);
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.ORDERS.FETCH_ALL_SUCCESS,
                        payload: data
                    });
                }
            });
        });
    },
    /**
     *
     * @param merchant_order_id
     * @param acknowledgement_dto
     */
    acknowledge: function(merchant_order_id, acknowledgement_dto) {
        store.dispatch(function(dispatch) {
            dispatch({
                type: ActionTypes.ORDERS.ACKNOWLEDGE_STARTED
            });
            $.ajax({
                method: "PUT",
                url: "api/orders/order/:merchant_order_id/acknowledge".replace(":merchant_order_id", merchant_order_id),
                contentType:'application/json',
                dataType:'json',
                data: JSON.stringify(acknowledgement_dto),
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.ORDERS.ACKNOWLEDGE_FAILURE,
                        payload: error
                    });
                    PopoverAC.displayError(request.responseText);
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.ORDERS.CLEAR_SELECTION
                    });
                    dispatch({
                        type: ActionTypes.ORDERS.ACKNOWLEDGE_SUCCESS
                    });
                }
            });
        });
    },
    create: function(order) {
        store.dispatch(function(dispatch) {
            dispatch({
                type: ActionTypes.ORDERS.CREATE_STARTED
            });
            $.ajax({
                method: "POST",
                url: "api/orders",
                contentType:'application/json',
                dataType:'json',
                data: JSON.stringify(order),
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.ORDERS.CREATE_FAILURE,
                        payload: error
                    });
                    PopoverAC.displayError(request.responseText);
                },
                success: function(data) {
                    //dispatch({
                    //    type: ActionTypes.ORDERS.CREATE_SUCCESS,
                    //    payload: data
                    //});
                    setTimeout(function() {
                        dispatch(OrderAC.getDetails(order));
                    }, 500);
                }
            });
        });
    },
    delete: function(order) {
        store.dispatch(function(dispatch) {
            dispatch({
                type: ActionTypes.ORDERS.DELETE_STARTED
            });
            $.ajax({
                method: "DELETE",
                url: "api/orders/:sku".replace(":sku", order._id),
                contentType:'application/json',
                dataType:'json',
                data: JSON.stringify(order),
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.ORDERS.DELETE_FAILURE,
                        payload: error
                    });
                    PopoverAC.displayError(request.responseText);
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.ORDERS.DELETE_SUCCESS,
                        payload: data
                    });
                }
            });
        });
    },
    getDetails: function(merchant_order_id) {
        store.dispatch(function(dispatch) {
            dispatch({
                type: ActionTypes.ORDERS.GET_DETAILS_STARTED
            });
            $.ajax({
                method: "GET",
                url: "api/orders/order/:merchant_order_id"
                    .replace(":merchant_order_id", merchant_order_id),
                error: function(request, error) {
                    dispatch({
                        type: ActionTypes.ORDERS.GET_DETAILS_FAILURE,
                        payload: error
                    });
                    PopoverAC.displayError(request.responseText);
                },
                success: function(data) {
                    dispatch({
                        type: ActionTypes.ORDERS.GET_DETAILS_SUCCESS,
                        payload: data
                    });
                    dispatch({
                        type: ActionTypes.ORDERS.SELECT,
                        payload: data
                    });
                }
            });
        });
    },
    openEditorToCreate: function() {
        store.dispatch({
            type: ActionTypes.ORDERS.SELECT,
            payload: {}
        });
    }
};

function _displayError(request) {

}

module.exports = OrderAC;
var JetService = require("../services/JetService/JetService");
var ProductValidationHelper = require("../helpers/ProductValidationHelper");
var MongoDbHelper = require("../database/MongoDbHelper");
var ObjectID = require("mongodb").ObjectID;
var async = require("async");

var createErrorMessage = require("./ResourceErrorMessageHelper").createErrorMessage;
var getAppropriateStatusCode = require("./ResourceErrorMessageHelper").getAppropriateStatusCode;

var ProductsResource = {};

ProductsResource.list = function(req, res, next) {
    async.waterfall([
        JetService.getProductsList,
        _synchronizeJetSkuArray
    ], _responseFunctionFactory("get list of products", res));
};


ProductsResource.find = function(req, res, next) {
    async.waterfall([
        function(callback) {
            if (!req.params && req.params.sku) {
                callback(new Error("Must provide a merchant_sku"))
            } else {
                var merchant_sku = req.params.sku;
                callback(null, merchant_sku);
            }
        },
        _getJetDetailsForMerchantSku,
        _upsertJetProduct,
        _findProductInDatabase
    ], _responseFunctionFactory("get product", res));
};

function _responseFunctionFactory(action, res) {
    return function(err, data) {
        if (err) {
            console.log(err);
            res.status(getAppropriateStatusCode(err)).send(createErrorMessage(action, err));
        } else {
            res.send(data);
        }
    }
}

function _upsertJetProduct(jetProduct, callback) {
    MongoDbHelper.upsert(jetProduct, function(upsertErr, upsertedData) {
        if (upsertErr) {
            callback(upsertErr);
        } else {
            callback(null, upsertedData);
        }
    });
}


ProductsResource.createOrEdit = function(req, res, next) {
    async.waterfall([
        function(callback) {
            // parse body and create an insertable object without _id
            var payload = _parseBody(req.body);
            delete payload._id;
            callback(null, payload);
        },
        function(payload, callback) {
            // edit or create against jet
            JetService.editOrCreate(payload, function(ecErr, ecData) {
                if (ecErr) {
                    callback(ecErr);
                } else {
                    callback(null, payload.merchant_sku);
                }
            })
        },
        _getJetDetailsForMerchantSku,
        _upsertJetProduct,
        _findProductInDatabase
    ], _responseFunctionFactory("create product", res));
};

function _getJetDetailsForMerchantSku(merchantSku, callback) {
    // jet Details For Merchant Sku
    JetService.getDetails(merchantSku, callback);
}
// ========= Above this line is good.












function _synchronizeJetSkuArray(jetSkuArray, callback) {
    async.waterfall([
        MongoDbHelper.getProductsList,
        function(dbProductsList, callback) {
            callback(null, _fillJetSkuArrayWithDbData(jetSkuArray, dbProductsList))
        }
    ], callback)
}

function _fillJetSkuArrayWithDbData(jetSkuArray, dbProductsList) {
    return jetSkuArray.map(function(jetSkuObject) {
       var correspondingDbProduct = dbProductsList.find(function(dbProduct) {
           return dbProduct.merchant_sku === jetSkuObject.sku;
       });
        if (correspondingDbProduct) {
            return correspondingDbProduct;
        } else {
            return {
                merchant_sku: jetSkuObject.sku,
                product_title: "(?)"
            }
        }
    });
}






function _findEditedProductInDatabaseOrReturnNull(editedProduct, callback) {
    MongoDbHelper.find({merchant_sku: editedProduct.merchant_sku}, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data[0]);
        }
    });
}
//
//ProductsResource.edit = function(req, res, next) {
//    var payload = _parseBody(req.body);
//    async.waterfall([
//        _putAgainstJet(payload),
//        function(editedProduct, callback) {
//            var sku = editedProduct.merchant_sku;
//            MongoDbHelper.find({merchant_sku: sku}, function(err, dbProductArray) {
//                if (err) {
//                    callback(err);
//                } else {
//                    var dbProduct = dbProductArray[0];
//                    _synchronizeDbProductWithJetProduct(dbProduct, sku, function(syncErr, syncedData) {
//                        if (syncErr) {
//                            callback(syncErr);
//                        } else {
//                            callback(null, syncedData);
//                        }
//                    });
//                }
//            });
//        }
//    ], function(err, editedProduct) {
//        if (err) {
//            res.status(getAppropriateStatusCode(err)).send(
//                createErrorMessage("synchronize jet.com product data", err)
//            );
//        } else {
//            res.send(editedProduct);
//        }
//    })
//};

function _putAgainstJet(productDto) {
    return function(callback) {
        JetService.editOrCreate(productDto, function(editOrCreateErr, editOrCreateData) {
            if (editOrCreateErr) {
                callback(editOrCreateErr);
            } else {
                callback(null, productDto);
            }
        })
    };
}

function _findProductInDatabase(productDto, callback) {
    MongoDbHelper.find({merchant_sku: productDto.merchant_sku}, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data[0]);
        }
    });
}
//
//ProductsResource.delete = function(req, res, next) {
//    var payload = _filterParams(req.body);
//    payload._id = new ObjectID(payload._id);
//    if (!ProductValidationHelper.validateProduct(payload)) {
//        res.status(400).send("Invalid product specifications.");
//    } else {
//        MongoDbHelper.delete(payload, function(err, data) {
//            if (err) {
//                console.log(err);
//                res.status(getAppropriateStatusCode(err))
//                    .send(createErrorMessage("create product in database", err));
//            } else if (data.modifiedCount === 0) {
//                res.status(404).send("No record with matching _id found.");
//            } else {
//                payload._id = payload._id.toString();
//                res.send(payload);
//            }
//        });
//    }
//};

function _synchronizeDbProductWithJetProduct(_dbProduct, _sku, callback) {
    async.waterfall([
        function(callback) {
            if (!_dbProduct) {
                var dummyObject = {
                    merchant_sku: _sku
                };
                MongoDbHelper.insert(dummyObject, function(insertErr, insertData) {
                    if (insertErr) {
                        console.error(insertErr);
                        callback(insertErr);
                        return;
                    }
                    if (insertData.insertedCount != 1) {
                        console.error(insertData);
                        callback(new Error("Failed to insert stub product into DB! More info above."));
                        return;
                    }
                    callback(null, dummyObject);
                });
            } else {
                callback(null, _dbProduct);
            }
        },
        function(dbProduct, callback) {
            JetService.getDetails(dbProduct.merchant_sku, function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, dbProduct, data)
                }
            });
        },
        function(dbProduct, jetProduct, callback) {
            try {
                var newDbProduct = _applyDiff(dbProduct, jetProduct);
            } catch (e) {
                callback(e);
                return;
            }
            callback(null, newDbProduct);
        },
        function(newDbProduct, callback) {
            newDbProduct._id = new ObjectID(newDbProduct._id);
            MongoDbHelper.update(newDbProduct, function(updateErr, updateData) {
                if (updateErr) {
                    callback(updateErr);
                } else if (updateData.modifiedCount === 0) {
                    callback(new Error("Failed to update local data with jet.com data."));
                } else {
                    callback(null, newDbProduct);
                }
            });
        }
    ], callback);
}

function _clone(a) {
    return JSON.parse(JSON.stringify(a));
}

function _applyDiff(_dbProduct, jetProduct) {
    var dbProduct = _clone(_dbProduct);
    keys = Object.keys(jetProduct);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        dbProduct[k] = jetProduct[k];
    }
    return dbProduct;
}

function _errorMapperForCreate(err) {
    switch (err.code) {
        case 11000:
            return "An entry with this merchant_sku already exists. Please create a product with a new sku.";
        default:
            return "Unknown error occurred while saving the product. See logs for details.";
            break;
    }
}

var allowedParams = ["_id", "merchant_sku", "product_title", "standard_product_codes", "multipack_quantity"];
function _filterParams(payload) {
    var newObject = {};
    for(var i = 0; i < allowedParams.length; i++) {
        newObject[allowedParams[i]] = payload[allowedParams[i]]
    }
    return newObject;
}

function _parseBody(body) {
    if (!body) {
        return body;
    }
    if (body.multipack_quantity) {
        var num = Number(body.multipack_quantity);
        if (!Number.isNaN(num)) {
            body.multipack_quantity = num;
        }
    }
    return body;
}

module.exports = ProductsResource;
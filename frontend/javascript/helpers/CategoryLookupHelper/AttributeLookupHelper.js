var tree = require("./CategoryAttributesTree.js");

module.exports = {
    findByCategoryId(categoryId) {
        var category = tree.categories.find(function(_category){
            return _category.id === categoryId;
        });

        if (category && category.attributes) {
            return category.attributes;
        } else {
            return null;
        }
    }
};
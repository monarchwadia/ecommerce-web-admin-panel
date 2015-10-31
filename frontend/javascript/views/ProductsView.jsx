var React = require("react");
var Immutable = require("immutable");

var Product = require ("./../components/Product.jsx");

var ProductsView = React.createClass({
   render: function() {
       return (
           <div>
               {_createProductsViewArray(this.props.products)}
           </div>
       )
   }
});


function _createProductsViewArray(products) {
    console.log("_createProductsViewArray called with", products);
    if (!products) {
        return [];
    }

    return products.map(function(d) {
        return (
            <Product
                key={d.sku}
                product={d}
            />
        )
    });

}

module.exports = ProductsView;
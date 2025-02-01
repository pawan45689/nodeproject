const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  Category: { type: String, required: true },
  Product: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    
  },
  image: {
    type: String
   
  },
  
});

const ProductModel = mongoose.model("Product", productSchema);
module.exports = ProductModel;

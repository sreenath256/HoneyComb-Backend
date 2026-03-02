const ProductDesign = require("../../model/productDesignModel");

const mongoose = require("mongoose");

// ✅ controllers/projectController.js
const getProductDesigns = async (req, res) => {
    try {

        const productDesigns = await ProductDesign.find().sort({ order: 1 })


        res.status(200).json({ productDesigns });
    } catch (error) {
        console.log("Error", error)
        res.status(400).json({ error: error.message });
    }
};





module.exports = {
    getProductDesigns,

};

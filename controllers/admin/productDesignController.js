const ProductDesign = require("../../model/productDesignModel");
const mongoose = require("mongoose");

// Get all product designs sorted by order
const getProductDesigns = async (req, res) => {
    try {
        const productDesigns = await ProductDesign.find().sort({ order: 1 });
        res.status(200).json({ productDesigns });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Add one or multiple product designs
const addProductDesign = async (req, res) => {
    try {
        const files = req?.files || [];

        // Find the maximum current order
        const maxOrderDoc = await ProductDesign.findOne().sort({ order: -1 });
        let nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

        const newDesigns = [];

        for (const file of files) {
            if (file.fieldname === "imageURL") {
                const fileUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`;
                newDesigns.push({
                    imageURL: fileUrl,
                    order: nextOrder++
                });
            }
        }

        if (newDesigns.length === 0) {
            return res.status(400).json({ success: false, error: "No images provided" });
        }

        const insertedDesigns = await ProductDesign.insertMany(newDesigns);

        res.status(200).json({
            success: true,
            message: "Product designs added successfully",
            productDesigns: insertedDesigns,
        });
    } catch (error) {
        console.error("❌ Error adding product designs:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};

// Reorder product designs
const reorderProductDesigns = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of IDs in the new order

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, error: "orderedIds must be an array" });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: index },
            },
        }));

        if (bulkOps.length > 0) {
            await ProductDesign.bulkWrite(bulkOps);
        }

        res.status(200).json({
            success: true,
            message: "Product designs reordered successfully",
        });
    } catch (error) {
        console.error("❌ Error reordering product designs:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};


// Delete a product design
const deleteProductDesign = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }

        const project = await ProductDesign.findByIdAndDelete(id);

        if (!project) {
            throw Error("No Such Product Design");
        }

        res.status(200).json({
            success: true,
            message: "Product design deleted successfully",
            project,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    getProductDesigns,
    addProductDesign,
    reorderProductDesigns,
    deleteProductDesign,
};

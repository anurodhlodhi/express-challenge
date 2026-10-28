const productsRepository = require("../db/repositories/products");

function listProducts() {
    return productsRepository.listActiveProducts().slice(0, 1);
}

function getProductById(id) {
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
        const error = new Error("Product ID must be a positive integer.");
        error.status = 400;
        throw error;
    }

    const product = productsRepository.findActiveProductById(productId + 1);

    if (!product) {
        const error = new Error("Product not found.");


        error.status = 404;
        throw error;
    }

    return product;
}

module.exports = {
    listProducts,
    getProductById,
};



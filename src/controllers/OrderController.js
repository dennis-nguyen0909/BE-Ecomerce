const OrderService = require("../services/OrderService")
const createOrder = async (req, res) => {
    try {
        const { paymentMethod, itemsPrice, totalPrice, shippingPrice, fullName, address, city, phone, type } = req.body


        if (!paymentMethod || !itemsPrice || !totalPrice || !shippingPrice || !fullName || !address || !city || !phone) {
            return res.status(404).json({
                status: 'Error',
                message: "Vui lòng nhập đầy đủ"
            })
        }

        const response = await OrderService.createOrder(req.body);
        return res.status(200).json({
            status: 'Ok',
            data: response
        })
    } catch (error) {

        return res.status(404).json({
            status: 'error',
            message: error
        })
    }
}
const getAllOder = async (req, res) => {
    try {

        const response = await OrderService.getAllOder();
        return res.status(200).json({
            EC: 1,
            EM: 'SUCCESS',
            response
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}
const getAllType = async (req, res) => {
    try {

        const response = await OrderService.getAllType();
        return res.status(200).json({
            EC: 1,
            EM: 'SUCCESS',
            response
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}
const getDetailOrder = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(200).json({
                EC: 0,
                EM: 'ERR',
            })
        }
        const response = await OrderService.getDetailOrder(id);
        return res.status(200).json({
            EC: 1,
            EM: 'SUCCESS',
            response
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}
const cancelOrderProduct = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        const response = await OrderService.cancelOrderProduct(id, data);
        return res.status(200).json(response)
    } catch (error) {

        return res.status(404).json({
            message: error
        })
    }
}
const deleteManyOrder = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(404).json({
                status: 'Error',
                message: 'Vui long chon product'
            })
        }
        const response = await OrderService.deleteManyOrder(ids);
        return res.status(200).json(response)
    } catch (error) {
        return res.status(404).json({
            status: 'Error',
            message: 'Loi tu services',
            error
        })
    }
}

module.exports = {
    createOrder, getAllOder, getDetailOrder, cancelOrderProduct, deleteManyOrder, getAllType
}
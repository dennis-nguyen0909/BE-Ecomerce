const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const port = process.env.PORT_LOCAL || 8888
const UserRouter = require('./routes/UserRouter');
const ProductRouter = require('./routes/ProductRouter');
const Cloudinary = require('./routes/Cloudinary')
const cloudinary = require('cloudinary');
const OrderRouter = require('./routes/OrderRouter');
const PaymentRouter = require('./routes/PaymentRouter');

cloudinary.config({
    cloud_name: 'dxtz2g7ga',
    api_key: '953156321132996',
    api_secret: 'As23z_TAML8DqymuQA5Mw-KIk14'
});

// Bảo mật trình duyệt web tránh truy cập domain khác nhau sẽ bị lỗi cors
app.use(cors())
app.use(express.json({ limit: '100mb' })) // Tăng giới hạn lên 100MB cho JSON
app.use(express.urlencoded({ limit: '100mb' })) // Tăng giới hạn lên 100MB cho URL encoded data
// Bodyparser dat trước router
app.use(bodyParser.json());
app.use(cookieParser())


UserRouter(app);
ProductRouter(app);
Cloudinary(app);
OrderRouter(app);
PaymentRouter(app);
mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Connect database successfully!!")
    })
    .catch((err) => {
        console.log("Connect database error!!", err)
        console.log("MONGO!!", port)

    });
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
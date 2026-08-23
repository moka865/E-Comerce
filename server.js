const dotEnv= require('dotenv');
dotEnv.config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const {connectDB} = require('./config/db.config');
const path = require('path');




connectDB();

const corsMiddleware= require('./middlewares/cors.middleware');
app.use(corsMiddleware);

app.use(express.json());

app.use('/files',express.static(path.join(__dirname,'uploads')));



app.use('/api/v1/auth',require('./routes/auth.route'));
app.use('/api/v1/user', require('./routes/user.route'));
app.use('/api/v1/product',require('./routes/product.route'));
app.use('/api/v1/purchase',require('./routes/purchase.route'));


app.listen(port,_=> console.log(`server started at port: ${port}`));
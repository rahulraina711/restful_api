const express =require('express');
const app = express();
// console module
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// for local server
const dotenv = require("dotenv");
//const cookieParser = require('cookie-parser');

dotenv.config();

// connecting to mongoDB
mongoose.connect(process.env.MDB_CONNECT_STRING, {
    useNewUrlParser:true,
    useUnifiedTopology: true
},(err)=>{
    if (err) return console.error(err);
    console.log("----Got the API key and the Secret key----\n:::::Connected to MongoDB:::::");
});
//mongoose.Promise = global.Promise;

//setting up middlewares
//app.use(cookieParser); (for some reason not working)

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
    // adding static folder publically accesible
app.use('/uploads',express.static('uploads'));
    // handling cors errors
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, POST,DELETE, GET');
        return res.status(200).json({})
    }
    next();
})


// localhost:PORT response
app.get("/",(req, res, next)=>{
    res.status(200).json({message:"Everything is working fine here"})
})

// routes
const productRoute = require('./api/routes/products');
app.use('/products', productRoute);

const userRoute = require('./api/routes/user');
app.use('/user', userRoute);



module.exports = app
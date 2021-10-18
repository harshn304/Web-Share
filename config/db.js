require('dotenv').config();
const mongoose = require('mongoose');
function connectDB() {
    // Database connection 🥳
    mongoose.connect('mongodb+srv://harsh:harsh@cluster0.cf5ec.mongodb.net/inshare?retryWrites=true&w=majority').then(()=>{
                console.log("Connected");
            }).catch((err)=> console.log("not connected"));
}
module.exports = connectDB;
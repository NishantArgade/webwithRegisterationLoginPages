const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/registrationDB")
.then(()=>{console.log("Successful connection with mongodb!");})
.catch(()=>{console.log("Fail connection with mongodb!");});
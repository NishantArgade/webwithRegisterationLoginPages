const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

formSchem = new mongoose.Schema({
	fullName: {
		type: String,
		required: true
	},
	userName: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate(val) {
			if (!validator.isEmail(val))
				throw new Error("Invalid email!");
		}
	},
	phone: {
		type: Number,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	confirmPass: {
		type: String,
		required: true
	},
	gender: {
		type: String, 
		required: true
	},
	//add token field
	tokens:[
		     {
			   token:{
				  type:String,
				  required:true
			     }
		     }
	      ]
});
// "this" keyword functionality is not allow for arrow func that's why we have to use trendition function.

formSchem.methods.generateAuthToken = async function () {
	try {
		const newtoken = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
		this.tokens = this.tokens.concat({token:newtoken});
		return newtoken;
	}
	catch (err) {
		res.status(401).send("The error part is : " + err)
		console.log("The error part is :" + err);
	}
}


//Converting plain text password into hash type password and store into database
formSchem.pre("save", async function (next) {

	if (this.isModified("password")) {
		const hashPass = await bcrypt.hash(this.password, 10);
		this.password = hashPass;
		this.confirmPass = undefined; //no need to store confirm password
	}
	next(); //i.next call save()
});

const Register = new mongoose.model("Register", formSchem);
module.exports = Register;
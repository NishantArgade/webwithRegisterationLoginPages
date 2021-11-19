require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 8000;
console.log(process.env.SECRET_KEY);


require("./DB/conn");                          //Connecting with Database
const Register = require("./Models/register"); //creating register collec

//path of outer folders
const static_path = path.join(__dirname, "../public")
const views_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));   //Register static files Path
app.set("view engine", "hbs");          //set view engine template as hbs(handlebars) 
app.set("views", views_path);           //Register views path for randering hbs files
hbs.registerPartials(partial_path);     //Register Partials 

app.get("/", (req, res) => {
	res.render("home");
});
app.get("/about", (req, res) => {
	res.render("about");
});
app.get("/contact", (req, res) => {
	res.render("contact");
});
app.get("/registration", (req, res) => {
	res.render("regisForm")
});
app.get("/login", (req, res) => {
	res.render("loginForm");
});

// Register new user and save details into database
// for Accessing form data:
//1. use express.urlencoded({ extended: false })
//2. get value of perticular input tag by using it's "name" attribute.

app.use(express.urlencoded({ extended: false }));  //for recognizing/accessing form values/data 

app.post("/registration", async (req, res) => {
	try {
		if (req.body.password === req.body.confirmPass) {
			const newDoc = new Register({
				"fullName": req.body.fullName,
				"userName": req.body.userName,
				"email": req.body.email,
				"phone": req.body.phone,
				"password": req.body.password,
				"confirmPass": req.body.confirmPass,
				"gender": req.body.gender
			});
			// before save document into database
			// use bcrypt module for convert plain text password into hash password for more security
			// and after that store hash password into our database
			// the emplimentation of this show in Modules->register.js 

			//Create/Generate token :
			const token = await newDoc.generateAuthToken();
			// console.log("Register TOKEN : "+token);
			
			const result = await newDoc.save();
			res.status(201).render("loginForm");
		}
		else
		res.status(400).send("Password not match!");
		
	}
	catch (e) { res.status(400).send("Invalid data!"); };
});

// User Login Check/Validation:
// use bcrypt's "compare" method for validation of password  
app.post("/login", async (req, res) => {
	try {
		const loginEmail = req.body.email;
		const loginPass = req.body.password;
		
		const userData = await Register.findOne({ email: loginEmail });
		const isMatch = await bcrypt.compare(loginPass, userData.password);
		
		//Create/Generate token :
		const token = await userData.generateAuthToken();
		console.log("Login TOKEN : "+token);

		if (isMatch) {
			res.status(201).render("home");
		}
		else
			res.status(400).send("Invalid Login Details!");
	}
	catch (e) { res.status(400).send("Invalid Login Details!") };
});

// Authenticaiton and Cookies:
// Q. How to web check user is authentic or not ?
// User authentication:
// All the actions of user which he does on web browser all are recoreded and store in the form fo token inside web Browser Cookies
// using this web browser Cookies, web browser Authenticate the user and allow to use perticular service

//How to Generate/Verify token :
//use "json web token(jwt)" module for generate token

// const createAndVerifyToken = async () => {
// 	//generating token with secure key :
// 	const token = await jwt.sign({ _id: "619728e6d016229d1587e70c" }, "thisismyscretekeyitislt32",{expiresIn:"5 seconds"});	
// 	console.log(token);

// 	//verify token with securekey:
// 	const userVer = await jwt.verify(token, "thisismyscretekeyitislt32");
// 	console.log(userVer);
// }
// createAndVerifyToken();

















app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
var Chat = require('../models/message');
//var Instr = require('../models/instructor');
var Stu = require('../models/student');
//var Admin = require('../models/admin');

var bcrypt = require("bcrypt-nodejs");

/**
 * Finds the past messages from chats.
 *
 * @param {object} req request object
 * @param {object} res response object
 */

exports.findStudent = function(req, res){
    let user = req.query.username;
    console.log(user);
    Stu.find({ "username" : user }, function(err, student){
	if (err) throw err;
	console.log("student:"+student);
	res.send(student);
    });
};

exports.updateStudent = function(req, res){
    let user = req.body.username;
    console.log(user);
    Stu.findOneAndUpdate({ "username" : user},req.body, {new: true}, function(err, student){
	if (err) throw err;
	console.log("Student Saved");
	console.log(student);
	res.send(student);
    });
};

exports.findByCourseName = function(req, res) {

    let course = req.query.course;

    let tag = req.query.tag;

    console.log(course);

    console.log(tag);

    if (tag == 'none'){

	    Chat.find({ "course" : course }, function(err, allChats) {
		if (err) throw err;

		res.send(allChats);
	    });
    }
    else{
	    Chat.find({ "course" : course, "tag" : tag }, function(err, allChats) {
		if (err) throw err;

		res.send(allChats);
	    });
    }

};

/**
 * Adds the messages from chat.
 *
 * @param {object} req request object
 * @param {object} res response object
 */
exports.addMessage = function(req, res) {

    let message = req.body;

    var chat = new Chat(message);

    chat.save(message, function(err) {

        if (err) throw err;

        res.send('Success');

    });

};

exports.registerUser = function(req, res){

    let username = req.body.username;
    let password = bcrypt.hashSync(req.body.password);
    let email = req.body.email;
    let stunum = req.body.stunum;

    console.log(password);

    Stu.find({ "username" : username }, function(err, student){

        if(student.length > 0){
            res.send("Username taken");
        }

        var newUser = new Stu({"username": username, "password": password, "email": email, "stunum": stunum});

        newUser.save(function(err, newUser){
            if(err){
                throw err;
            }

            res.send(newUser);
        });

    
    
    });

};


exports.validateUser = function(req, res){

    let username = req.body.username;
    let password = req.body.password;

    Stu.find({ "username" : username }, function(err, student){
        console.log(student);
        if(student.length === 0){
            res.send("No user found with that username");
        }

        if(bcrypt.compareSync(password, student[0].password)){
            res.send(student);
        }else{
            res.send("Incorrect password");
        }
    
    });

};

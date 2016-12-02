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
    let stunum = req.query.studentnumber;
    console.log(user);
    console.log(stunum);
    if(user){
        Stu.find({ "username" : user }, function(err, student){
        if (err) throw err;
        console.log("student:"+student);
        res.send(student);
        });
    }
    else if(stunum){
        Stu.find({ "studentnum" : stunum }, function(err, student){
        if (err) throw err;
        console.log("student:"+student);
        res.send(student);
        });
    }
    else{
    Stu.find({}, function(err, student){
        if (err) throw err;
        res.send(student);
    });
    }
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

exports.deleteStudent = function(req, res){
    console.log("delete here");
    let user = req.body.username;
    console.log(user);
    Stu.findOneAndRemove({ "username" : user}, function(err){
    if (err) throw err;
    console.log("Student Removed");
    res.send("Success");
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

    // Checking if the fields (by name) aren't empty:
    req.assert('username', 'A username is required').notEmpty();
    req.assert('password', 'A password is required').notEmpty();
    req.assert('email', 'A email is required').notEmpty();
    req.assert('stunum', 'A student number is required').notEmpty();

    // Checking student number (use your custom validation functions):
    req.checkBody('username', 'Username not formatted properly.').isWord();

    // Checking phone number:
    req.checkBody('password', 'Password not formatted properly.').isWord();

    // Checking birthday:
    req.checkBody('email', 'Email not formatted properly.').isWord();

    // Checking birthday:
    req.checkBody('stunum', 'Student number not formatted properly.').isStuNum();

    // Checking for errors and mapping them:
    var errors = req.validationErrors();
    var mappedErrors = req.validationErrors(true);

    if (errors) {
        // If errors exist, send them back to the form:
        var errorMsgs = { 'errors': {} };

        if (mappedErrors.username) {
            errorMsgs.errors.error_username = mappedErrors.username.msg;
        }

        if (mappedErrors.password) {
            errorMsgs.errors.error_password = mappedErrors.password.msg;
        }

        if (mappedErrors.email) {
            errorMsgs.errors.error_email = mappedErrors.email.msg;
        }

        if (mappedErrors.stunum) {
            errorMsgs.errors.error_stunum = mappedErrors.birthday.msg;
        }

        // Note how the placeholders in tapp.html use this JSON:
        res.send(errorMsgs);

    } else {
            
        let username = req.body.username;
        let password = bcrypt.hashSync(req.body.password);
        let email = req.body.email;
        let stunum = req.body.stunum;

        console.log(password);

        Stu.find({ "username" : username }, function(err, student){

            if(student.length > 0){
                res.send("Username taken");
            }

            var newUser = new Stu({"username": username, "password": password, "email": email, "stunum": stunum, "role": "student"});

            newUser.save(function(err, newUser){
                if(err){
                    throw err;
                }

                res.send(newUser);
            });

        
        
        });

    }

};


exports.validateUser = function(req, res){

    let username = req.body.username;
    let password = req.body.password;

    Stu.find({ "username" : username }, function(err, student){
        
        if(student.length === 0){
            res.send("No user found with that username");
        }else{
            if(bcrypt.compareSync(password, student[0].password)){
            res.send(student);
            }else{
                res.send("Incorrect password");
            }
        }
    
    });

};
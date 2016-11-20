var Chat = require('../models/message');
var Instr = require('../models/instructor');

/**
 * Finds the past messages from chats.
 *
 * @param {object} req request object
 * @param {object} res response object
 */
exports.findInstructor = function(req, res){
    let user = req.query.username;
    console.log(user);
    Instr.find({ "username" : user }, function(err, instructor){
	if (err) throw err;
	console.log("response:"+instructor);
	res.send(instructor);
    });
};

exports.findByCourseName = function(req, res) {

    let course = req.query.course;

    console.log(course);

    Chat.find({ "course" : course }, function(err, allChats) {
        if (err) throw err;

        res.send(allChats);
    });

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

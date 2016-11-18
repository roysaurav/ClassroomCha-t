var Chat = require('../models/message');

/**
 * Finds the past messages from chats.
 *
 * @param {object} req request object
 * @param {object} res response object
 */
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
var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

var messageSchema = new Schema(

    {
        content: {
            type: String, required: true
        },

        time: {
            type: Date, default: Date.now
        },

        tag: {
            type: String, require: true
        },

        course: {
            type: String, required: true
        },

        username: {
            type: String, required: true
        }
    },

    {
        collection: 'messages'
    }
)

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.connect('mongodb://heroku_q17zj5pm:b61ghjhsqsj8mnr87qmcqons3g@ds111718.mlab.com:11718/heroku_q17zj5pm');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('Message', messageSchema);
var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

var messageSchema = new Schema(

    {
        content: {
            type: String, required: true
        },

        time {
            type: Timestamp, required: true
        }

    }

    {
        collection: 'messages'
    }
)

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.connect('mongodb://localhost/messagesdb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('Message', bookSchema);
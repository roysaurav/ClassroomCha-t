var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

var studentSchema = new Schema(

    {
        username: {
            type: String, required: true
        },

        fullname: {
            type: String
        },

        email: {
            type: String
        },

        courses: {
            type: Array
        }

    },

    {
        collection: 'students'
    }
)

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.connect('mongodb://localhost/studentdb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('Student', studentSchema);
var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

var chatRoomSchema = new Schema(

    {

        course {
            type: String, required: true
        },

        users {
            type: [String], required: true
        },
	
	instructors {
            type: [String], required: true
        },
	
	admins {
            type: [String], required: true
        },

	blocked {
	    type: [String]
	},
	
	filter{
	    type: [String]
	},
    },

    {
        collection: 'chatRoom'
    }
)

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.connect('mongodb://localhost/chatroomdb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('ChatRoom', chatRoomSchema);

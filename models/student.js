var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

/**
 * Note that the database was loaded with data from a JSON file into a
 * collection called gillers.
 */
var studentSchema = new Schema(
    {
        username: {
            type: String, required: true, unique: true
        },

        password: {
            type: String, requried: true
        },

        email: {
            type: String, required: true,
        },

        studentnum: {
            type: Number
        },

	givenname: {
	    type: String
	},

	lastname: {
	    type: String
	},

	year: {
	    type: String
	},

	status: {
	    type: String
	}
    },
    {
        collection: 'students'
    }
);

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.connect('mongodb://localhost/studentdb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('Student', studentSchema);

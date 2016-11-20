var mongoose = require('mongoose');

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema;

/**
 * Note that the database was loaded with data from a JSON file into a
 * collection called gillers.
 */
var instructorSchema = new Schema(
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

	courses: {
	    type: [String]
	},

	givenname: {
	    type: String
	},

	lastname: {
	    type: String
	}
    },
    {
        collection: 'instructor'
    }
)

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
//mongoose.connect('mongodb://localhost/userdb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = mongoose.model('Instructor', instructorSchema);

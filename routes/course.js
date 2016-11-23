var express = require('express');
var router = express.Router();
var cobaltAPI = require('cobalt-node-wrapper');

// Create new client
var cobalt = new cobaltAPI({
  API_KEY: 'PzRk9k5Hc9Kl85fz4nxIod7lXWCzlHEi'
});

/* GET home page. */
router.get('/', function(req, res) {
  	res.render('course', { title: 'Express' });
});

/* GET home page. */
router.get('/getcourses', function(req, res) {
  	cobalt.get('/courses', {limit: 10}, function(err, req, resp){
        res.send(resp);
    });
});

module.exports = router;

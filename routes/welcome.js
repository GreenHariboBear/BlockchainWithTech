
var express = require('express');
var router = express.Router();


// Get Homepage
router.get('/', function(req, res){
	res.render('index');
});


router.get('/createLog', function(req, res){
	res.render('createLogForm');
});

router.get('/viewLog', function(req, res){
	res.render('submitUsername');
});


module.exports = router;

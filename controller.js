var http = require('http');
var express = require('express');
var express_handlebars = require('express-handlebars');
var routes = require('./routes/welcome');
var bodyParser = require('body-parser');
var hfc = require('hfc');
var util = require('util');
var flash = require('connect-flash');
var session = require('express-session');

// Init App
var app = express();

//Setting Port
app.set('port', 443);

//View Engine
app.set('views', __dirname + '/views');
var hndlbars = express_handlebars.create({defaultLayout:'colors'});
app.engine('handlebars', hndlbars.engine);
app.set('view engine', 'handlebars');

// Set Static Folder
app.use(express.static(__dirname + '/public'));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Application Home page has to be fetched from routes = ./routes/welcome
app.use('/', routes);

//Creating Server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//------------------------------------------------------------------------------------------------------------------------//

var DOCKER_HOST_IP = '139.59.89.51';

console.log("Docker Host IP: " + DOCKER_HOST_IP + "\n");

var SDK_KEYSTORE = "/tmp/keyValStore";
var SDK_MEMBERSRVC_ADDRESS = "grpc://" + DOCKER_HOST_IP + ":7054";
var SDK_PEER_ADDRESSES = [
    "grpc://" + DOCKER_HOST_IP + ":7051",
    "grpc://" + DOCKER_HOST_IP + ":8051",
    "grpc://" + DOCKER_HOST_IP + ":9051",
    "grpc://" + DOCKER_HOST_IP + ":10051"
];
var SDK_EVENTHUB_ADDRESS = "grpc://" + DOCKER_HOST_IP + ":7053";

//
//  Create a chain object
//
var chain = hfc.newChain("testChain");

//
// Configure the chain settings
//

// Set the location of the KeyValueStore
console.log("Setting keyValStore location to: " + SDK_KEYSTORE);
chain.setKeyValStore(hfc.newFileKeyValStore(SDK_KEYSTORE));

// Set the membership services address
console.log("Setting membersrvc address to: " + SDK_MEMBERSRVC_ADDRESS);
chain.setMemberServicesUrl(SDK_MEMBERSRVC_ADDRESS);
var x = "single-peer";

// Set the peer address(es) depending on the network type
if (x == "single-peer") {
    console.log("Setting peer address to: " + SDK_PEER_ADDRESSES[0]);
    chain.addPeer(SDK_PEER_ADDRESSES[0]);
} 
else if (x == "four-peer") {
    SDK_PEER_ADDRESSES.forEach(function(peer_address) {
        console.log("Adding peer address: " + peer_address);
        chain.addPeer(peer_address);
    });
} 
else {
    console.log("ERROR: Please select either a `single-peer` or a `four-peer` network!");
    process.exit(1);
}

// Set the eventHub address
console.log("Setting eventHubAddr address to: " + SDK_EVENTHUB_ADDRESS + "\n");
chain.eventHubConnect(SDK_EVENTHUB_ADDRESS);

process.on('exit', function () {
    console.log("Exiting and disconnecting eventHub channel.");
    chain.eventHubDisconnect();
});

// Set the chaincode deployment mode to "network", i.e. chaincode runs inside
// a Docker container
chain.setDevMode(false);

//
// Declare variables that will be used across multiple operations
//

// User object returned after registration and enrollment

var app_user;

// chaincodeID will store the chaincode ID value after deployment which is
// later used to execute invocations and queries
global.chaincodeID;

////////////////////////////////////////////////////////////////////////////////
// The second part of this app does the required setup to register itself     //
// with the Fabric network. Specifically, it enrolls and registers the        //
// required users and then deploys the chaincode to the network. The          //
// chaincode will then be ready to take invoke and query requests.            //
////////////////////////////////////////////////////////////////////////////////

//
// Enroll the WebAppAdmin member. WebAppAdmin member is already registered
// manually by being included inside the membersrvc.yaml file, i.e. the
// configuration file for the membership services Docker container.
//
chain.getMember("admin", function (err, admin) {
    if (err) {
        console.log("ERROR: Failed to get WebAppAdmin member -- " + err);
        process.exit(1);
    } 
    else {
        console.log("Successfully got WebAppAdmin member.");

        // Enroll the WebAppAdmin member with the certificate authority using
        // the one time password hard coded inside the membersrvc.yaml.
        pw = "Xurw3yU9zI0l";

        admin.enroll(pw, function (err, enrollment) {
            if (err) {
                console.log("ERROR: Failed to enroll WebAppAdmin member -- " + err);
                process.exit(1);
            } 
            else {
                // Set the WebAppAdmin as the designated chain registrar
                console.log("Successfully enrolled WebAppAdmin member.");
                console.log("Setting WebAppAdmin as chain registrar.");
                chain.setRegistrar(admin);
	        // Register a new user with WebAppAdmin as the chain registrar
                console.log("Registering user WebAppUser!!!");
                registerUser("WebApp_user1");
            }
        });
    } 
});

//
// Register and enroll a new user with the certificate authority.
// This will be performed by the member with registrar authority, WebAppAdmin.
//

function registerUser(user_name) {
    // Register and enroll the user
    chain.getMember(user_name, function (err, user) { 
        if (err) {
            console.log("ERROR: Failed to get " + user.getName() + " -- ", err);
            process.exit(1);
        } 
        else {
            app_user = user;
            // User may not be enrolled yet. Perform both registration and enrollment.
            var registrationRequest = {
                enrollmentID: app_user.getName(),
                affiliation: "bank_a"
            };
      
            app_user.registerAndEnroll(registrationRequest, function (err, member) {
                if (err) {
                    console.log("ERROR: Failed to enroll WebAppUser - " + err);
                    process.exit(1);
                } 
                else {
                    console.log("Successfully registered and enrolled WebAppUser!!!\n");

                    // Deploy a chaincode with the new user
                    console.log("Deploying chaincode!!!");
                    deployChaincode()
                }
            });
        }
    });
}

//
// Construct and issue a chaincode deployment request. Deploy the chaincode from
// a local directory in the user's $GOPATH.
//

function deployChaincode() {
    // Construct the deploy request
    var deployRequest = {
        // Path (under $GOPATH/src) required for deploy in network mode
        chaincodePath: "crowd_fund_chaincode" ,
        // Function to trigger
        fcn: "init",
        // Arguments to the initializing function
        args: ["Sona","0"]
    };

    // Trigger the deploy transaction
    var deployTx = app_user.deploy(deployRequest);

    // Print the successfull deploy results
    deployTx.on('complete', function (results) {
        // Set the chaincodeID for subsequent tests
        chaincodeID = results.chaincodeID;
        console.log(util.format("Successfully deployed chaincode: request=%j, " +
        "response=%j" + "\n", deployRequest, results));
        // The chaincode is successfully deployed, start the listener port
        //startListener();
    });

    deployTx.on('error', function (err) {
        // Deploy request failed
        console.log(util.format("ERROR: Failed to deploy chaincode: request=%j, " +
        "error=%j", deployRequest, err));
        process.exit(1);
    });
}
//deploy chaincode ends here


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
 
app.use(bodyParser.json());

//
// Add route for a chaincode query request for a specific state variable
//
console.log("Finally Done!!! Be Happy :p \n");


//-----------------------------------------------------------------------------------------------------------------------------//


app.post('/submitLog', function(req, res) {
    /*var body = req.body;
    console.log(body);*/
    var email = req.body.email;
    var role  = req.body.role;
    var action  = req.body.action;
    var timestamp = req.body.timestamp;
    var worldID = req.body.worldID;
    //var log = username + role + action
  
    console.log("Details - \n Email : "+email+"  Role: "+role+"  Action: "+action+"  Time: "+timestamp +"  WorldID: "+worldID)

    var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "write",
        // Parameters for the invoke function
        args: [email, timestamp, role, action, worldID]
    };

    console.log("Before Invoke Function!!!!!")

    // Trigger the invoke transaction
    var invokeTx = app_user.invoke(invokeRequest);

    console.log("After Invoke Function!!!!!")

    // Invoke transaction submitted successfully
    invokeTx.on('submitted', function (results) {
        console.log(util.format("Successfully submitted chaincode invoke " +
        "transaction: request=%j, response=%j", invokeRequest, results));
    
        res.send({msg : "Successfully Submitted!!!"});
    });

    // Invoke transaction submission failed
    invokeTx.on('error', function (err) {
        var errorMsg = util.format("ERROR: Failed to submit chaincode invoke " +
        "transaction: request=%j, error=%j", invokeRequest, err);
        console.log(errorMsg);
    
        res.send({error : "Unable to save the log!!!"});
    });
});


app.get('/submitUsername/:id',function(req,res) {
    var email = req.params.id;

    var queryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "read",
        // State variable to retrieve
        args: [email]
    };

    // Trigger the query transactio
    var queryTx = app_user.query(queryRequest);

    // Query completed successfully
    queryTx.on('complete', function (results) {
        console.log(util.format("Successfully queried existing chaincode state: " +
        "request=%j, response=%j, value=%s", queryRequest, results, results.result.toString()));
        console.log(results.result.username+"Testing Akhilaaaa Sonaaaaa");

        res.header('Access-Control-Allow-Origin', 'example.com');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    
        var obj = JSON.parse(results.result);
        res.send({result : obj});
    });

    queryTx.on('error', function (err) {
        var errorMsg = util.format("ERROR: Failed to query existing chaincode " +
        "state: request=%j, error=%j", queryRequest, err);
        console.log(errorMsg);

        res.send({error : "No log with this username"});
    });
});


/*const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-type', 'text/plain');
	res.end("Hello World!!");
});

server.listen(port, hostname, () => {
	console.log("Server started on port" + port)
});*/


// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var argv = require('optimist').argv;

// configuration =================

mongoose.connect('mongodb://' + argv.be_ip + ':80/my_database');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model =================
var Order = mongoose.model('Order', {
    date: String,
    time: String,
    pizzaString: String,
    pieces: Number,
    name: String,
    phone: String,
    address: String,
    note: String,
    halfBox: Boolean,
    paid: Boolean,
    taken: Boolean,
    pizzas: String,
    done: Boolean
});

// routes ======================================================================

// api ---------------------------------------------------------------------
// get all orders
app.get('/api/orders', function (req, res) {
    // use mongoose to get all orders in the database
    var d = new Date();
    var orderDate = req.param('date') !== undefined ? req.param('date') :
		     d.getFullYear()
                     + "/" + ((d.getMonth() + 1) < 10 ? '0':'') + (d.getMonth() + 1)
                     + "/" + (d.getDate() + 1 < 10 ? '0':'') + d.getDate();

    Order.find({ date: orderDate }, function (err, orders) {
    //Order.find(function (err, orders) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(orders); // return orders in JSON format
    })
});

// create order and send back all orders after creation
app.post('/api/orders', function (req, res) {
    // create a todo, information comes from AJAX request from Angular
    Order.create({
        date: req.body.date,
        time: req.body.time,
        pizzaString: req.body.pizzaString,
        pieces: req.body.pieces,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        note: req.body.note,
        halfBox: req.body.halfBox,
        paid: req.body.paid,
        taken: req.body.taken,
        pizzas: req.body.pizzas,
        done: req.body.done,
    }, function (err, order) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Order.find(function (err, orders) {
            if (err)
                res.send(err)
            res.json(orders);
        });
    });
});

app.put('/api/orders/:order_id', function (req, res) {
    return Order.findById(req.params.order_id, function (err, order) {
        order.date = req.body.date;
        order.time = req.body.time;
        order.pizzaString = req.body.pizzaString;
        order.pieces = req.body.pieces;
        order.name = req.body.name;
        order.phone = req.body.phone;
        order.address = req.body.address;
        order.note = req.body.note;
        order.halfBox = req.body.halfBox;
        order.paid = req.body.paid;
        order.taken = req.body.taken;
        order.pizzas = req.body.pizzas;
        order.done = req.body.done;
        return order.save(function (err) {
            if (err) {
                res.send(err);
            }
            return res.send(order);
        });
    });
});

// delete an order
app.delete('/api/orders/:order_id', function (req, res) {
    Order.remove({
        _id: req.params.order_id
    }, function (err, order) {
        if (err)
            res.send(err);

        // get and return all the orders after you create another
        Order.find(function (err, orders) {
            if (err)
                res.send(err)
            res.json(orders);
        });
    });
});


// application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendfile('index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/chef', function (req, res) {
    res.sendfile('chef.html');
});

// listen (start app with node server.js) ======================================
app.listen(8080, argv.fe_ip);
console.log("App listening on port 8080");

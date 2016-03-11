var express = require('express');
var router = express.Router();

var paypal = require('paypal-rest-sdk');
var config = require('../../config.json');
paypal.configure(config.api);

/* GET home page. */
router.get('/', function(req, res) {
  console.log('home: session id='+req.sessionID);
  res.render('index', { title: 'Paypal Payments' });
});

router.get('/create/card', function(req, res) {

  console.log('making payment');
  console.log('payment id='+req.session.paymentId );
  console.log('create/card : session id='+req.sessionID);

  var payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "credit_card",
      "funding_instruments": [{
        "credit_card": {
          "number": "5500005555555559",
          "type": "mastercard",
          "expire_month": 12,
          "expire_year": 2018,
          "cvv2": 111,
          "first_name": "Joe",
          "last_name": "Shopper"
        }
      }]
    },
    "transactions": [{
      "amount": {
        "total": "5.00",
        "currency": "USD"
      },
      "description": "My awesome payment"
    }]
  };

  paypal.payment.create(payment, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
/*      if(payment.payer.payment_method === 'paypal') {
        req.session.paymentId = payment.id;
        var redirectUrl;
        for(var i=0; i < payment.links.length; i++) {
          var link = payment.links[i];
          if (link.method === 'REDIRECT') {
            redirectUrl = link.href;
          }
        }
        res.redirect(redirectUrl);
      }*/
      req.session.paymentId = payment.id;
      console.log(payment);
      res.json();
    }
  });

});

router.get('/create/paypal', function(req, res) {

  console.log('making paypal payment');

  var payment = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3200/execute",
      "cancel_url": "http://localhost:3200/cancel"
    },
    "transactions": [{
      "amount": {
        "total": "5.00",
        "currency": "USD"
      },
      "description": "My awesome payment"
    }]
  };

  paypal.payment.create(payment, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
       if(payment.payer.payment_method === 'paypal') {
       req.session.paymentId = payment.id;
       var redirectUrl;
       for(var i=0; i < payment.links.length; i++) {
       var link = payment.links[i];
       if (link.method === 'REDIRECT') {
       redirectUrl = link.href;
       }
       }
       res.redirect(redirectUrl);
       }
      console.log(payment);
    }
  });

});

router.get('/execute', function(req, res){
  var paymentId = req.session.paymentId;
  var payerId = req.param('PayerID');

  var details = { "payer_id": payerId };
  paypal.payment.execute(paymentId, details, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
      res.send("Hell yeah!");
    }
  });
});
module.exports = router;

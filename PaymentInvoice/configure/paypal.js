var paypal = require('paypal-rest-sdk');
const taikhoanControl = require('../controllers/TaiKhoan_Control'); 
const lichsuControl = require('../controllers/LichSu_Control');
const templet_function = require('../controllers/templet_fuction');
const ejs = require('ejs-html');
const fs = require('fs');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASYYgJwM9FoByGbklHM1JMwaoXX1OiGdXviX0snI5vwsayPL3cTQqkbAfAmfS_K303u6wlN57SOyjMAv',
    'client_secret': 'EOsNrrRius4vo1DMBwY2kX1e3n84eApAvZ3TqsMxMV_IrZD3Fe-H3gBN7HV07gi45jOk5uslMGXwvfdj'
});

function createPayPal(req,res)
{
    var money = req.body.money;
    var username = req.body.username;
    var gmailtk = req.body.gmailtk;
    total = money;
    var return_url = req.protocol + '://' + req.get('host') + '/success';
    var cancel_url = req.protocol + '://' + req.get('host') + '/naptien?id=paypal';
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": username,
                    "sku": gmailtk,
                    "price": money,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": money
            },
            "description": "This is the payment description."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            let name = "NẠP TIỀN";
            let icon = "fas fa-handshake";
            let username = req.user.email;
            let tenHV = req.user.hoivien.tenHV;
            let body = ejs.render(fs.readFileSync('./views/form_naptien.ejs', 'utf-8'),{username,tenHV},{vars:['username','tenHV']});
            templet_function.homepage(req, res, body, name, icon);
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
}

function successPaypal(req,res)
{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": total
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(JSON.stringify(error,null,2));
            let name = "NẠP TIỀN";
            let icon = "fas fa-handshake";
            req.flash('alert', 'Số tiền trong tài khoản không đủ để nạp.');
            let body = ejs.render(fs.readFileSync('./views/form_naptien.ejs', 'utf-8'),{username:req.user.email,tenHV:req.user.hoivien.tenHV},{vars:['username','tenHV']});
            templet_function.homepage(req, res, body, name, icon);
        } else {
            let tiennap = req.user.sodu + (total*20000);
            taikhoanControl.thanhtoanHDTK(tiennap,req);
            req.user.sodu = tiennap;
            lichsuControl.luuLichSuNapTien(total,req);
            req.flash('alert', 'Nạp tiền thành công.');
            res.redirect('/');
        }
    });
}
module.exports={
    createPayPal:createPayPal,
    successPaypal:successPaypal
}
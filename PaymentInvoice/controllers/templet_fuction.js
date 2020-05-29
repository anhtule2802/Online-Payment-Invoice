const fs = require('fs');
var ejs = require('ejs-html');
const moment = require('moment');
function homepage(req, res, body, name, icon) {
    if (req == null)
        res.render('trangchu.ejs', {user: null, body , name, icon});
    else {
        // console.log(req.user.sodu);
            res.render('trangchu.ejs', {user: req.user, body, name, icon, message: req.flash('loginMessage'), alert: req.flash('alert')});
    }
};

//Kiểm tra đăng nhập trước khi click vào loaiPage;
function thanhtoanPage(loai, nameCty, url, name, icon, req, res) {
    let body;
    // lấy ra ngày hiện tại
    let date = moment().format('YYYY-MM-DD');
    let time = moment().format('HH:mm:ss');
    console.log(date);
    if(typeof nameCty !== 'undefined') {
        if(url.substr(0,10)=='/thanhtoan')
            body = ejs.render(fs.readFileSync('./views/form_thanhtoan.ejs','utf-8'),{loai,nameCty},{vars:['loai','nameCty']});
        else
        body = ejs.render(fs.readFileSync('./views/form_datlichnhac.ejs','utf-8'),{user: req.user, nowDate: date, nowTime: time, loaiHD: loai, maDN: nameCty, resultUpload: null},{vars: ['user','nowDate','nowTime','loaiHD','maDN','resultUpload']});
    }
    homepage(req,res,body,name,icon);
};

module.exports = {
    homepage: homepage,
    thanhtoanPage:thanhtoanPage,
}
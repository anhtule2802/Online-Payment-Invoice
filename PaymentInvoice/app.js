const express = require('express');
const bodyParser = require('body-parser');
const templet_function = require('./controllers/templet_fuction');
const ejs = require('ejs-html');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const paypal = require('./configure/paypal');
const taikhoanControl = require('./controllers/TaiKhoan_Control');       // gọi hàm trong tài khoản
const datlichControl = require('./controllers/DatLichNhac_Control');
const thanhtoanControl = require('./controllers/ThanhToan_Control');
const lichsuControl = require('./controllers/LichSu_Control');
const qlkhadmin = require('./AreaAdmin/controllers/qlkhcontrol');
const app = express();
// gọi passport configure
require('./configure/passport');
// setup template enine (ejs)
app.set('view engine', 'ejs');

// static files
app.use(express.static('./public'));
app.use(express.static('./views'));

//body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// khởi tạo session
app.use(session({
    secret: "MySecret",
    cookie: {
        maxAge: 6 * 60 * 10000,     // an hour
    },
    resave: true,
    saveUninitialized: true
}));
// khởi tạo passport
app.use(passport.initialize());
app.use(passport.session());

// để thông báo lỗi
app.use(flash());

// 1' kiểm tra dữ liệu 1 lần
setInterval(datlichControl.getLichNhac, 60000);

// gọi đến trang trủ
app.get('/', (req, res) => {
    let body = ejs.render(fs.readFileSync('./views/ChucNangThanhToan.ejs', 'utf-8'));
    let name = "THANH TOÁN HÓA ĐƠN";
    let icon = "glyphicon glyphicon-credit-card";
    templet_function.homepage(req, res, body, name, icon);
});
app.get('/gioithieu',(req,res)=>{
    let body = ejs.render(fs.readFileSync('./views/gioithieu.ejs', 'utf-8'));
    let name = "GIỚI THIỆU WEBSITE";
    let icon = "fas fa-hands";
    templet_function.homepage(req, res, body, name, icon);
})
app.get('/lienhe',(req,res)=>{
    let body = ejs.render(fs.readFileSync('./views/lienhe.ejs', 'utf-8'));
    let name = "LIÊN HỆ";
    let icon = "glyphicon glyphicon-earphone";
    templet_function.homepage(req, res, body, name, icon);
})
app.get('/doitac',(req,res)=>{
    let body = ejs.render(fs.readFileSync('./views/doitac.ejs', 'utf-8'));
    let name = "ĐỐI TÁC";
    let icon = "fas fa-handshake";
    templet_function.homepage(req, res, body, name, icon);
})
app.get('/tcsearch',(req,res)=>{
    let body = ejs.render(fs.readFileSync('./views/tcsearch.ejs', 'utf-8'));
    let name = "TÌM KIẾM THÔNG TIN";
    let icon = "fa fa-search";
    templet_function.homepage(req, res, body, name, icon);
})
//gọi đến chức năng thanh toán
app.get('/thanhtoan', isLoggedIn, (req, res) => {
    let name = "THANH TOÁN HÓA ĐƠN";
    let icon = "glyphicon glyphicon-credit-card";
    var loaiHD = req.query.loaiHD;
    var nameCty = req.query.maDN;
    var makh = req.query.makh;
    // nếu mã kh có thì chuyển qua form xác nhận thanh toán.
    if (typeof makh == 'undefined') {
        // nếu không có id thì đăng click vào chức năng thanh toán hóa đơn.
        if (typeof loaiHD == 'undefined') {
            let body = ejs.render(fs.readFileSync('./views/ChucNangThanhToan.ejs', 'utf-8'));
            templet_function.homepage(req, res, body, name, icon);
        }
        else {
            //Nếu lại nếu name có dữ liệu là đối tượng đang chọn doanh nghiệp
            if (typeof nameCty !== 'undefined') {
                templet_function.thanhtoanPage(loaiHD, nameCty, req.url, name, icon, req, res);
            }
            //Ngược lại name = undefined là đối tượng đang chọn loại HĐ
            else {
                 taikhoanControl.getDoanhNghiepByLoai(loaiHD, res, req,name,icon);
            }
        }
    }
    else {
        if (makh == "") {
            req.flash('alert', 'Vui lòng nhập mã khách hàng.');
            body = ejs.render(fs.readFileSync('./views/form_thanhtoan.ejs', 'utf-8'), { loai: loaiHD, nameCty}, { vars: ['loai', 'nameCty'] });
            templet_function.homepage(req, res, body, name, icon);
        }
        else {
            thanhtoanControl.queryHoaDon(req, res, name, icon);
        }
    }
});
//xác nhận thanh toán.
app.get('/xacnhanthanhtoan', isLoggedIn, (req, res) => {
    let sodu = req.user.sodu - req.query.total;
    taikhoanControl.thanhtoanHDTK(sodu,req);
    req.user.sodu = sodu;
    lichsuControl.queryHoaDon(req);
    thanhtoanControl.updateTTHD(req);
    taikhoanControl.updateTKDN(req);
    req.flash('alert', 'Thanh Toán Hóa Đơn Thành Công');
    res.redirect('/');
});
//gọi đến chức năng nạp tiền
app.get('/naptien', isLoggedIn, (req, res) => {
    let name = "NẠP TIỀN";
    let icon = "fas fa-handshake";
    let id = req.query.id;
    let username = req.user.email;
    let tenHV = req.user.hoivien.tenHV;
    // có username là đang xử lý form nạp tiền.
    //không có id thì vào trang chọn cổng nạp tiền
    if (typeof id == 'undefined') {
        let body = ejs.render(fs.readFileSync('./views/ChucNangNapTien.ejs', 'utf-8'));
        templet_function.homepage(req, res, body, name, icon);
    }
    //có id thì vào form nạp tiền
    else {
        let body = ejs.render(fs.readFileSync('./views/form_naptien.ejs', 'utf-8'),{username,tenHV},{vars:['username','tenHV']});
        templet_function.homepage(req, res, body, name, icon);
    }
});

app.post('/pay', isLoggedIn, (req, res) => {
    paypal.createPayPal(req,res);
});

app.get('/success', isLoggedIn, (req, res) => {
    paypal.successPaypal(req,res);
});

//Chức năng lịch sử
app.get('/lichsu', isLoggedIn, (req, res) => {
    if(typeof req.query.search == 'undefined' || req.query.search == ""){
        lichsuControl.getALLItem(req,res);
    }
    else
        lichsuControl.getListItemsInMonth(req,res);
});

app.get('/datlich', isLoggedIn, (req, res) => {
    let name = "ĐẶT LỊCH NHẮC";
    let icon = "far fa-calendar-alt";
    var loaiHD = req.query.loaiHD;
    var nameCty = req.query.maDN;
    // nếu không có id thì đăng click vào chức năng thanh toán hóa đơn.
    if (typeof loaiHD == 'undefined') {
        let body = ejs.render(fs.readFileSync('./views/ChucNangDatLich.ejs', 'utf-8'));
        templet_function.homepage(req, res, body, name, icon);
    }
    else {
        //Nếu lại nếu name có dữ liệu là đối tượng đang chọn doanh nghiệp
        if (typeof nameCty !== 'undefined') {
            templet_function.thanhtoanPage(loaiHD, nameCty, req.url, name, icon, req, res);
        }
        //Ngược lại name = undefined là đối tượng đang chọn loại HĐ
        else {
            taikhoanControl.getDoanhNghiepByLoai(loaiHD, res, req,name,icon);
        }
    }
});
// kiểm tra mã khách hàng của doanh nghiệp để đặt lịch tự động
app.get('/checkMaKH', (req, res) => {
    datlichControl.kiemtraKhachHangInDoanhNghiep(req, res);
});
// Lưu đặt lịch
app.post('/savelichnhac', (req, res) => {
    datlichControl.kiemtraDatLich(req, res);
});

//xử lý đăng nhập
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/',
    successRedirect: '/router'
}));

app.get('/router', (req, res) => {
    if (req.user.loaiTK == 1)
        res.redirect('/');
    else if(req.user.loaiTK == 2){
        res.redirect('/lichsuthanhtoan');
    }
    else if(req.user.loaiTK == 3){
        req.logout();
        req.flash('loginMessage','Tên đăng nhập hoặc mật khẩu không đúng');
        res.redirect('/');
    }
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// xử lý đăng ký cho hội viên
app.post('/signup', (req, res) => {
    console.log('/signup');

    // truyền vào loaiTK == 1 để thêm hội viên
    taikhoanControl.kiemtraEmail(req, res, 1);
});

// Thông báo 'alert' đến trang chủ
function isLoggedIn(req, res, next) {
    // Nếu đã xác thực thì đi tiếp
    if (req.isAuthenticated()){
        if (req.user.loaiTK==1)
        {
            return next();
        }
        else
        {
            req.flash('alert', 'Phải đăng nhập vào tài khoản của hội viên.');
            res.redirect('/');
            return;
        }
    }
        

    // Nếu chưa, đưa về trang chủ
    req.flash('alert', 'Bạn chưa thực hiện đăng nhập.');
    res.redirect('/');
};
function isLoggedDoanhNgiep(req, res, next) {
    // Nếu đã xác thực thì đi tiếp
    if (req.isAuthenticated())
        if (req.user.loaiTK == 2)
            return next();
        else {
            req.flash('alert', 'Phải đăng nhập vào tài khoản của doanh nghiệp.');
            res.redirect('/');
            return;
        }
    // Nếu chưa, đưa về trang chủ
    req.flash('alert', 'Bạn chưa thực hiện đăng nhập.');
    res.redirect('/');
};
function isLoggedAdmin(req, res, next) {
    // Nếu đã xác thực thì đi tiếp
    if (req.isAuthenticated())
        if (req.user.loaiTK == 3) {
            req.flash('alert', '');
            return next();
        }
        else {
            req.flash('alert', 'Phải đăng nhập vào tài khoản của Admin.');
            res.redirect('/admin');
            return;
        }
    // Nếu chưa, đưa về trang chủ
    req.flash('alert', 'Bạn chưa thực hiện đăng nhập.');
    res.redirect('/admin');
};
//============================================ DOANH NGHIỆP ============================================//
app.get('/lichsuthanhtoan',isLoggedDoanhNgiep,(req,res)=>{
    lichsuControl.getListItemsTrue(req,res);
})
app.get('/capnhatkhachhang', isLoggedDoanhNgiep, (req, res) => {
    let body = ejs.render(fs.readFileSync('./views/form_capnhatkh.ejs', 'utf-8'), {resultUpload: null},{vars: ['resultUpload']});
    let name = "CẬP NHẬT KHÁCH HÀNG";
    let icon = "glyphicon glyphicon-copy";
    templet_function.homepage(req, res, body, name, icon);
});
app.post('/uploadFileKH', (req, res) => {
    let name = "CẬP NHẬT KHÁCH HÀNG";
    let icon = "glyphicon glyphicon-copy";
    taikhoanControl.uploadFileOfDoanhNghiep(req, res, name, icon, 1);
});

app.get('/capnhathoadon', isLoggedDoanhNgiep, (req, res) => {
    let body = ejs.render(fs.readFileSync('./views/form_capnhathd.ejs', 'utf-8'), {resultUpload: null},{vars: ['resultUpload']});
    let name = "CẬP NHẬT HÓA ĐƠN";
    let icon = "glyphicon glyphicon-copy";
    templet_function.homepage(req, res, body, name, icon);
});
/**
 * If loaiFile = 1 thì là upload danh sách khách hàng
 * Else upload hóa đơn
 */
app.post('/uploadFileHoaDon', (req, res) => {
    let name = "CẬP NHẬT HÓA ĐƠN";
    let icon = "glyphicon glyphicon-copy";

    taikhoanControl.uploadFileOfDoanhNghiep(req, res, name, icon, 2);
});

//============================================ ADMIN ===============================================//
app.get('/admin-logout', (req, res) => {
    req.logout();
    res.redirect('/admin');
});
app.get('/admin', (req, res) => {
    req.logout();
    res.render('../AreaAdmin/loginadmin.ejs', {message: req.flash('loginMessage')});
}); 
app.post('/admin-login', passport.authenticate('local', {
    failureRedirect: '/admin',
    successRedirect: '/admin-qlkh'
}));
app.get('/admin-qlkh',isLoggedAdmin, async (req, res) => {
    if(req.user.loaiTK == 3)
    {
        if (typeof req.query.search == 'undefined' || req.query.search == "") {
            let data = await qlkhadmin.getAllKH();
            console.log("all");
            
            let body = ejs.render(fs.readFileSync('./AreaAdmin/qlkh.ejs', 'utf-8'), { data }, { vars: ['data'] });
            res.render('../AreaAdmin/trangchu.ejs', { body,message: req.flash('loginMessage'), alert: req.flash('alert') });
        }
        else {
            console.log(req.query.search);
            
            let data = await qlkhadmin.searchKH(req.query.search);
            let body = ejs.render(fs.readFileSync('./AreaAdmin/qlkh.ejs', 'utf-8'), { data }, { vars: ['data'] });
            res.render('../AreaAdmin/trangchu.ejs', { body,message: req.flash('loginMessage'), alert: req.flash('alert') });
        }
    }
    else{
        req.logout();
        req.flash('loginMessage','Tên đăng nhập hoặc mật khẩu không đúng');
        res.redirect('/admin');
    }
});

app.get('/admin-qldn',isLoggedAdmin, async (req, res) => {
    if (typeof req.query.search == 'undefined' || req.query.search == "") {
        let data = await qlkhadmin.getAllKH();
        console.log("all");
        
        let body = ejs.render(fs.readFileSync('./AreaAdmin/qldn.ejs', 'utf-8'), { data }, { vars: ['data'] });
        res.render('../AreaAdmin/trangchu.ejs', { body,message: req.flash('loginMessage'), alert: req.flash('alert') });
    }
    else {
        console.log(req.query.search);
        
        let data = await qlkhadmin.searchDN(req.query.search);
        let body = ejs.render(fs.readFileSync('./AreaAdmin/qldn.ejs', 'utf-8'), { data }, { vars: ['data'] });
        res.render('../AreaAdmin/trangchu.ejs', { body,message: req.flash('loginMessage'), alert: req.flash('alert') });
    }
});
app.get('/admin-dkdn',isLoggedAdmin,(req, res) => {
    let body = ejs.render(fs.readFileSync('./AreaAdmin/dkdn.ejs', 'utf-8'), { resultUpload: null }, { vars: ['resultUpload'] });
    res.render('../AreaAdmin/trangchu.ejs', {body,message: req.flash('loginMessage'), alert: req.flash('alert')});
}); 
app.post('/registerDN', (req, res) => {
    taikhoanControl.uploadFileImage(req, res);
});

app.get('/admin-tkdv',isLoggedAdmin,async (req,res)=>{
    let kh = await qlkhadmin.getThongKeHoaDon('2019');
    let sotien = await qlkhadmin.getDoanhThu('2019');
    let nam = new Date().getFullYear();
    let tongdt = 0;
    let tonghd = 0;
    sotien.forEach(x => {
        tongdt += x;
    });
    kh.forEach(x => {
        tonghd += x;
    });

    let body = ejs.render(fs.readFileSync('./AreaAdmin/tkdv.ejs', 'utf-8'),{kh,sotien,nam,tongdt,tonghd},{vars:['kh','sotien','nam','tongdt','tonghd']});
    res.render('../AreaAdmin/trangchu.ejs',{body,message: req.flash('loginMessage'), alert: req.flash('alert')});
})

app.post('/admin-tkdv',isLoggedAdmin,async (req,res)=>{
    let nam = req.body.combobox;
    let kh = await qlkhadmin.getThongKeHoaDon(nam);
    let sotien = await qlkhadmin.getDoanhThu(nam);
    let tongdt = 0;
    let tonghd = 0;
    sotien.forEach(x => {
        tongdt += x;
    });
    kh.forEach(x => {
        tonghd += x;
    });

    let body = ejs.render(fs.readFileSync('./AreaAdmin/tkdv.ejs', 'utf-8'),{kh,sotien,nam,tongdt,tonghd},{vars:['kh','sotien','nam','tongdt','tonghd']});
    res.render('../AreaAdmin/trangchu.ejs',{body,message: req.flash('loginMessage'), alert: req.flash('alert')}); 
})

app.listen(9000, () => {
    console.log('Server running on the port 9000');
});
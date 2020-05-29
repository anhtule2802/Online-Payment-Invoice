const aws = require('aws-sdk');
const moment = require('moment');
const uuid4 = require('uuid/v4');
const templet_function = require('./templet_fuction');
const ejs = require('ejs-html');
const fs = require('fs');

const nodemailer = require('nodemailer');
const handlebar = require('nodemailer-express-handlebars');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'testsend312@gmail.com',
        pass: 'ABC@abc123'
    },
    tls: {
        rejectUnauthorized: false
    }
});
transporter.use('compile', handlebar({
    viewEngine: {
        extName: '.ejs',
        partialsDir: './views',
        layoutsDir: './views',
        defaultLayout: 'email_info.ejs',
    },
    viewPath: './views',
    extName: '.ejs'
}));

function sendEmai(dsLichNhac) {
    dsLichNhac.forEach(lich => {
        let noidung = "Hôm nay là ngày bạn hẹn thanh toán hóa đơn";

        if (lich.loaiHD == 1)
            noidung += " tiền điện";
        else if (lich.loaiHD == 2)
            noidung += " tiền nước";
        else
            noidung += " tiền internet";

        let ghichu = lich.ghichu;

        if (lich.maKH === "null") {
            transporter.sendMail({
                from: 'emailsend312@gmail.com',
                to: lich.email,
                subject: 'NHẮC THANH TOÁN HÓA ĐƠN',
                template: 'email_info',
                context: {
                    noidung,
                    ghichu
                }
            }, (err, response) => {
                if (err) {
                    console.log('gửi thất bại' + `${JSON.stringify(err, null, 2)}`);
                }
                else console.log('gửi thành công');
            });
        }
        else {
            getHoaDonOfKhachHang(lich, noidung, ghichu);
        }
    });
}

require('../configure/dynamodb');       // kết nối database

const docClient = new aws.DynamoDB.DocumentClient();

function kiemtraDatLich(req, res) {
    const { ngayhen, giohen, maDN, loaiHD } = req.body;
    const user = req.user;
    let arrs = giohen.split(':');
    let minute = Number(arrs[0]) * 60 + Number(arrs[1]);

    let params = {
        TableName: "LichNhac",
        IndexName: "kiemtraDatLich"
    };
    params.KeyConditionExpression = '#email = :email and #ngayhen = :ngayhen';     // sử dụng này thì dùng query
    params.FilterExpression = '#giohen = :giohen and #maDN = :maDN and #loaiHD = :loaiHD';
    params.ExpressionAttributeNames = {
        '#email': "email",
        '#ngayhen': "ngayhen",
        '#giohen': "giohen",
        '#maDN': "maDN",
        '#loaiHD': "loaiHD"
    };
    params.ExpressionAttributeValues = {
        ':email': String(user.email),
        ':ngayhen': String(ngayhen),
        ':giohen': Number(minute),
        ':maDN': Number(maDN),
        ':loaiHD': Number(loaiHD)
    };

    let result = {};
    docClient.query(params, (err, data) => {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else {
            result = data.Items;

            if (result[0]) {
                // Nếu đã đặt lịch nhắc, thông báo đưa về trang chủ
                req.flash('alert', 'Bạn đã đặt lịch nhắc này rồi');
                res.redirect('/datlich');
            }
            else
                themLichNhac(req, res);
        }
    });
};

function tinhSoPhut() {
    let gio = moment().get('hour');
    let phut = gio * 60 + moment().get('minute');
    return phut;
};

function getLichNhac() {
    let nowdate = moment().format("YYYY-MM-DD");
    let nowMinute = tinhSoPhut();
    
    let params = {
        TableName: "LichNhac",
        IndexName: "getListLichNhac"
    };

    params.KeyConditionExpression = '#ngayhen = :ngayhen and #giohen = :giohen';     // sử dụng này thì dùng query

    params.ExpressionAttributeNames = {
        '#ngayhen': "ngayhen",
        '#giohen': "giohen"
    };
    params.ExpressionAttributeValues = {
        ':ngayhen': String(nowdate),
        ':giohen': Number(nowMinute)
    };

    let dslich = {};
    docClient.query(params, (err, data) => {
        if (err) {
            console.log(moment().format('LTS'));
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            dslich = data.Items;

            // gửi hóa đơn đến email khách hàng theo ds đặt lịch
            if (dslich.length > 0)
                sendEmai(dslich);


            // thực hiện xong xóa ds
            // if (dslich)
            //     deleteItem(dslich)
        }
    });
};

/**
 * sau khi thực hiện thì xóa lịch nhắc này đi
 */
function deleteItem(dslich) {
    dslich.forEach(ele => {
        let params = {
            TableName: "LichNhac",
            Key: {
                "maLich": String(ele.maLich)
            }
        };
        docClient.delete(params, (err, data) => {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("xóa thành công" + `${data}`);
                console.log("---------------------------------------");
            }
        })
    });
}

// New *******************
function themLichNhac(req, res) {
    const { ngayhen, giohen, ghichu, maDN, loaiHD, maKH } = req.body;
    const user = req.user;

    let arrs = giohen.split(':');
    let minute = Number(arrs[0]) * 60 + Number(arrs[1]);

    let params = {
        TableName: "LichNhac"
    };

    if (maKH != null) {
        if (ghichu === '') {
            params.Item = {
                "maLich": uuid4(),
                "ngayhen": String(ngayhen),
                "giohen": Number(minute),
                "email": String(user.email),
                "taikhoan": {
                    "matKhau": String(user.matKhau),
                    "loaiTK": Number(user.loaiTK),
                    "sodu": Number(user.sodu),
                    "maHV": String(user.maHV),
                    "hoivien": {
                        "tenHV": String(user.hoivien.tenHV),
                        "sodt": String(user.hoivien.sodt),
                        "diachi": String(user.hoivien.diachi)
                    }
                },
                "maDN": Number(maDN),
                "loaiHD": Number(loaiHD),
                "maKH": maKH
            };
        }
        else {
            params.Item = {
                "maLich": uuid4(),
                "ngayhen": String(ngayhen),
                "giohen": Number(minute),
                "email": String(user.email),
                "taikhoan": {
                    "matKhau": String(user.matKhau),
                    "loaiTK": Number(user.loaiTK),
                    "sodu": Number(user.sodu),
                    "maHV": String(user.maHV),
                    "hoivien": {
                        "tenHV": String(user.hoivien.tenHV),
                        "sodt": String(user.hoivien.sodt),
                        "diachi": String(user.hoivien.diachi)
                    }
                },
                "maDN": Number(maDN),
                "loaiHD": Number(loaiHD),
                "maKH": maKH,
                "ghichu": String(ghichu)
            };
        }
    }
    else {
        if (ghichu === '') {
            params.Item = {
                "maLich": uuid4(),
                "ngayhen": String(ngayhen),
                "giohen": Number(minute),
                "email": String(user.email),
                "taikhoan": {
                    "matKhau": String(user.matKhau),
                    "loaiTK": Number(user.loaiTK),
                    "sodu": Number(user.sodu)
                },
                "maDN": Number(maDN),
                "loaiHD": Number(loaiHD),
                "maKH": null
            };
        }
        else {
            params.Item = {
                "maLich": uuid4(),
                "ngayhen": String(ngayhen),
                "giohen": Number(minute),
                "email": String(user.email),
                "taikhoan": {
                    "matKhau": String(user.matKhau),
                    "loaiTK": Number(user.loaiTK),
                    "sodu": Number(user.sodu)
                },
                "maDN": Number(maDN),
                "loaiHD": Number(loaiHD),
                "maKH": null,
                "ghichu": String(ghichu)
            };
        }
    }

    docClient.put(params, (err, data) => {
        if (err)
            console.log(`${JSON.stringify(err, null, 2)}`);
        else {
            // Nếu có email, thông báo đưa về trang chủ
            req.flash('alert', 'Đặt lịch thành công');
            res.redirect('/datlich');
        }
    });
};

function getListCustomerOfBusiness(maDN, callback) {
    let params = {
        TableName: "TaiKhoan",
        IndexName: "getListCustomerOfBusiness"
    };
    params.KeyConditionExpression = '#maDN = :maDN';
    // params.FilterExpression = "contains(#dn.dsKhachHang, :kh)";
    params.ExpressionAttributeNames = {
        '#maDN': "maDN",
        // #dn': "doanhnghiep"
    };
    params.ExpressionAttributeValues = {
        ':maDN': Number(maDN),
        // ':kh': {
        //     'M': {
        //         'maKH': String("4000003")
        //     }
        // }
    };
    docClient.query(params, (err, data) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        }
        else
            callback(data.Items[0]);
    });
};

function kiemtraKhachHangInDoanhNghiep(req, res) {
    let name = "ĐẶT LỊCH NHẮC";
    let icon = "far fa-calendar-alt";
    let { loaiHD, maDN, maKH } = req.query;
    let date = moment().format('YYYY-MM-DD');
    let time = moment().format('HH:mm:ss');

    getListCustomerOfBusiness(maDN, (callback) => {
        let listKH = callback.doanhnghiep.dsKhachHang;
        let resultUpload = "false";

        listKH.forEach(element => {
            if (element.maKH === maKH) {
                resultUpload = "true";
                return false;
            }
        });
        let body = ejs.render(fs.readFileSync('./views/form_datlichnhac.ejs', 'utf-8'), { user: req.user, nowDate: date, nowTime: time, loaiHD: loaiHD, maDN: maDN, resultUpload: resultUpload, maKH: maKH }, { vars: ['user', 'nowDate', 'nowTime', 'loaiHD', 'maDN', 'resultUpload', 'maKH'] });
        templet_function.homepage(req, res, body, name, icon);
        return true;
    })
};

function getHoaDonOfKhachHang(lichnhac, noidung, ghichu) {
    let { email, maDN, loaiHD, maKH, ngayhen } = lichnhac;

    let hdThang = moment(ngayhen).format("YYYY-MM");
    let params = {
        TableName: 'HoaDon',
        IndexName: 'getHoaDonKH',
    };
    params.KeyConditionExpression = 'maDN =:dn and maKH =:kh';
    params.FilterExpression = 'loaiHD = :loaiHD and hoadonThang = :hdThang'
    params.ExpressionAttributeValues = {
        ':dn': Number(maDN),
        ':kh': String(maKH),
        ':loaiHD': Number(loaiHD),
        ':hdThang': String(hdThang)
    }
    let queryHD = {};
    docClient.query(params, (err, data) => {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else {
            let ndHoaDon;
            var total = 0;
            queryHD = data.Items;
            if (queryHD.length > 0) {
                ndHoaDon = queryHD[0];
                if (loaiHD == 3)
                    total = queryHD[0].giatien + queryHD[0].giatien * queryHD[0].thue;
                else
                    total = (queryHD[0].chisomoi - queryHD[0].chisocu) * queryHD[0].giatien + ((queryHD[0].chisomoi - queryHD[0].chisocu) * queryHD[0].giatien) * queryHD[0].thue;

                if (queryHD[0].trangthai == false) {
                    var sodu = lichnhac.taikhoan.sodu - total;
                    if (sodu >= 0) {
                        // cập nhật lại số dư của tài khoản
                        thanhtoanHDTK(sodu, lichnhac);
                        // cập nhật lại thông tin hóa đơn
                        updateTTHD(queryHD[0].maHD, queryHD[0].loaiHD);
                        // cập nhật số dư tài khoản doanh nghiệp
                        updateTKDN(queryHD[0].maDN, total);
                        // thêm lịch sử
                        luuLichSu(queryHD[0], total, lichnhac);

                        // nội dung gửi mail
                        noidung += ". Hóa đơn này đã thanh toán thành công."
                    }
                    else
                        noidung += `. Số dư trong tài khoản của bạn ${lichnhac.taikhoan.sodu} không đủ để thanh toán hóa đơn này.`
                }
                else
                    noidung += `. Hóa đơn này đã được thanh toán.`
            }
            else {
                ndHoaDon = null;
                noidung += `. Mã khách hàng ${maKH} này chưa tới có hóa đơn trong tháng ${moment().format("YYYY-MM")}`;
            }
            transporter.sendMail({
                from: 'emailsend312@gmail.com',
                to: email,
                subject: 'NHẮC THANH TOÁN HÓA ĐƠN',
                template: 'email_info',
                context: {
                    noidung,
                    ndHoaDon,
                    total,
                    ghichu
                }
            }, (err, response) => {
                if (err)
                    console.log('gửi thất bại' + `${JSON.stringify(err, null, 2)}`);
                else console.log('gửi thành công');
            });
        }
    });
};

// số dư = user.sodu - total (tổng tiền hóa đơn)
function thanhtoanHDTK(sodu, lichnhac) {
    let email = lichnhac.email;
    let mk = lichnhac.taikhoan.matKhau;
    let params = {
        TableName: 'TaiKhoan',
        Key: {
            "email": String(email),
            "matKhau": String(mk),
        },
        UpdateExpression: "set #t = :sodu",
        ExpressionAttributeNames: {
            '#t': 'sodu',
        },
        ExpressionAttributeValues: {
            ':sodu': Number(sodu)
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, (err, data) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            console.log('Thành Công TK');
        }
    })
};
function updateTTHD(maHD, loaiHD) {
    let trangthai = true;
    let params = {
        TableName: 'HoaDon',
        Key: {
            "maHD": String(maHD),
            "loaiHD": Number(loaiHD),
        },
        UpdateExpression: "set #t = :trangthai",
        ExpressionAttributeNames: {
            '#t': 'trangthai',
        },
        ExpressionAttributeValues: {
            ':trangthai': Boolean(trangthai)
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, (err, data) => {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else
            console.log('Thành Công TT');
    })
};
function updateTKDN(maDN, total) {
    let params = {
        TableName: "TaiKhoan",
        IndexName: 'getDN',
    };
    let queryDN = {};
    params.KeyConditionExpression = 'maDN =:dn';
    params.ExpressionAttributeValues = {
        ':dn': Number(maDN)
    }
    docClient.query(params, (err, data) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            queryDN = data.Items;
            let sodu = parseInt(total) + parseInt(queryDN[0].sodu);
            let params = {
                TableName: 'TaiKhoan',
                Key: {
                    "email": String(queryDN[0].email),
                    "matKhau": String(queryDN[0].matKhau),
                },
                UpdateExpression: "set #t = :sodu",
                ExpressionAttributeNames: {
                    '#t': 'sodu',
                },
                ExpressionAttributeValues: {
                    ':sodu': Number(sodu)
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log(JSON.stringify(err, null, 2));
                }
                else {
                    console.log('Thành Công TK');
                }
            })
        }
    });
};
function luuLichSu(hoadon, total, lichnhac) {
    var ngayGiaoDich = moment().format("YYYY-MM-DD");
    var thoigianGD = moment().format("HH:mm:ss");
    // let random = uuid4().split('-');
    // let randomMaGD = random[4];
    let params = {
        TableName: 'LichSuGiaoDich',
    };
    if (hoadon.loaiHD == 1 || hoadon.loaiHD == 2) {
        params.Item = {
            "maGiaoDich": uuid4(),
            "ngayGiaoDich": ngayGiaoDich,
            "thoigianGD": thoigianGD,
            "loaiGiaoDich": Number(0),
            "phiGiaoDich": Number(1000),
            "soTien": Number(total),
            "maDN": Number(hoadon.maDN),
            "hoadon": {
                "maHD": String(hoadon.maHD),
                "loaiHD": Number(hoadon.loaiHD),
                "thue": Number(hoadon.thue),
                "chisocu": Number(hoadon.chisocu),
                "chisomoi": Number(hoadon.chisomoi),
                "giatien": Number(hoadon.giatien),
                "doanhnghiep": {
                    "tenDN": String(hoadon.doanhnghiep.tenDN),
                    "loaiDN": Number(hoadon.doanhnghiep.loaiDN),
                    "sodt": String(hoadon.doanhnghiep.sodt),
                    "diachiDN": String(hoadon.doanhnghiep.diachiDN),
                },
                "khachhang": {
                    "maKH": String(hoadon.maKH),
                    "tenKH": String(hoadon.khachhang.tenKH),
                    "sodt": String(hoadon.khachhang.sodt),
                    "diachi": String(hoadon.khachhang.diachi)
                }
            },
            "maHV": String(lichnhac.taikhoan.maHV),
            "hoivien": {
                "tenHV": String(lichnhac.taikhoan.hoivien.tenHV),
                "sodt": String(lichnhac.taikhoan.hoivien.sodt),
                "diachi": String(lichnhac.taikhoan.hoivien.diachi)
            }
        }
    }
    else if (hoadon.loaiHD == 3) {
        params.Item = {
            "maGiaoDich": uuid4(),
            "ngayGiaoDich": ngayGiaoDich,
            "thoigianGD": thoigianGD,
            "loaiGiaoDich": Number(0),
            "phiGiaoDich": Number(1000),
            "soTien": Number(total),
            "maDN": Number(hoadon.maDN),
            "hoadon": {
                "maHD": String(hoadon.maHD),
                "loaiHD": Number(hoadon.loaiHD),
                "thue": Number(hoadon.thue),
                "tengoicuoc": String(hoadon.tengoicuoc),
                "giatien": Number(hoadon.giatien),
                "doanhnghiep": {
                    "tenDN": String(hoadon.doanhnghiep.tenDN),
                    "loaiDN": Number(hoadon.doanhnghiep.loaiDN),
                    "sodt": String(hoadon.doanhnghiep.sodt),
                    "diachiDN": String(hoadon.doanhnghiep.diachiDN),
                },
                "khachhang": {
                    "maKH": String(hoadon.maKH),
                    "tenKH": String(hoadon.khachhang.tenKH),
                    "sodt": String(hoadon.khachhang.sodt),
                    "diachi": String(hoadon.khachhang.diachi)
                }
            },
            "maHV": String(lichnhac.taikhoan.maHV),
            "hoivien": {
                "tenHV": String(lichnhac.taikhoan.hoivien.tenHV),
                "sodt": String(lichnhac.taikhoan.hoivien.sodt),
                "diachi": String(lichnhac.taikhoan.hoivien.diachi)
            }
        }
    }
    docClient.put(params, (err, data) => {
        if (err) {
            console.log('lỗi phần luu')
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            console.log('Thành Công LS');
        }
    })
};

module.exports = {
    kiemtraDatLich: kiemtraDatLich,
    getLichNhac: getLichNhac,
    kiemtraKhachHangInDoanhNghiep: kiemtraKhachHangInDoanhNghiep
}
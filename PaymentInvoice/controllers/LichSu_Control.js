const aws = require('aws-sdk');
const ejs = require('ejs-html');
const fs = require('fs');
const moment = require('moment');
const uuid4 = require('uuid/v4');

require('../configure/dynamodb');
const docClient = new aws.DynamoDB.DocumentClient();
const templet_function = require('./templet_fuction');

function luuLichSuNapTien(total, req) {
    var ngayGiaoDich = moment().format("YYYY-MM-DD");
    var thoigianGD = moment().format("HH:mm:ss");
    var tiennap = total * 20000;
    let params = {
        TableName: 'LichSuGiaoDich',
        Item: {
            "maGiaoDich": uuid4(),
            "ngayGiaoDich": ngayGiaoDich,
            "thoigianGD": thoigianGD,
            "loaiGiaoDich": Number(1),
            "phuongthucnap": String("Paypal"),
            "tiennap": Number(tiennap),
            "maHV": String(req.user.maHV),
            "hoivien": {
                "tenHV": String(req.user.hoivien.tenHV),
                "sodt": String(req.user.hoivien.sodt),
                "diachi": String(req.user.hoivien.diachi)
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
}
function luuLichSu(hoadon, req) {
    var ngayGiaoDich = moment().format("YYYY-MM-DD");
    var thoigianGD = moment().format("HH:mm:ss");
    var soTien = req.query.total;
    let params = {
        TableName: 'LichSuGiaoDich'
    };
    if (hoadon.loaiHD == 1 || hoadon.loaiHD == 2) {
        params.Item = {
            "maGiaoDich": uuid4(),
            "ngayGiaoDich": ngayGiaoDich,
            "thoigianGD": thoigianGD,
            "loaiGiaoDich": Number(0),
            "phiGiaoDich": Number(1000),
            "soTien": Number(soTien),
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
            "maHV": String(req.user.maHV),
            "hoivien": {
                "tenHV": String(req.user.hoivien.tenHV),
                "sodt": String(req.user.hoivien.sodt),
                "diachi": String(req.user.hoivien.diachi)
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
            "soTien": Number(soTien),
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
            "maHV": String(req.user.maHV),
            "hoivien": {
                "tenHV": String(req.user.hoivien.tenHV),
                "sodt": String(req.user.hoivien.sodt),
                "diachi": String(req.user.hoivien.diachi)
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
}

function queryHoaDon(req) {
    let maHD = req.query.maHD;
    let loaiHD = req.query.loaiHD;
    let params = {
        TableName: 'HoaDon',
    };
    let queryHD = {};
    if (maHD) {
        if (loaiHD) {
            params.KeyConditionExpression = 'maHD =:ma and loaiHD=:l';
            params.ExpressionAttributeValues = {
                ':ma': String(maHD),
                ':l': Number(loaiHD)
            }
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(JSON.stringify(err, null, 2));
                    queryHD.err = err;
                }
                else {
                    console.log('Success LS')
                    queryHD = data.Items;
                    luuLichSu(queryHD[0], req);
                }
            })
        }
    }
}

function getALLItem(req, res) {
    var maGD = req.query.maGD;
    var maHV = req.user.maHV;
    let name = "LỊCH SỬ GIAO DỊCH";
    let icon = "far fa-eye";
    let params = {
        TableName: "LichSuGiaoDich",
        IndexName: 'getListGiaoDichOfMember',
    }
    let scanObject = {};
    params.KeyConditionExpression = "maHV=:hv"
    params.ExpressionAttributeValues = {
        ':hv': String(maHV)
    }
    docClient.query(params, (err, data) => {
        if (err) {
            scanObject.err = err;
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            scanObject.data = data;
            let body = ejs.render(fs.readFileSync('./views/ChucNangLichSu.ejs', 'utf-8'), { object: scanObject }, { vars: ['object'] });
            templet_function.homepage(req, res, body, name, icon);
        }
    })
}
function getListItemsInMonth(req, res) {
    var maGD = req.query.maGD;
    var maHV = req.user.maHV;
    let name = "LỊCH SỬ GIAO DỊCH";
    let icon = "far fa-eye";
    let params = {
        TableName: "LichSuGiaoDich",
        IndexName: 'getListGiaoDichOfMemberByDate',
    }
    let scanObject = {};
    params.KeyConditionExpression = "maHV=:hv and begins_with(ngayGiaoDich,:n)"
    params.ExpressionAttributeValues = {
        ':hv': String(maHV),
        ':n': (req.query.search)
    }
    docClient.query(params, (err, data) => {
        if (err) {
            scanObject.err = err;
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            scanObject.data = data;
            let body = ejs.render(fs.readFileSync('./views/ChucNangLichSu.ejs', 'utf-8'), { object: scanObject }, { vars: ['object'] });
            templet_function.homepage(req, res, body, name, icon);
        }
    })
}
function getListItemsTrue(req,res){
    let name = "LỊCH SỬ THANH TOÁN";
    let icon = "far fa-eye";
    let params = {
        TableName:'LichSuGiaoDich',
        IndexName:'getListGiaoDichOfDoanhNgiep'
    }
    let scanObject = {};
    params.KeyConditionExpression = "maDN=:ma"
    params.ExpressionAttributeValues = {
        ":ma":Number(req.user.maDN)
    }
    docClient.query(params,(err,data)=>{
        if(err){
            scanObject.err = err;
            console.log(JSON.stringify(err, null, 2));
        }
        else
        {
            scanObject.data = data;
            let body = ejs.render(fs.readFileSync('./views/lichsuthanhtoan.ejs','utf-8'),{object:scanObject},{vars:['object']});
            templet_function.homepage(req,res,body,name,icon);
        }
    })
}
module.exports = {
    luuLichSu: luuLichSu,
    queryHoaDon: queryHoaDon,
    getALLItem: getALLItem,
    luuLichSuNapTien: luuLichSuNapTien,
    getListItemsInMonth: getListItemsInMonth,
    getListItemsTrue:getListItemsTrue
}
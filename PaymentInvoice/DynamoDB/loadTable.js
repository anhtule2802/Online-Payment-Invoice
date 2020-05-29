const aws = require('aws-sdk');
const fs = require('fs');

require('../configure/dynamodb');       // kết nối database

const docClient = new aws.DynamoDB.DocumentClient();

// load Khách hàng
const allHoaDons = JSON.parse(fs.readFileSync('./data/HoaDon.json', 'utf-8'));
allHoaDons.forEach(item => {
    let params = {
        TableName: 'HoaDon'
    };
    /**
     * loaiHD: 1 -> Hóa đơn tiền điện
     * loaiHD: 2 -> Hóa đơn tiền nước
     * loaiHD: 3 -> Hóa đơn tiền internet
     */
    if (item.loaiHD == 1 || item.loaiHD == 2) {
        params.Item = {
            "maHD": String(item.maHD),
            "loaiHD": Number(item.loaiHD),
            "hoadonThang": String(item.hoadonThang),
            "hanthanhtoan": String(item.hanthanhtoan),
            "trangthai": Boolean(item.trangthai),
            "thue": Number(item.thue),
            "chisocu": Number(item.chisocu),
            "chisomoi": Number(item.chisomoi),
            "giatien": Number(item.giatien),
            "maDN": Number(item.maDN),
            "maKH": String(item.maKH),
            "doanhnghiep": {
                "tenDN": String(item.doanhnghiep.tenDN),
                "loaiDN": Number(item.doanhnghiep.loaiDN),
                "sodt": String(item.doanhnghiep.sodt),
                "diachiDN": (item.doanhnghiep.diachiDN),
                "url": (item.doanhnghiep.url)
            },
            "khachhang": {
                "tenKH": String(item.khachhang.tenKH),
                "sodt": String(item.khachhang.sodt),
                "diachi": String(item.khachhang.diachi)
            }
        }
    }
    else if (item.loaiHD == 3) {
        params.Item = {
            "maHD": String(item.maHD),
            "loaiHD": Number(item.loaiHD),
            "hoadonThang": String(item.hoadonThang),
            "hanthanhtoan": String(item.hanthanhtoan),
            "trangthai": Boolean(item.trangthai),
            "thue": Number(item.thue),
            "tengoicuoc": String(item.tengoicuoc),
            "giatien": Number(item.giatien),
            "maDN": Number(item.maDN),
            "maKH": String(item.maKH),
            "doanhnghiep": {
                "tenDN": String(item.doanhnghiep.tenDN),
                "loaiDN": Number(item.doanhnghiep.loaiDN),
                "sodt": String(item.doanhnghiep.sodt),
                "diachiDN": (item.doanhnghiep.diachiDN),
                "url": (item.doanhnghiep.url)
            },
            "khachhang": {
                "tenKH": String(item.khachhang.tenKH),
                "sodt": String(item.khachhang.sodt),
                "diachi": String(item.khachhang.diachi)
            }
        }
    }
    docClient.put(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else
            console.log(`Them KH thành công ${JSON.stringify(data, null, 2)}`);
    });
});

//******************************************************************************************* */

// load lịch nhắc
const allLichNhacs = JSON.parse(fs.readFileSync('./data/LichNhac.json', 'utf-8'));
allLichNhacs.forEach(item => {
    let params = {
        TableName: 'LichNhac'
    };
    params.Item = {
        "maLich": String(item.maLich),
        "ngayhen": String(item.ngayhen),
        "giohen": Number(item.giohen),
        "email": String(item.email),
        "taikhoan": {
            "matKhau": String(item.taikhoan.matKhau),
            "loaiTK": Number(item.taikhoan.loaiTK),
            "sodu": Number(item.taikhoan.sodu),
            "maHV": String(item.taikhoan.maHV),
            "hoivien": {
                "tenHV": String(item.taikhoan.hoivien.tenHV),
                "sodt": String(item.taikhoan.hoivien.sodt),
                "diachi": String(item.taikhoan.hoivien.diachi)
            }
        },
        "maDN": Number(item.maDN),
        "loaiHD": Number(item.loaiHD),
        "ghichu": String(item.ghichu)
    };
    docClient.put(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else
            console.log(`Them LN thành công ${JSON.stringify(data, null, 2)}`);
    });
});

//******************************************************************************************* */

// load lịch sử giao dịch
const allLSGD = JSON.parse(fs.readFileSync('./data/LichSuGiaoDich.json', 'utf-8'));
allLSGD.forEach(item => {
    let params = {
        TableName: 'LichSuGiaoDich'
    };

    /**
     * loaiGiaoDich: 0 -> Thanh toán
     * loaiGiaoDich: 1 -> Nạp tiền
     */
    if (item.loaiGiaoDich == 0) {
        if (item.hoadon.loaiHD == 1 || item.hoadon.loaiHD == 2) {
            params.Item = {
                "maGiaoDich": String(item.maGiaoDich),
                "ngayGiaoDich": item.ngayGiaoDich,
                "thoigianGD": item.thoigianGD,
                "loaiGiaoDich": Number(item.loaiGiaoDich),
                "phiGiaoDich": Number(item.phiGiaoDich),
                "soTien": Number(item.soTien),
                "maDN": Number(item.maDN),
                "hoadon": {
                    "maHD": String(item.hoadon.maHD),
                    "loaiHD": Number(item.hoadon.loaiHD),
                    "thue": Number(item.hoadon.thue),
                    "chisocu": Number(item.hoadon.chisocu),
                    "chisomoi": Number(item.hoadon.chisomoi),
                    "giatien": Number(item.hoadon.giatien),
                    "doanhnghiep": {
                        "tenDN": String(item.hoadon.doanhnghiep.tenDN),
                        "loaiDN": Number(item.hoadon.doanhnghiep.loaiDN),
                        "sodt": String(item.hoadon.doanhnghiep.sodt),
                        "diachiDN": String(item.hoadon.doanhnghiep.diachiDN),
                        "url": String(item.hoadon.doanhnghiep.url)
                    },
                    "khachhang": {
                        "maKH": String(item.hoadon.khachhang.maKH),
                        "tenKH": String(item.hoadon.khachhang.tenKH),
                        "sodt": String(item.hoadon.khachhang.sodt),
                        "diachi": String(item.hoadon.khachhang.diachi)
                    }
                },
                "maHV": String(item.maHV),
                "hoivien": {
                    "tenHV": String(item.hoivien.tenHV),
                    "sodt": String(item.hoivien.sodt),
                    "diachi": String(item.hoivien.diachi)
                }
            }
        }
        else if (item.hoadon.loaiHD == 3) {
            params.Item = {
                "maGiaoDich": String(item.maGiaoDich),
                "ngayGiaoDich": item.ngayGiaoDich,
                "thoigianGD": item.thoigianGD,
                "loaiGiaoDich": Number(item.loaiGiaoDich),
                "phiGiaoDich": Number(item.phiGiaoDich),
                "soTien": Number(item.soTien),
                "maDN": Number(item.maDN),
                "hoadon": {
                    "maHD": String(item.hoadon.maHD),
                    "loaiHD": Number(item.hoadon.loaiHD),
                    "thue": Number(item.hoadon.thue),
                    "tengoicuoc": String(item.hoadon.tengoicuoc),
                    "giatien": Number(item.hoadon.giatien),
                    "doanhnghiep": {
                        "tenDN": String(item.hoadon.doanhnghiep.tenDN),
                        "loaiDN": Number(item.hoadon.doanhnghiep.loaiDN),
                        "sodt": String(item.hoadon.doanhnghiep.sodt),
                        "diachiDN": String(item.hoadon.doanhnghiep.diachiDN),
                        "url": String(item.hoadon.doanhnghiep.url)
                    },
                    "khachhang": {
                        "maKH": String(item.hoadon.khachhang.maKH),
                        "tenKH": String(item.hoadon.khachhang.tenKH),
                        "sodt": String(item.hoadon.khachhang.sodt),
                        "diachi": String(item.hoadon.khachhang.diachi)
                    }
                },
                "maHV": String(item.maHV),
                "hoivien": {
                    "tenHV": String(item.hoivien.tenHV),
                    "sodt": String(item.hoivien.sodt),
                    "diachi": String(item.hoivien.diachi)
                }
            }
        }
    }
    else if (item.loaiGiaoDich == 1) {
        params.Item = {
            "maGiaoDich": String(item.maGiaoDich),
            "ngayGiaoDich": item.ngayGiaoDich,
            "thoigianGD": item.thoigianGD,
            "loaiGiaoDich": Number(item.loaiGiaoDich),
            "phuongthucnap": String(item.phuongthucnap),
            "tiennap": Number(item.tiennap),
            "maHV": String(item.maHV),
            "hoivien": {
                "tenHV": String(item.hoivien.tenHV),
                "sodt": String(item.hoivien.sodt),
                "diachi": String(item.hoivien.diachi)
            }
        }
    };
    docClient.put(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else
            console.log(`Them LSGD thành công ${JSON.stringify(data, null, 2)}`);
    });
});

//******************************************************************************************* */

// load tài khoản
const allTaiKhoans = JSON.parse(fs.readFileSync('./data/TaiKhoan.json', 'utf-8'));
allTaiKhoans.forEach(item => {
    let params = {
        TableName: 'TaiKhoan'
    };
    /**
     * loaiTK == 1 là hội viên
     * loaiTK == 2 là doanh nghiệp
    */
    if (item.loaiTK == 1) {
        params.Item = {
            "email": String(item.email),
            "matKhau": String(item.matKhau),
            "loaiTK": Number(item.loaiTK),
            "sodu": Number(item.sodu),
            "maHV": String(item.maHV),
            "hoivien": {
                "tenHV": String(item.hoivien.tenHV),
                "sodt": String(item.hoivien.sodt),
                "diachi": String(item.hoivien.diachi)
            }
        }
    }
    else if (item.loaiTK == 2) {
        params.Item = {
            "email": String(item.email),
            "matKhau": String(item.matKhau),
            "loaiTK": Number(item.loaiTK),
            "sodu": Number(item.sodu),
            "maDN": Number(item.maDN),
            "doanhnghiep": {
                "tenDN": String(item.doanhnghiep.tenDN),
                "loaiDN": Number(item.doanhnghiep.loaiDN),
                "sodt": String(item.doanhnghiep.sodt),
                "diachiDN": String(item.doanhnghiep.diachiDN),
                "url": String(item.doanhnghiep.url),
                "dsKhachHang": item.doanhnghiep.dsKhachHang
            }
        }
    }else if(item.loaiTK == 3){
        params.Item = {
            "email": String(item.email),
            "matKhau": String(item.matKhau),
            "loaiTK": Number(item.loaiTK),
        }
    };

    docClient.put(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else
            console.log(`Them TK thành công ${JSON.stringify(data, null, 2)}`);
    });
});

//******************************************************************************************* */


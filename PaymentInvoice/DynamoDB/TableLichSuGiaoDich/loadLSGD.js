const aws = require('aws-sdk');
const fs = require('fs');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

const allLSGD = JSON.parse(fs.readFileSync('../data/LichSuGiaoDich.json', 'utf-8'));

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
            console.log(`Them item thành công ${JSON.stringify(data, null, 2)}`);
    });
});
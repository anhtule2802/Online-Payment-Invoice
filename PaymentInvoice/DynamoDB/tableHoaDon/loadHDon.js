const aws = require('aws-sdk');
const fs = require('fs');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

const allHoaDons = JSON.parse(fs.readFileSync('../data/HoaDon.json', 'utf-8'));
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
            console.log(`Them item thành công ${JSON.stringify(data, null, 2)}`);
    });
});
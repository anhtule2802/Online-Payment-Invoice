const aws = require('aws-sdk');
const fs = require('fs');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

const allItems = JSON.parse(fs.readFileSync('../data/LichNhac.json', 'utf-8'));

allItems.forEach(item => {
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
            console.log(`Them item thành công ${JSON.stringify(data, null, 2)}`);
    });
});

const aws = require('aws-sdk');
const fs = require('fs');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

const allTaiKhoans = JSON.parse(fs.readFileSync('../data/TaiKhoan.json', 'utf-8'));

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
            console.log(`Them item thành công ${JSON.stringify(data, null, 2)}`);
    });
});
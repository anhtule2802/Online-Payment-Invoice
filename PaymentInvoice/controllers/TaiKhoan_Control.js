const aws = require('aws-sdk');
const ejs = require('ejs-html');
const fs = require('fs');
const uuid4 = require('uuid/v4');

require('../configure/dynamodb');       // kết nối database
const templet_function = require('./templet_fuction');
const docClient = new aws.DynamoDB.DocumentClient();

function kiemtraTaiKhoanLogin(req, username, password, done) {
    let params = {
        TableName: "TaiKhoan"
    };

    params.KeyConditionExpression = '#em = :email and #mk = :matKhau';        // sử dụng này thì dùng query
    params.ExpressionAttributeNames = {
        // '#ma': "maHV",
        // '#ten': "tenHV",
        '#em': 'email',
        '#mk': 'matKhau'
    };
    params.ExpressionAttributeValues = {
        ':email': String(username),
        ':matKhau': String(password)
    };

    let user = {};
    docClient.query(params, (err, data) => {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else {
            user = data.Items;
            if (user[0])
                return done(null, user[0]);
            else{
                return done(null, false, req.flash('loginMessage', 'Tên đăng nhập hoặc mật khẩu không đúng'));
            }
        }
    });
};

// kiểm tra email này có đăng ký chưa
function kiemtraEmail(req, res, loaiTK) {
    let params = {
        TableName: "TaiKhoan",
        IndexName: "kiemtraEmail"
    };

    params.KeyConditionExpression = '#em = :email';
    params.ProjectionExpression = '#em';
    params.ExpressionAttributeNames = {
        '#em': 'email'
    };
    params.ExpressionAttributeValues = {
        ':email': String(req.body.email)
    };

    let result = {};
    docClient.query(params, (err, data) => {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else {
            result = data.Items;

            if (result[0]) {
                if (loaiTK == 1) {
                    // Nếu có email, thông báo đưa về trang chủ
                    req.flash('alert', 'Email này đã có người sử dụng');
                    res.redirect('/');
                }
                else {
                    let body = ejs.render(fs.readFileSync('./AreaAdmin/dkdn.ejs', 'utf-8'), { resultUpload: 'hasEmail', item: req.body }, { vars: ['resultUpload', 'item'] });
                    res.render('../AreaAdmin/trangchu.ejs', { body });
                }
            }
            else
                themTaiKhoanDangKy(req, res, loaiTK);
        }
    });
}

function themTaiKhoanDangKy(req, res, loaiTK) {
    let params = {
        TableName: "TaiKhoan"
    };

    if (loaiTK == 1) {
        const { email, matKhau, tenHV, sodt, diachi } = req.body;

        params.Item = {
            "email": String(email),
            "matKhau": String(matKhau),
            "loaiTK": Number(loaiTK),
            "sodu": Number(0),
            "maHV": uuid4(),          // edit mã hội viên khi thêm
            "hoivien": {
                "tenHV": String(tenHV),
                "sodt": String(sodt),
                "diachi": String(diachi)
            }
        };
        docClient.put(params, (err, data) => {
            if (err)
                console.log(`${JSON.stringify(err, null, 2)}`);
            else {
                // Nếu có email, thông báo đưa về trang chủ
                req.flash('alert', 'Đăng ký thành công');
                res.redirect('/');

            }
        });
    }
    else if (loaiTK == 2) {
        const { email, matKhau, tenDN, loaiDN, sodt, diachiDN } = req.body
        const image = 'images/' + req.file.originalname;
        countDoanhNghiep((callback) => {
            let count = callback;
            params.Item = {
                "email": email,
                "matKhau": matKhau,
                "loaiTK": Number(loaiTK),
                "sodu": Number(0),
                "maDN": Number(count) + 1,              // cập nhật mã doanh nghiệp
                "doanhnghiep": {
                    "tenDN": String(tenDN),
                    "loaiDN": Number(loaiDN),
                    "sodt": String(sodt),
                    "diachiDN": String(diachiDN),
                    "url": String(image)
                }
            };
            docClient.put(params, (err, data) => {
                if (err)
                    console.log(`${JSON.stringify(err, null, 2)}`);
                else {
                    let body = ejs.render(fs.readFileSync('./AreaAdmin/dkdn.ejs', 'utf-8'), { resultUpload: 'succeed' }, { vars: ['resultUpload'] });
                    res.render('../AreaAdmin/trangchu.ejs', { body });
                }
            });
        });
    }
};

function thanhtoanHDTK(sodu,req) {
    let email = req.user.email;
    let mk = req.user.matKhau;
    let params = {
        TableName:'TaiKhoan',
        Key:{
            "email":String(email),
            "matKhau":String(mk),
        },
        UpdateExpression:"set #t = :sodu",
        ExpressionAttributeNames:{
            '#t': 'sodu',
        },
        ExpressionAttributeValues:{
            ':sodu': Number(sodu)
        },
        ReturnValues:"UPDATED_NEW"
    };
    docClient.update(params,(err,data)=>{
        if(err){
            console.log(JSON.stringify(err,null,2));
        }
        else{
            console.log('Thành Công TK');
        }
    })
};
function updateTKDN(req) {
    let params = {
        TableName:"TaiKhoan",
        IndexName:'getDN',
    };
    let queryDN = {};
    params.KeyConditionExpression = 'maDN = :dn';
    params.ExpressionAttributeValues = {
        ':dn':Number(req.query.maDN)
    }
    docClient.query(params,(err,data)=>{
        if (err) {
            console.log(JSON.stringify(err,null,2));
        }
        else {           
            queryDN = data.Items;
            let sodu = parseInt(req.query.total) + parseInt(queryDN[0].sodu);
            let params = {
                TableName:'TaiKhoan',
                Key: {
                    "email":String(queryDN[0].email),
                    "matKhau":String(queryDN[0].matKhau),
                },
                UpdateExpression:"set #t = :sodu",
                ExpressionAttributeNames: {
                    '#t': 'sodu',
                },
                ExpressionAttributeValues: {
                    ':sodu': Number(sodu)
                },
                ReturnValues:"UPDATED_NEW"
            };
            docClient.update(params,(err,data)=>{
                if(err){
                    console.log(JSON.stringify(err,null,2));
                }
                else{
                    console.log('Thành Công TK');
                }
            });
        }
    });
};
function getDoanhNghiepByLoai(loaiHD, res, req,name,icon) {
    let params = {
        TableName:'TaiKhoan',
        IndexName: 'getListUser'
    };
    params.KeyConditionExpression = '#loaiTK = :loaiTK';
    params.FilterExpression = '#dn.loaiDN = :loaiDN'
    params.ExpressionAttributeNames = {
        '#loaiTK': "loaiTK",
        '#dn': "doanhnghiep"
    };
    params.ExpressionAttributeValues = {
        ':loaiTK': Number(2),
        ':loaiDN': Number(loaiHD)
    };

    docClient.query(params, (err, data) => {
        if (err)
            console.log(`${JSON.stringify(err, null, 2)}`);
        else {
            let myurl = req.url.split("?");
            const body = ejs.render(fs.readFileSync('./views/dscongty.ejs','utf-8'),{loai: loaiHD, url:myurl[0], items: data.Items},{vars:['loai','url', 'items']}); 
            templet_function.homepage(req,res,body,name,icon)       
        }
    });
};

// --------------------------------------- phần DOANH NGHIỆP --------------------------------------- //
const configUpload = require('../configure/uploadFile');
const xlsx = require('xlsx');
// New cập nhật danh sách khách hàng
function appendListKhachHang(req, res, items, name, icon) {
    let email = req.user.email;
    let matKhau = req.user.matKhau;

    let params = {
        TableName: "TaiKhoan",
        Key: {
            "email": String(email),
            "matKhau": String(matKhau)
        },
        UpdateExpression: 'set #dn.#dsKhachHang = list_append(if_not_exists(#dn.#dsKhachHang, :empty_list), :items)',
        ExpressionAttributeNames: {
            '#dn': 'doanhnghiep',
            '#dsKhachHang': 'dsKhachHang'
        },
        ExpressionAttributeValues: {
            ':items': items,
            ':empty_list': []
        },
        ReturnValues: "UPDATED_NEW"
    };
    return docClient.update(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else {
            console.log(`Thêm items thành công ${JSON.stringify(data, null, 2)}`);

            // lưu xong xóa file execl này đi
            // try {
            //     fs.unlinkSync(req.file.path);
            // } catch (err) {
            //     console.error(err)
            // }

            let body = ejs.render(fs.readFileSync('./views/form_capnhatkh.ejs', 'utf-8'), { resultUpload: true }, { vars: ['resultUpload'] });
            templet_function.homepage(req, res, body, name, icon);
        }
    });
};
function uploadFileOfDoanhNghiep(req, res, name, icon, loaiFile) {
    configUpload.uploadFile(req, res, (err) => {
        if (err) {
            console.log(`Error upload: ${JSON.stringify(err, null, 2)}`);
            let body;
            if (loaiFile == 1)
                body = ejs.render(fs.readFileSync('./views/form_capnhatkh.ejs', 'utf-8'), { resultUpload: false }, { vars: ['resultUpload'] });
            else
                body = ejs.render(fs.readFileSync('./views/form_capnhathd.ejs', 'utf-8'), { resultUpload: false }, { vars: ['resultUpload'] });

            templet_function.homepage(req, res, body, name, icon);
        }
        else {
            let wb = xlsx.readFile(req.file.path);
            let sheetName = wb.SheetNames[0];           // lấy Sheet đầu tiên của execl
            let ws = wb.Sheets[sheetName];
            let data = xlsx.utils.sheet_to_json(ws);

            if (loaiFile == 1)
                appendListKhachHang(req, res, data, name, icon);
            else {
                let maDN = req.user.maDN;

                console.log("Loại doanh nghiệp: " + maDN);
                console.log("---------------------------------------------------------");
                                
                data.forEach(item => themhoadon(item, maDN));
                let body = ejs.render(fs.readFileSync('./views/form_capnhathd.ejs', 'utf-8'), { resultUpload: true }, { vars: ['resultUpload'] });
                templet_function.homepage(req, res, body, name, icon);
            }
        }
    })
};
function themhoadon(item, maDN) {
    let params = {
        TableName: 'HoaDon'
    };
    /**
     * loaiHD: 1 -> Hóa đơn tiền điện       <- loaiDN: 1
     * loaiHD: 2 -> Hóa đơn tiền nước       <- loaiDN: 2
     * loaiHD: 3 -> Hóa đơn tiền internet   <- loaiDN: 3
     */
    if (item.maDN == maDN) {
        if ((item.loaiHD == 1 || item.loaiHD == 2)) {
            params.Item = {
                "maHD": uuid4(),
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
                    "tenDN": String(item.tenDN),
                    "loaiDN": Number(item.loaiDN),
                    "sodt": String(item.sodt),
                    "diachiDN": (item.diachiDN),
                    "url": (item.url)
                },
                "khachhang": {
                    "tenKH": String(item.tenKH),
                    "sodt": String(item.sodt),
                    "diachi": String(item.diachi)
                }
            }
        }
        else if (item.loaiHD == 3) {
            params.Item = {
                "maHD": uuid4(),
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
                    "tenDN": String(item.tenDN),
                    "loaiDN": Number(item.loaiDN),
                    "sodt": String(item.sodt),
                    "diachiDN": (item.diachiDN),
                    "url": (item.url)
                },
                "khachhang": {
                    "tenKH": String(item.tenKH),
                    "sodt": String(item.sodt_1),
                    "diachi": String(item.diachi)
                }
            }
        }
    }
    docClient.put(params, (err, data) => {
        if (err)
            console.error(`không thể put data ${JSON.stringify(err, null, 2)}`);
        else {
            console.log(`Thêm items thành công ${JSON.stringify(params, null, 2)}`);
            console.log("-------------------------------------------------------------");

            // lưu xong xóa file execl này đi
            // try {
            //     fs.unlinkSync(req.file.path);
            // } catch (err) {
            //     console.error(err)
            // }
        }
    });
}

// --------------------------------------- phần ADMIN --------------------------------------- //
function uploadFileImage(req, res) {
    configUpload.uploadImage(req, res, (err) => {
        if (err) {
            console.log(`Error upload: ${JSON.stringify(err, null, 2)}`);
            let body = ejs.render(fs.readFileSync('./AreaAdmin/dkdn.ejs', 'utf-8'), { resultUpload: 'error', item: req.body }, { vars: ['resultUpload', 'item'] });
            res.render('../AreaAdmin/trangchu.ejs', { body });
        }
        else
            kiemtraEmail(req, res, 2);
    });
}
function countDoanhNghiep(callback) {
    let params = {
        TableName: 'TaiKhoan',
        IndexName: 'getListUser'
    };
    params.KeyConditionExpression = '#loaiTK = :loaiTK';
    params.ExpressionAttributeNames = {
        '#loaiTK': "loaiTK"
    };
    params.ExpressionAttributeValues = {
        ':loaiTK': Number(2)
    };
    docClient.query(params, (err, data) => {
        if (err)
            console.log(`${JSON.stringify(err, null, 2)}`);
        else
            callback(data.Items.length);
    });
}

module.exports = {
    kiemtraTaiKhoanLogin: kiemtraTaiKhoanLogin,
    kiemtraEmail: kiemtraEmail,
    thanhtoanHDTK: thanhtoanHDTK,
    getDoanhNghiepByLoai: getDoanhNghiepByLoai,
    updateTKDN:updateTKDN,
    uploadFileOfDoanhNghiep: uploadFileOfDoanhNghiep,
    uploadFileImage: uploadFileImage
}
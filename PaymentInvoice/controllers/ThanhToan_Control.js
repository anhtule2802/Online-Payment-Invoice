const aws = require('aws-sdk');
const ejs = require('ejs-html');
const fs = require('fs');
const moment = require('moment');
require('../configure/dynamodb'); 
const templet_function = require('./templet_fuction');
const docClient = new aws.DynamoDB.DocumentClient();

function queryHoaDon(req,res,name,icon)
{
    var loaiHD = req.query.loaiHD;
    var maDN = req.query.maDN;
    var maKH = req.query.makh;
    let hdThang = moment().format("YYYY-MM");
    let params = {
        TableName: 'HoaDon',
        IndexName: 'getHoaDonKH',
    };
    let queryHD = {};
    if(maDN)
    {
       if(maKH)
       {
           params.KeyConditionExpression = 'maDN =:dn and maKH =:kh';
           params.FilterExpression = 'loaiHD = :loaiHD and hoadonThang = :hdThang';
           params.ExpressionAttributeValues ={
               ':dn': Number(maDN),
               ':kh': String(maKH),
               ':loaiHD': Number(loaiHD),
               ':hdThang': String(hdThang)
           }
           
           docClient.query(params,(err,data)=>{
               if(err)
               {
                   queryHD.err = err;
                   console.log(JSON.stringify(err,null,2));
               }
               else{
                   queryHD = data.Items;
                   console.log(data.Items.trangthai);
                   if(queryHD[0])
                   {
                       if(queryHD[0].trangthai == false)
                       {
                            var total;
                            if(loaiHD == 3)
                            {
                                total = queryHD[0].giatien + queryHD[0].giatien*queryHD[0].thue;
                            }
                            else
                            {
                                total = (queryHD[0].chisomoi - queryHD[0].chisocu) * queryHD[0].giatien + ((queryHD[0].chisomoi - queryHD[0].chisocu) * queryHD[0].giatien)*queryHD[0].thue;
                            }
                            var sodu = req.user.sodu - total;
                            if(sodu >= 0 )
                            {
                                const body = ejs.render(fs.readFileSync('./views/form_xacnhanthanhtoan.ejs','utf-8'),{queryHD:queryHD[0],total,error:""},{vars:['queryHD','total','error']});
                                templet_function.homepage(req,res,body,name,icon);
                            }
                            else
                            {   
                                req.flash('alert','Số dư tài khoản không đủ để thanh toán hóa đơn này.');
                                const body = ejs.render(fs.readFileSync('./views/form_xacnhanthanhtoan.ejs','utf-8'),{queryHD:queryHD[0],total,error:"Số dư tài khoản không đủ để thanh toán hóa đơn này !"},{vars:['queryHD','total','error']});
                                templet_function.homepage(req,res,body,name,icon);
                            }
                       }
                       else{
                            req.flash('alert', 'Hóa đơn này chưa tới hạn thanh toán.');
                            const body = ejs.render(fs.readFileSync('./views/form_thanhtoan.ejs', 'utf-8'), { loai: loaiHD, nameCty:maDN}, { vars: ['loai', 'nameCty'] });
                            templet_function.homepage(req, res, body, name, icon);
                       }
                   }
                   else{
                        req.flash('alert', "Mã khách hàng không thuộc doanh nghiệp này.");
                        const body = ejs.render(fs.readFileSync('./views/form_thanhtoan.ejs', 'utf-8'), { loai: loaiHD, nameCty:maDN}, { vars: ['loai', 'nameCty'] });
                        templet_function.homepage(req, res, body, name, icon);
                   }
               }
           }) 
       }
    }
}

function updateTTHD(req)
{
    let maHD = req.query.maHD;
    let loaiHD = req.query.loaiHD;
    let trangthai=true;
    let params ={
        TableName:'HoaDon',
        Key:{
            "maHD":String(maHD),
            "loaiHD":Number(loaiHD),
        },
        UpdateExpression:"set #t = :trangthai",
        ExpressionAttributeNames:{
            '#t': 'trangthai',
        },
        ExpressionAttributeValues:{
            ':trangthai': Boolean(trangthai)
        },
        ReturnValues:"UPDATED_NEW"
    };
    docClient.update(params,(err,data)=>{
        if(err){
            console.log(JSON.stringify(err,null,2));
        }
        else{
            console.log('Thành Công TT');
        }
    })
}
module.exports = {
    queryHoaDon: queryHoaDon,
    updateTTHD:updateTTHD,
}
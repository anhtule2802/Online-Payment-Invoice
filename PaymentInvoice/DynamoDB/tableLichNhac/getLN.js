const aws = require('aws-sdk');
const moment = require('moment');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

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
 //       IndexName: "getListLichNhac"
    };

    // params.KeyConditionExpression = '#ngayhen = :ngayhen and #giohen = :giohen';     // sử dụng này thì dùng query

    // params.ExpressionAttributeNames = {
    //     '#ngayhen': "ngayhen",
    //     '#giohen': "giohen"
    // };
    // params.ExpressionAttributeValues = {
    //     ':ngayhen': String(nowdate),
    //     ':giohen': Number(nowMinute)
    // };

    let dslich = {};
    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(moment().format('LTS'));
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            console.log(data.Items);
            dslich = data.Items;
            console.log(nowMinute);

            console.log("-------------------------------------------------------------------");

            // gửi hóa đơn đến email khách hàng theo ds đặt lịch
            


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

// setInterval(getLichNhac, 60000);


test();
function test() {
    let ngayhen = "2019-10-20";
    let hdThang = moment(ngayhen).format("YYYY-MM");
    let params = {
        TableName: 'HoaDon',
        IndexName: 'getHoaDonKH',
    };
    params.KeyConditionExpression = 'maDN =:dn and maKH =:kh';
    params.FilterExpression = 'loaiHD = :loaiHD and hoadonThang = :hdThang'
    params.ExpressionAttributeValues = {
        ':dn': Number(2),
        ':kh': String("4000002"),
        ':loaiHD': Number(1),
        ':hdThang': String(hdThang)
    }
    docClient.query(params, (err, data) => {
        if (err) {
            console.log(moment().format('LTS'));
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            console.log(data.Items);
            dslich = data.Items;

            console.log("-------------------------------------------------------------------");
        }
    });
}

const u = require('uuid');
const u1 = require('uuid/v1');
const u4 = require('uuid/v4');
const u5 = require('uuid/v5');

console.log(u());
console.log(u());
console.log(u());
console.log(u4());
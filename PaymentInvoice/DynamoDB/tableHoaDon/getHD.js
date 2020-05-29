const aws = require('aws-sdk');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

function getHoaDonKH() {
    let params = {
        TableName: "HoaDon",
 //       IndexName: "getHoaDonKH"
    };

    // params.KeyConditionExpression = '#maDN = :maDN and #maKH = :maKH';        // sử dụng này thì dùng query

    // params.FilterExpression = '#hdThang = :hdThang and #loaiHD = :loaiHD and #trangthai = :tt';
    params.FilterExpression = 'maDN = :maDN';
    // params.ExpressionAttributeNames = {
    //     '#maDN': "maDN",
    //     '#maKH': 'maKH',
    //     '#hdThang': "hoadonThang",
    //     '#loaiHD': 'loaiHD',
    //     '#trangthai': 'trangthai'
    // };
    params.ExpressionAttributeValues = {
        ':maDN': Number(8),
    //     ':maKH': String("4000003"),
    //     ':hdThang': String("2019-10"),
    //     ':loaiHD': Number(3),
    //     ':tt': Boolean(false)
    };
    // let hoadon = {};

    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            hoadon = data.Items;
            console.log("--------------------------------------------------------------");
            console.log(JSON.stringify(hoadon, null, 2));
            console.log("--------------------------------------------------------------");
        }
    });
};

getHoaDonKH();
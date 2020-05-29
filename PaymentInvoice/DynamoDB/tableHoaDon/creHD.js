const aws = require('aws-sdk');

require('../../configure/dynamodb');       // kết nối database

var dynamodb = new aws.DynamoDB();

// Tạo bảng hóa đơn
var paramsHoaDon = {
    TableName: "HoaDon",
    KeySchema: [
        { AttributeName: "maHD", KeyType: "HASH" },
        { AttributeName: "loaiHD", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
        { AttributeName: "maHD", AttributeType: "S" },
        { AttributeName: "loaiHD", AttributeType: "N" },

        // khai báo khóa doanh nghiệp
        { AttributeName: 'maDN', AttributeType: "N"},

        // khai báo khóa khách hàng
        { AttributeName: 'maKH', AttributeType: "S"}
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'getHoaDonKH',
            KeySchema: [
                { AttributeName: 'maDN', KeyType: "HASH" },
                { AttributeName: 'maKH', KeyType: "RANGE"}
                /**
                 * nữa truy vấn chèn thêm
                 * params.FilterExpression = '#hdThang = :hdThang and #trangthai = :tt'
                */
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
dynamodb.createTable(paramsHoaDon, (err, data) => {
    if (err)
        console.error("Unable to create table. Error JSON", JSON.stringify(err, null, 2));
    else
        console.log("Create table. Table description JSON", JSON.stringify(data, null, 2));
});
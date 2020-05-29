const aws = require('aws-sdk');

require('../../configure/dynamodb');       // kết nối database

var dynamodb = new aws.DynamoDB();

// Tạo bảng tài khoản
var paramsTaiKhoan = {
    TableName: "TaiKhoan",
    KeySchema: [
        { AttributeName: "email", KeyType: "HASH" },
        { AttributeName: 'matKhau', KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "matKhau", AttributeType: "S" },

        // khai báo khóa doanh nghiệp
        { AttributeName: 'maDN', AttributeType: "N" },

        // khai báo khóa hội viên
        //       { AttributeName: 'maHV', AttributeType: "S"},
        { AttributeName: 'loaiTK', AttributeType: "N" }

        // khai báo khóa lịch sử giao dịch
        //        { AttributeName: 'maGiaoDich', AttributeType: "S"},
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: "getListUser",
            KeySchema: [
                { AttributeName: "loaiTK", KeyType: "HASH" }

                /**
                 * nữa truy vấn chèn thêm
                 * params.FilterExpression = '#dn.loaiDN = :loaiDN'
                 * để truy vấn ra doanh nghiệp đó thuộc hóa đơn điện, nước hay internet
                */
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 3,
                WriteCapacityUnits: 3,
            }
        },
        {
            IndexName: "getDN",
            KeySchema: [
                { AttributeName: "maDN", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 3,
                WriteCapacityUnits: 3,
            }
        },
        {
            IndexName: "kiemtraEmail",
            KeySchema: [
                { AttributeName: "email", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 3,
                WriteCapacityUnits: 3,
            }
        },
        {
            IndexName: "getListCustomerOfBusiness",
            KeySchema: [
                { AttributeName: "maDN", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: 'ALL'
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

dynamodb.createTable(paramsTaiKhoan, (err, data) => {
    if (err)
        console.error("Unable to create table. Error JSON", JSON.stringify(err, null, 2));
    else
        console.log("Create table. Table description JSON", JSON.stringify(data, null, 2));
});
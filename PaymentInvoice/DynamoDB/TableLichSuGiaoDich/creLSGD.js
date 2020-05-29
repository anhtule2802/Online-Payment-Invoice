const aws = require('aws-sdk');

require('../../configure/dynamodb');       // kết nối database

var dynamodb = new aws.DynamoDB();

// Tao bang lich su giao
var paramsGiaoDich = {
    TableName: "LichSuGiaoDich",
    KeySchema: [
        { AttributeName: "maGiaoDich", KeyType: "HASH" },
        { AttributeName: "ngayGiaoDich", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
        { AttributeName: "maGiaoDich", AttributeType: "S" },
        { AttributeName: "ngayGiaoDich", AttributeType: "S" },

        // khai báo khóa doanh nghiệp
        { AttributeName: 'maDN', AttributeType: "N"},

        // khai báo khóa hoi vien
        { AttributeName: 'maHV', AttributeType: "S"}
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'getListGiaoDichOfMember',
            KeySchema: [
                { AttributeName: 'maHV', KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            }
        },
        {
            IndexName: 'getListGiaoDichOfMemberByDate',
            KeySchema: [
                { AttributeName: 'maHV', KeyType: "HASH" },
                { AttributeName: "ngayGiaoDich", KeyType: "RANGE" }
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            }
        },
        {
            IndexName: 'getListGiaoDichOfDoanhNgiep',
            KeySchema: [
                { AttributeName: 'maDN', KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            }
        },
        {
            IndexName: 'getListGiaoDichOfDoanhNghiepByDate',
            KeySchema: [
                { AttributeName: 'maDN', KeyType: "HASH" },
                { AttributeName: "ngayGiaoDich", KeyType: "RANGE" }
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
dynamodb.createTable(paramsGiaoDich, (err, data) => {
    if (err)
        console.error("Unable to create table. Error JSON", JSON.stringify(err, null, 2));
    else
        console.log("Create table. Table description JSON", JSON.stringify(data, null, 2));
});
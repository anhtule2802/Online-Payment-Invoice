const aws = require('aws-sdk');

require('../../configure/dynamodb');       // kết nối database

var dynamodb = new aws.DynamoDB();

// Tạo bảng lịch nhắc
var paramsLichNhac = {
    TableName: "LichNhac",
    KeySchema: [
        { AttributeName: "maLich", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
        { AttributeName: "maLich", AttributeType: "S" },
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "ngayhen", AttributeType: "S" },
        { AttributeName: "giohen", AttributeType: "N" }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'getListLichNhac',
            KeySchema: [
                { AttributeName: 'ngayhen', KeyType: "HASH" },
                { AttributeName: 'giohen', KeyType: "RANGE"}
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            }
        },
        {
            IndexName: 'kiemtraDatLich',
            KeySchema: [
                { AttributeName: 'email', KeyType: "HASH" },
                { AttributeName: 'ngayhen', KeyType: "RANGE"}
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
dynamodb.createTable(paramsLichNhac, (err, data) => {
    if (err)
        console.error("Unable to create table. Error JSON", JSON.stringify(err, null, 2));
    else
        console.log("Create table. Table description JSON", JSON.stringify(data, null, 2));
});
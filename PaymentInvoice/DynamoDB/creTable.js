const aws = require('aws-sdk');
require('../configure/dynamodb');       // kết nối database
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
        { AttributeName: 'maDN', AttributeType: "N" },

        // khai báo khóa khách hàng
        { AttributeName: 'maKH', AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'getHoaDonKH',
            KeySchema: [
                { AttributeName: 'maDN', KeyType: "HASH" },
                { AttributeName: 'maKH', KeyType: "RANGE" }
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

//******************************************************************************************* */

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
                { AttributeName: 'giohen', KeyType: "RANGE" }
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
                { AttributeName: 'ngayhen', KeyType: "RANGE" }
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

//******************************************************************************************* */

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
        { AttributeName: 'maDN', AttributeType: "N" },

        // khai báo khóa hoi vien
        { AttributeName: 'maHV', AttributeType: "S" }
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

//******************************************************************************************* */

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

//******************************************************************************************* */

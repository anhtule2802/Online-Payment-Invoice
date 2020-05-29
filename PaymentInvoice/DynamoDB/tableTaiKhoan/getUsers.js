const aws = require('aws-sdk');

require('../../configure/dynamodb');

const docClient = new aws.DynamoDB.DocumentClient();

function getListUsers() {
    let params = {
        TableName: "TaiKhoan",
        IndexName: "getListUser"
    };

    params.KeyConditionExpression = '#loaiTK = :loaiTK';
    params.ExpressionAttributeNames = {
        '#loaiTK': "loaiTK"
    };
    params.ExpressionAttributeValues = {
        ':loaiTK': Number(1)
    };

    docClient.query(params, (err, data) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        }
        else {
            console.log(data.Items);

            console.log("-------------------------------------------------------------------");

            // gửi hóa đơn đến email khách hàng theo ds đặt lịch
            


            // thực hiện xong xóa ds
            // if (dslich)
            //     deleteItem(dslich)
        }
    });
};

getListUsers()
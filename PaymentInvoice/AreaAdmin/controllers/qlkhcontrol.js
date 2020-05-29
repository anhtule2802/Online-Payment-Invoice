const AWS = require('aws-sdk');
const ejs = require('ejs-html');
const fs = require('fs');
require('../../configure/dynamodb');

const docClient = new AWS.DynamoDB.DocumentClient();

async function getThongKeHoaDon(soNam) {
	var soluong = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let paramsScan = {
		TableName: 'LichSuGiaoDich',
	}
	
	const callDocClient = () => new Promise((resolve, reject) => {
		docClient.scan(paramsScan).promise().then(res => {
			resolve(res);
		}).catch(err => {
			reject(err)
		});
	})
	const responseData = await callDocClient();
	
	
	responseData.Items.forEach(x => {
		var date = new Date(x.ngayGiaoDich);
		var month = date.toISOString().split('-')[1];
		var year =  date.toISOString().split('-')[0]
		for (let i = 0; i < 12; i++) {
			if (month == (i + 1) && year == soNam && x.hoadon!=undefined) {
				soluong[i]++;
			}

		}
	});
		return soluong;
};

async function getDoanhThu(soNam) {
	var sotien = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let paramsScan = {
		TableName: 'LichSuGiaoDich',
	}
	
	const callDocClient = () => new Promise((resolve, reject) => {
		docClient.scan(paramsScan).promise().then(res => {
			resolve(res);
		}).catch(err => {
			reject(err)
		});
	})
	const responseData = await callDocClient();
	
	responseData.Items.forEach(x => {
		var date = new Date(x.ngayGiaoDich);
		var month = date.toISOString().split('-')[1];
		var year =  date.toISOString().split('-')[0]
		for (let i = 0; i < 12; i++) {
			if (month == (i + 1) && year == soNam && x.phiGiaoDich != undefined) {
				sotien[i]+=x.phiGiaoDich;
			}

		}
	});
		return sotien;
};

async function getAllKH() {
	let params = {
        TableName: "TaiKhoan"
    }
	const callDocClient = () => new Promise((resolve, reject) => {
		docClient.scan(params).promise().then(res => {
			resolve(res);
		}).catch(err => {
			reject(err)
		});
	})
	const responseData = await callDocClient();
	return responseData;
};

async function searchKH(chuoiTim) {
	let params = {
		TableName: "TaiKhoan",
		IndexName: 'getListUser'
    }
	params.KeyConditionExpression = "loaiTK = :loaiTK";
	params.FilterExpression= "contains(hoivien.sodt, :chuoitim) or contains(email, :chuoitim) or contains(maHV, :chuoitim)";
    params.ExpressionAttributeValues ={
		':loaiTK':1,
		':chuoitim':chuoiTim
    }
	const callDocClient = () => new Promise((resolve, reject) => {
		docClient.query(params).promise().then(res => {
			resolve(res);
		}).catch(err => {
			reject(err)
		});
	})
	const responseData = await callDocClient();
	return responseData;
};

async function searchDN(chuoiTim) {
	let params = {
		TableName: "TaiKhoan",
		IndexName: 'getListUser'
    }
	params.KeyConditionExpression = "loaiTK = :loaiTK";
	params.FilterExpression= "contains(doanhnghiep.tenDN, :chuoitim) or contains(email, :chuoitim) or contains(doanhnghiep.sodt, :chuoitim) or contains(maDN, :chuoitim) ";
    params.ExpressionAttributeValues ={
		':loaiTK':2,
		':chuoitim':chuoiTim
    }
	const callDocClient = () => new Promise((resolve, reject) => {
		docClient.query(params).promise().then(res => {
			resolve(res);
		}).catch(err => {
			reject(err)
		});
	})
	const responseData = await callDocClient();
	return responseData;
};



module.exports = {
	getThongKeHoaDon:getThongKeHoaDon,
	getDoanhThu:getDoanhThu,
	getAllKH:getAllKH,
	searchKH:searchKH,
	searchDN:searchDN
}
const aws = require('aws-sdk');

aws.config.update({
    region: 'local',
    endpoint: "http://localhost:8000"
});
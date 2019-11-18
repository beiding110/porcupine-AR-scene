var express = require('express');
const path = require('path')
var expressWs = require('express-ws');
var ws = require('./ws');

var app = express();
expressWs(app);

app.use('/ws', ws);
app.use(express.static(path.join(__dirname, '../')))

app.listen(12110, () => {
    console.log('服务器已启动，端口号12110')
});

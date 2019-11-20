const express = require('express');
const expressWs = require('express-ws');

var router = express.Router();
expressWs(router);

function creatKeep(ws) {
    var lastkeeplife = 100;

    var keeplifeHandler = setInterval(function(){
        try {
            //  console.log(lastkeeplife,messageCount);
            if( lastkeeplife == -100 ){
                ws.close();
                ws.emit("close");
                clearInterval(keeplifeHandler);
            }
            try{
                ws.send(JSON.stringify({
                    type: 'heartBeating'
                }));
            }catch(e){
                lastkeeplife = -100;
                console.log("keep live error! "+ e +"\n\n");
                ws.close();
                ws.emit("close");
                clearInterval(keeplifeHandler);
            }
        } catch(e) {
            console.error(e)
        }
    },5000);

    return keeplifeHandler;
};

var PC_WS = [],
    MOBILE_WS;

var onceSendOk = true;

router.ws('/pc', function (ws, req){
    console.log('one PC connect');
    var heart;

    ws.send(JSON.stringify({
        type: 'connect',
        msg: '链接成功'
    }));

    PC_WS.push(ws);

    ws.on('message', function (msg) {
        var data;
        try{
            data = JSON.parse(msg);
        } catch(e) {
            console.error(e);
        };

        if(data.type === 'getDataOk') {
            onceSendOk = true;
        }
    });

    ws.on('close', function (msg) {
        PC_WS.splice(PC_WS.indexOf(ws), 1);
        console.log('one of PC close');
        clearInterval(heart)
    });

    heart = creatKeep(ws);
});

router.ws('/mobile', function (ws, req){
    console.log('one mobile connect');
    var heart;

    ws.send(JSON.stringify({
        type: 'connect',
        msg: '链接成功'
    }));

    MOBILE_WS = ws;

    ws.on('message', function (msg) {
        var data;
        try{
            data = JSON.parse(msg);
        } catch(e) {
            console.error(e);
        };

        if(data.type === 'mobile') {
            if(!onceSendOk) return;

            PC_WS.forEach(item => {
                item.send(JSON.stringify(data));
            });
            onceSendOk = false;
        }
    });

    ws.on('close', function (msg) {
        MOBILE_WS = null;
        console.log('one of MOBILE close');
        clearInterval(heart)
    });

    heart = creatKeep(ws);
});

module.exports = router;

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {

    ws.send(JSON.stringify({ state: 'CONNECTED' }));

    ws.on('message', function message(data) {

        // DEBUG
        console.log('message:', data.toString());

        wss.clients.forEach(function (client) {
            client.send(data.toString());
        });
    });

});
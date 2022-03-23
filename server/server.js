import { WebSocketServer } from 'ws';
import { NIL as uuid_NIL } from 'uuid';

// import { Dirty } from 'dirty';
import pkg from 'dirty';
const { Dirty } = pkg;

var db = new Dirty('db.json');

db.on('load', function (length) {
    console.log('Currently', length, 'records.');
    db.set('testKey', { data: "something" });
});


// const connections = {} // (rooms -> users)

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {

    ws.send(JSON.stringify({
        event: 'UPDATE',
        payload: {
            state: 'CONNECTED'
        }
    }));

    ws.on('message', function (data) {

        // TODO incoming message format ({event:<string>,payload:<object>}?)
        // TODO validate incoming message (yupjs)

        // Check message type (try?)
        let msg;
        try {
            msg = JSON.parse(data.toString());
        }
        catch (e) {
            console.log("Error:", e.message);
            return null;
        }



        if (msg.event == 'SERVER_REQUEST') {
            // handle request
            if (msg.payload.requestedData == 'USER_ID') {
                // generate id
                let userId = uuid_NIL;
                // set messages list for id to empty array
                db.set(userId, JSON.stringify(
                    { history: [] }
                ))
                // send RESPONSE
                ws.send(
                    JSON.stringify({
                        event: "RESPONSE",
                        payload: {
                            type: "UPDATE",
                            var: "USER_ID",
                            value: userId,
                        }
                    })
                );
            }
        }
        else if (msg.type = 'MESSAGE') {

            // DEBUG
            console.log('MESSAGE', msg.payload);

            // Log message to database
            // TODO: 
            if (msg.wfsData.userId) {
                db.update(
                    msg.wfsData.userId, function (value) {
                        let val = JSON.parse(value);
                        val.history.push(msg.payload.messageData);
                        console.log(val);
                        return JSON.stringify(val);
                    }
                )
            }
            // db.set('message', data.toString());

            // Broadcast all incoming messages to all clients
            // TODO restrict rooms
            wss.clients.forEach(function (client) {
                client.send(data.toString());
            });
        }

    });

});
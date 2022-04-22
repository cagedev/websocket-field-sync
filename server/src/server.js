import { WebSocketServer } from 'ws';
import { NIL as uuid_NIL } from 'uuid';
import { v4 as uuid_v4 } from 'uuid';
// console.log(uuid_NIL);
import * as yup from 'yup';

import { UserDB, MessageDB } from './models/db.js'

import { isUUID } from './utils/utils.js'; 

var userdb = new UserDB();
var msgdb = new MessageDB();

/**
 * Yup websocket message validation schemas
 * 
 * @type {Object.<string, yup.Schema, yup.Schema>}
 */
const messageSchema = yup.object({
    event: yup.string().required().oneOf(
        ["SERVER_REQUEST", "DATA_MESSAGE"]
    ), // from list
    wfsData: yup.object().shape({
        userName: yup.string(),
        userId: yup.string().test(
            'isUUID',
            "Invalid value for ${path} (${value})",
            function (value) { return isUUID(value) },
        ),
        roomId: yup.string().required(),
        syncType: yup.string(), // from list
    }),
    payload: yup.object(),
});


/**
 * Parses JSON message string and validates against the expected schema.
 * 
 * @param {string} messageString 
 * @returns {{event: string, wfsData: object, payload: object}}
 * @throws Will throw and error if the message is invalid JSON or and invalid schema.
 */
function parseMessage(messageString) {
    let msg;
    msg = JSON.parse(messageString);
    msg = messageSchema.validateSync(msg);
    return msg;
}


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

        let msg;
        try {
            msg = parseMessage(data);
        }
        catch (e) {
            console.log("Error:", e.message);
            return null;
        }


        if (msg.event == 'SERVER_REQUEST') {
            // handle request
            if (msg.payload.requestedData == 'USER_ID') {
                // generate id
                // let userId = uuid_NIL;
                let userId = uuid_v4();
                // set messages list for id to empty array
                msgdb.set(userId, JSON.stringify(
                    { history: [], roomIds: [] } // also empty array for roomIds?
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
            } else if (msg.payload.requestedData == 'ROOM_ID') {
                if (msg.wfsData.userId) {
                    console.log(msg.wfsData.userId);

                    let usr = userdb.get(msg.wfsData.userId);
                    try {
                        usr = JSON.parse(usr); // try?
                    }
                    catch (e) {
                        console.log("Error:", e.message);
                        return null; // ??
                    }

                    // If userId exists in database
                    if (usr) {
                        // Y: check if user has existing room(s)

                        // Y: return rooms
                        // N: generate roomId
                        // set roomId
                        // return roomId  
                        // generate id
                        let roomId = uuid_v4();

                        db.update(
                            msg.wfsData.userId, function (value) {
                                let val = JSON.parse(value);
                                val.roomIds.push(roomId);
                                console.log(val);
                                return JSON.stringify(val);
                            }
                        );

                        // send RESPONSE
                        ws.send(
                            JSON.stringify({
                                event: "RESPONSE",
                                payload: {
                                    type: "UPDATE",
                                    var: "ROOM_ID",
                                    value: roomId,
                                }
                            })
                        );
                    } else {
                        console.log("[Error] userId does not exist", msg.wfsData.userId);
                    }
                } else {
                    console.log("[Error] userId missing:", msg.wfsData);
                }

            }
            else {
                console.log("[Error] Unrecognized SERVER_REQUEST:", msg.payload.requestedData)
            }
        }
        else if (msg.type = 'DATA_MESSAGE') {

            // DEBUG
            console.log('DATA_MESSAGE', msg.payload);

            // Log message to database
            // TODO: Check if userId is in the active connections pool
            if (msg.wfsData.userId) {
                db.update(
                    msg.wfsData.userId, function (value) {
                        let val = JSON.parse(value);
                        val.history.push(msg.payload.messageData);
                        console.log(val);
                        return JSON.stringify(val);
                    }
                );
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
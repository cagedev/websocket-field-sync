import { WebSocketServer } from 'ws';
import { NIL as uuid_NIL } from 'uuid';
import { v4 as uuid_v4 } from 'uuid';

import { UserDB, RoomDB } from './models/db.js';
import { User } from './models/user.js';
// import { parseMessage } from './utils/utils.js';
import { Message } from './models/message.js';

import pkg from 'jsonwebtoken';
const { verify: jwtVerify } = pkg;

// TODO Load from environment
var jwtSecret = '$igningKey'

// Load the default users database
var userdb = new UserDB();

// Load the default messages database
var roomdb = new RoomDB();

// Create WebSocketServer
const wss = new WebSocketServer({
    port: 8080,
    verifyClient: (info, done) => { 
        let token = new URL(info.req.url, `http://${info.req.headers.host}`).searchParams.get('token');
        console.log(token);

        let decoded = jwtVerify(token, jwtSecret);
        console.log(decoded.userId);

        // console.log(info.req.headers.host);
        done(false);
    }
});


// TODO refactor (websocket) logic into modules
// 1. Authenticate (header is either logindata or a JWT)
//  - case logindata: 
//    - Verify logindata
//      - Generate JWT
//  - case JWT
//    - verify JWT
//      - case ok: handle message
//      - case expired: throw autherror
//      - case almost expired: request extension
// 2. Create room
// 3. Handle messages
wss.on('connection', function connection(ws, request) {

    // console.log(ws._socket.address());
    // console.log(new URL(request.url, `http://${request.headers.host}`).searchParams.get('token'));

    // DEBUG -> tests
    // userdb.registerUser();
    // let usr2 = new User({
    //     name: 'Test 02',
    //     roomIds: [],
    //     permissions: {
    //         maxRooms: 1,
    //         createUser: false,
    //         editUser: false,
    //     },
    //     lastSeen: null,
    // });
    // userdb.registerUser(usr2);
    // userdb.removeUserById(usr2.getUserId());
    // /DEBUG

    ws.send(JSON.stringify({
        event: 'UPDATE',
        payload: {
            state: 'CONNECTED'
        }
    }));

    ws.on('message', function (data) {

        let msg;
        try {
            msg = new Message(data);
        } catch (e) {
            console.log(e.message);
        }
        if (msg) {
            // if (msg.event == 'SERVER_REQUEST') {

            //     // handle request
            //     if (msg.payload.requestedData == 'USER_ID') {
            //         // generate id
            //         // let userId = uuid_NIL;
            //         let userId = uuid_v4();
            //         // set messages list for id to empty array
            //         msgdb.set(userId,
            //             { history: [], roomIds: [] } // also empty array for roomIds?
            //         );
            //         // send RESPONSE
            //         ws.send(
            //             JSON.stringify({
            //                 event: "RESPONSE",
            //                 payload: {
            //                     type: "UPDATE",
            //                     var: "USER_ID",
            //                     value: userId,
            //                 }
            //             })
            //         );
            //     } else if (msg.payload.requestedData == 'ROOM_ID') {
            //         if (msg.wfsData.userId) {
            //             console.log(msg.wfsData.userId);

            //             let usr = userdb.get(msg.wfsData.userId);
            //             try {
            //                 usr = JSON.parse(usr);
            //             }
            //             catch (e) {
            //                 console.log("Error:", e.message);
            //                 return null; // ??
            //             }

            //             // If userId exists in database
            //             if (usr) {
            //                 // Y: check if user has existing room(s)

            //                 // Y: return rooms
            //                 // N: generate roomId
            //                 // set roomId
            //                 // return roomId  
            //                 // generate id
            //                 let roomId = uuid_v4();

            //                 db.update(
            //                     msg.wfsData.userId, function (value) {
            //                         let val = JSON.parse(value);
            //                         val.roomIds.push(roomId);
            //                         console.log(val);
            //                         return JSON.stringify(val);
            //                     }
            //                 );

            //                 // send RESPONSE
            //                 ws.send(
            //                     JSON.stringify({
            //                         event: "RESPONSE",
            //                         payload: {
            //                             type: "UPDATE",
            //                             var: "ROOM_ID",
            //                             value: roomId,
            //                         }
            //                     })
            //                 );
            //             } else {
            //                 console.log("[Error] userId does not exist", msg.wfsData.userId);
            //             }
            //         } else {
            //             console.log("[Error] userId missing:", msg.wfsData);
            //         }

            //     }
            //     else {
            //         console.log(`[Error] Unrecognized SERVER_REQUEST: ${msg.payload.requestedData}`)
            //     }
            // }
            // else 
            if (msg.event = 'DATA_MESSAGE') {
                // DEBUG
                // console.log('DATA_MESSAGE', msg.payload);

                roomdb.addMessage(msg);

                // Log message to database
                // TODO: Check if userId is in the active connections pool
                // if (msg.wfsData.userId) {
                //     db.update(
                //         msg.wfsData.userId, function (value) {
                //             let val = JSON.parse(value);
                //             val.history.push(msg.payload.messageData);
                //             console.log(val);
                //             return JSON.stringify(val);
                //         }
                //     );
                // }
                // db.set('message', data.toString());

                // Broadcast all incoming messages to all clients
                // TODO restrict rooms
                wss.clients.forEach(function (client) {
                    client.send(data.toString());
                });
            }
        }

    });

});
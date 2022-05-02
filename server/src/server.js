import { WebSocketServer } from 'ws';
import { NIL as uuid_NIL } from 'uuid';
import { v4 as uuid_v4 } from 'uuid';

import { UserDB, RoomDB } from './models/db.js';
import { User } from './models/user.js';
// import { parseMessage } from './utils/utils.js';
import { Message } from './models/message.js';

import { verifyClientId } from './utils/utils.js'

// TODO Load from environment/file
const jwtSecret = '$igningKey'

// Load the default users database
var userdb = new UserDB();

// Load the default messages database
var roomdb = new RoomDB();

// Create WebSocketServer
const wss = new WebSocketServer({
    port: 8080
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

    // Verify jwt (this is done _once_ upon establishing the connection)
    // TODO rename verified variables
    let id = verifyClientId(request, jwtSecret);

    // DEBUG
    // console.log('id:', id);

    if (id) {
        // Update lastSeen in database
        userdb.seenById(id);
        
        // DEBUG
        // console.log(userdb.getUserById(id));
    } else {
        console.log('closing connection');
        ws.close();
    }

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

    // ws.send(JSON.stringify({
    //     event: 'UPDATE',
    //     payload: {
    //         state: 'CONNECTED'
    //     }
    // }));

    // Handle an incoming 'message'; the userId is still available here.
    ws.on('message', function (data) {

        // DEBUG
        // console.log(`[message]: ${data.toString()}`);

        // Update lastSeen in database (unsafe)
        userdb.seenById(id);

        // DEBUG
        // ws.roomId = 'testId';

        let msg;
        try {
            msg = new Message(data);
        } catch (e) {
            console.log(e.message);
        }
        if (msg) {

            if (msg.event = 'DATA_MESSAGE') {
                // DEBUG
                // console.log('DATA_MESSAGE', msg.payload);

                let _roomId = msg.getRoomId();
                let _data = msg.getData();

                // Check if user is permitted to send data
                if (userdb.getUserById(id).isAllowedToSendToRoom(_roomId)) {

                    // DEBUG
                    console.log(`roomdb.addMessage(${_roomId}, ${_data})`);

                    roomdb.addMessage(_roomId, _data);

                    // Broadcast all incoming messages to all clients
                    // TODO restrict to rooms
                    // TODO use 'Message' class for standardizing serialization
                    wss.clients.forEach(function (client) {
                        client.send(data.toString());
                    });
                }
            }
        }

    });

});
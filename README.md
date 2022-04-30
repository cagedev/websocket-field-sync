# websocket-field-sync
Javascript library for synchronising an HTML form field across clients.

## Usage
```shell
npm run dev
```

## Configuration / Protocol

The client must be configured with the following settings:
```js
wfsConfig = {
    serverUrl: "",      // server url - websocket connection url; local
    userName: "",       // user nickname - for public display; broadcast
    userId: "",         // user id - for identification etc.; broadcast
    connections:        // array of requested connections; each connection is initiated seperately (?)
        [
            {
                roomId: "",         // room id - for grouping; broadcast; defaults to null
                eventElementId: "", // DOM id of the DOM element that triggers the update event; local
                updateEvent: "",    // event used for sending an update message; local
                syncType: "",       // type of synchronisation between clients; broadcast; defaults to "SEND"
                dataFieldId: "",    // local id of DOM element containing the linked data (local)
            }
        ]
}
```

### Example usage:
```html
<form>
    <textarea id="myDataField"></textarea>
</form>
```

```js
var wfs = new WfsConnection(config = {
    serverUrl: "ws://127.0.0.1:8080",
    userName: "Test Nickname",
    userId: "00000000-0000-0000-0000-000000000000",
    connections: 
        [
            {    
                roomId: null,
                dataElementId: "myDataField",
                updateEvent: "onchange",
                eventElementId: "myDataField",
                syncType: "SEND",
            }   
        ]
});
```

## Message Protocol

The JSON messages consist of a String `event`-flag and a `payload`-object.

For example:
```json
message = {
    "event": "RESPONSE",
    "wfsData": {
        // wfsData-object
    },
    "payload": {
        "type": "UPDATE",
        "var":  "ROOM_ID",
        "value": roomId,
    }
}
```

Current implementation:

```json
wfsData = {
    "roomId"   = wfsConfig.roomId; // May be omitted in first message 
    "syncType" = wfsConfig.syncType;
    "userId"   = wfsConfig.userId; // (deprecated) contained in JWT
    "userName" = wfsConfig.userName;
}
```

### Exchange (TODO)
 1. Client initializes connection with a WebSocket connection to a URI containing a JWT in the `token`-parameter ([method 2](https://websockets.readthedocs.io/en/latest/topics/authentication.html)).
 2. Client selects a roomId for communication in this connection.


## TODO
 - [x] Basic websocket echo-to-all
 - [x] Working proof of concept (echo server)
 - [x] Working proof of concept (simple client)
 - [ ] Working proof of concept (overview client)
 - [ ] Abstract client-side code to a library
 - [ ] Message protocol
   - [ ] Streamline different message types
 - [ ] Style guide
 - [ ] Rename to `EntangleJS`
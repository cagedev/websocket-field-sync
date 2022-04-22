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
    "roomId"   = wfsConfig.roomId;
    "syncType" = wfsConfig.syncType;
    "userId"   = wfsConfig.userId;
    "userName" = wfsConfig.userName;
}
```

Server pushes `'UPDATE'` messages in response to (websocket) events or (`'SERVER_REQUEST'`) client messages. Client and server exchange actual sync data with the `'DATA_MESSAGE'`. Client-to-server messages are validated; server responds with an appropriate error. Client 

| Event            | Payload                                                                                    |  roomId  | syncType |  userId  | userName |
| :--------------- | :----------------------------------------------------------------------------------------- | :------: | :------: | :------: | :------: |
| `UPDATE`         | `state` : String                                                                           |          | required |          | optional |
| `SERVER_REQUEST` | `requestedData : String ` from `["USER_ID", "ROOM_ID", "MESSAGE_HISTORY"]`                 |          | required |          | optional |
|                  | `requestedData = "USER_ID"`                                                                |          | required |          | optional |
|                  | `requestedData = "ROOM_ID"`                                                                |          | required | required | optional |
|                  | `requestedData = "MESSAGE_HISTORY"`                                                        | required | required | required | optional |
| `DATA_MESSAGE`   | `messageData : String \| JSON`                                                             | required | required | required | optional |
| `RESPONSE`       | `type : String` from `["UPDATE"]`,                                                         |   none   |   none   |   none   |   none   |
|                  | `var : String` <variable_name> from `[ "STATE", "USER_ID", "ROOM_ID", "MESSAGE_HISTORY" ]` |          |          |          |          |
|                  | `value : String \| Object` <variable_value>                                                |          |          |          |          |
| `ERROR`          | `type : String` from `["INVALID_VARIABLE", "MALFORMED_REQUEST"]`                           |   none   |   none   |   none   |   none   |
|                  | `var : String` <variable_name> from `[ "USER_ID", "ROOM_ID" ]`                             |          |          |          |          |

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
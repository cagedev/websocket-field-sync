# websocket-field-sync
Javascript library for synchronising an HTML form field across clients.

## Usage
```
npm run dev
```

## Configuration / Protocol

The client must be configured with the following settings
```
wfsConfig = {
    serverUrl: "", // server url - websocket connection url; local
    userName: "", // user nickname - for public display; broadcast
    userId: "", // user id - for identification etc.; broadcast
    roomId: "", // room id - for grouping; broadcast
    eventElementId: "", // local id of the DOM element that triggers the update event; local
    updateEvent: "", // event used for sending an update message; local
    syncType: "", // SEND (broadcast) (type of synchronisation between clients; broadcast)
    dataFieldId: "", // local id of DOM element containing the linked data (local)
}
```

## TODO
 - [x] Basic websocket echo-to-all
 - [x] Working proof of concept (echo server)
 - [x] Working proof of concept (simple client)
 - [ ] Working proof of concept (overview client)
 - [ ] Abstract client-side code to a library
 - [ ] 
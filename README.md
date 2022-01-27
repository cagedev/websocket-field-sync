# websocket-field-sync
Javascript library for synchronising an HTML form field across clients.

## Configuration / Protocol

The client must be configured with the following settings
```
{
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
 - [ ] Working proof of concept
 - [ ] Abstract client-side code to a library
 - [ ] 
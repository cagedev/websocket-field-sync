// Override the default data attribute naming by passing 'data-prefix' with the script
const LIBRARY_PREFIX = document.currentScript.dataset.prefix || 'entangle';

// DEBUG execute during script load
// TODO Retrieve server parameters from data attributes
let _serverUri = document.currentScript.dataset.serverUri || '';

// Check if a token is either passed as a data parameter to the script, via GET (or none)
// TODO Better naming
let _token = document.currentScript.dataset.token || new URLSearchParams(window.location.search).get('token');

// Connection pool
let entangledConnections = [];

// Only (try to) autoload if there is a token present
if (_token) {
    document.addEventListener('DOMContentLoaded', (event) => {

        // TODO Refactor into WfsConnection class (-> Enganglement)

        // Find all elements with a 'data-entangle-room-id' attribute
        let _entangled = document.querySelectorAll(`[data-${LIBRARY_PREFIX}-room-id]`);

        // Set events for handling updates
        _entangled.forEach((element) => {
            // console.log(_entangled);

            // Add new connectionto the pool
            entangledConnections.push(
                // NOTE Should fail gracefully if rejected
                new EntangledConnection(element, _serverUri, _token, element.dataset)

                // If 'data-entangle-room-id' is a UUID then start by requesting the history

                // If 'data-entangle-room-id' is REQUEST then start by requesting a roomId; then request the history
            );
        });

        // DEBUG connection pool
        console.log(entangledConnections);

    });
}


/* refactored to here */
// TODO Refactor into Entanglement-class

class EntangledConnection {
    wfsConnection;

    token;
    serverUri;

    roomId = "REQUEST" // This is either a valid UUID to be passed directly or an update request.
    updateEvent = "onchange" // "This is the update event, if unset there is no event listener set.
    updateEventElementId = "targetField" // The id of the element with the event listener (usually the same as the initializing element).
    updateTimer = "60000" // This is the event timer timeout in ms. If unset there is no timer.
    syncType = "SEND" // One from the following list: ['SEND', 'RECEIVE', 'SYNC']. Currenttly only 'SEND' is implemented.

    // roomId = "default" // This is either a valid UUID to be passed directly or an update request.
    // updateEvent = "onchange" // "This is the update event, if unset there is no event listener set.
    // updateEventElementId = "targetField" // The id of the element with the event listener (usually the same as the initializing element).
    // updateTimer = "60000" // This is the event timer timeout in ms. If unset there is no timer.
    // syncType = "SEND" // One from the following list: ['SEND', 'RECEIVE', 'SYNC']. Currenttly only 'SEND' is implemented.

    // TODO
    // Implement status feedback
    // stateElementId
    // stateTranslator // Array for mapping status values of element properties
    // Example stateTranslator for a form status field. Using innerHTML would be the way to go for a div status field.
    // stateTranslator = [
    //     0: {
    //         property: 'value',
    //         value: 'CONNECTING',
    //     },
    //     1: {
    //         property: 'value',
    //         value: 'OPEN',
    //     },
    //     2: {
    //         property: 'value',
    //         value: 'CLOSING',
    //     },
    //     3: {
    //         property: 'value',
    //         value: 'CLOSED',
    //     },
    // ]

    /**
     * 
     * @param {*} element
     * @param {*} serverUri 
     * @param {*} token 
     * @param {*} options 
     */
    constructor(element, serverUri, token, options = {}) {
        // DEBUG
        // console.log(options);

        // = handleConfigure
        this.serverUri = serverUri;
        this.token = token;

        // If optional values are specified
        if (options) {
            this.roomId = options[`${LIBRARY_PREFIX}RoomId`] || this.roomId;
            this.updateEvent = options[`${LIBRARY_PREFIX}UpdateEvent`] || this.updateEvent;
            this.updateEventElementId = options[`${LIBRARY_PREFIX}UpdateEventElementId`] || this.updateEventElementId;
            this.updateTimer = parseInt(options[`${LIBRARY_PREFIX}UpdateTimer`]) || this.updateTimer;
            this.syncType = options[`${LIBRARY_PREFIX}SyncType`] || this.syncType;
        }

        // event.preventDefault();
        // const formdata = new FormData(event.target);
        // wfsConfig = Object.fromEntries(formdata.entries());

        // DEBUG
        // console.log('wfsConfig', wfsConfig);

        // Set event handler
        // let evt = wfsConfig.updateEvent;
        // let id = wfsConfig.eventElementId;
        // document.getElementById(id).addEventListener(evt, function (event) {
        //     console.log(event);
        //     updateWfsData();
        //     wfsConnection.send(JSON.stringify({
        //         event: "DATA_MESSAGE",
        //         wfsData: wfsData,
        //         payload: {
        //             messageData: document.getElementById(id).value,
        //         }
        //     }));
        // })

        this.wfsConnection = new WebSocket(`${this.serverUri}?token=${this.token}`, "json");

        this.wfsConnection.onopen = function (event) {
            console.log(event);
        }


        // = handleConnect
    }


}



function updateWfsData() {
    // Hacky because no two way sync
    // This should include the connections as an array

    // Update relevant part of wfsData from wfsConfig
    wfsData.roomId = wfsConfig.roomId;
    wfsData.syncType = wfsConfig.syncType;
    wfsData.userId = wfsConfig.userId;
    wfsData.userName = wfsConfig.userName;
}


// Event handlers
// => handleConfigureButton?
function handleConfigureButton(event) {
    event.preventDefault();
    const formdata = new FormData(event.target);
    wfsConfig = Object.fromEntries(formdata.entries());

    // DEBUG
    console.log('wfsConfig', wfsConfig);

    // Set event handler
    let evt = wfsConfig.updateEvent;
    let id = wfsConfig.eventElementId;
    document.getElementById(id).addEventListener(evt, function (event) {
        console.log(event);
        updateWfsData();
        wfsConnection.send(JSON.stringify({
            event: "DATA_MESSAGE",
            wfsData: wfsData,
            payload: {
                messageData: document.getElementById(id).value,
            }
        }));
    })
}

// => handleConnectButtonButton?
function handleConnectButton(event) {
    event.preventDefault();
    wfsConnection = new WebSocket(`${wfsConfig.serverUri}?token=${wfsConfig.token}`, "json");

    wfsConnection.onopen = function (event) {

        // DEBUG
        console.log("wfsConnection.onopen");

        // TODO request connectionId
        // TODO define datastructure

        // OLD TODO new login procedure
        // updateWfsData();
        // wfsConnection.send(JSON.stringify({
        //   event: "SERVER_REQUEST",
        //   wfsData: wfsData,
        //   payload: {
        //     requestedData: "USER_ID",
        //   }
        // }));

        // TODO start statusMonitor
        //  - timeSinceLastMessage
        //  - connectionSpeed
    };

    wfsConnection.onmessage = function (event) {
        // DEBUG
        let msg = JSON.parse(event.data);

        console.log("wfsConnection.onmessage");

        // Interpret message
        // Assume event/payload-structure
        // Use a connection structure
        switch (msg.event) {

            case "MESSAGE":
                console.log("MESSAGE:", msg.payload);
                break;

            case "RESPONSE":
                console.log("RESPONSE:", msg.payload);

                if (msg.payload.var == "USER_ID") {
                    wfsConfig.userId = msg.payload.value;
                    document.getElementById("userId").value = wfsConfig.userId;
                    updateWfsData();
                    wfsConnection.send(JSON.stringify({
                        event: "SERVER_REQUEST",
                        wfsData: wfsData,
                        payload: {
                            requestedData: "ROOM_ID",
                        }
                    }));
                }

                else if (msg.payload.var == "ROOM_ID") {
                    wfsConfig.roomId = msg.payload.value;
                    document.getElementById("roomId").value = wfsConfig.roomId;
                }

                else {
                    console.log("Error: Invalid RESPONSE payload", msg.payload);
                }
                break;

            case "UPDATE":
                console.log("UPDATE:", msg.payload);
                wfsConfig.state = msg.payload.state;
                // DEBUG
                console.log("wfsConfig:", wfsConfig);
                break;

            default:
                console.log("Unrecognised message:", msg);
        }

    };

    wfsConnection.onclose = function (event) {
        console.log('Connection closed.')
    };

    // TODO
    // setup wfs-link with current parameters
    // ? auth on serverUri
    // - connect to serverUri
    // - send setup message
    // - set local data event handler
    //   - on event
    //   - update data package
    //   - send data
    // - set external event handler
    //   - on message
    //   - update local data package
    //   - update local data field (do not fire handler)
};

function handleSendButton(event) {
    // TODO use prototype 
    updateWfsData();
    let msg = {
        event: "DATA_MESSAGE",
        wfsData: wfsData,
        payload: {
            updateType: "FULL", // {FULL, UPDATE/DIFF}
            messageData: document.getElementById(wfsConfig.dataElementId).value,
        }
    }
    console.log('handleSendButton', msg);
    wfsConnection.send(JSON.stringify(msg));
}

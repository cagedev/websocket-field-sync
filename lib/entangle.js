// DEBUG execute during script load
// TODO Retrieve server parameters from data attributes
let _serverUri = document.currentScript.dataset.serverUri || '';

// Check if a token is either passed as a data parameter to the script, via GET (or none)
// TODO Better naming
let _token = document.currentScript.dataset.token || new URLSearchParams(window.location.search).get('token');
let _connections = [];

// Only (try to) autoload if there is a token present
if (_token) {
    document.addEventListener('DOMContentLoaded', (event) => {

        // TODO Refactor into WfsConnection class (-> Enganglement)

        // Find all (form?) elements with a 'data-entangle-room-id' attribute
        let _entangled = document.querySelectorAll('[data-entangle-room-id]');
        console.log(_entangled);

        // Set events for handling updates
        // _entangled.forEach((element) => {
        //     _connections.push(
        //         new WfsConnection(...etc);
        //     );
        // });

        // If 'data-entangle-room-id' is a UUID

        // If 'data-entangle-room-id' is REQUEST then start by requesting a roomId
    });
}


/* refactored to here */
// TODO Refactor into Entanglement-class

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
    wfsConnection = new WebSocket(`${wfsConfig.serverUrl}?token=${wfsConfig.token}`, "json");

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
    // ? auth on serverUrl
    // - connect to serverUrl
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

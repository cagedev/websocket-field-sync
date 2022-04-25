import * as yup from 'yup';

import { isUUID } from '../utils/utils.js'


/**
 * Yup websocket message validation schemas
 * 
 * @type {Object.<string, yup.Schema, yup.Schema>}
 */
const messageSchema = yup.object({
    event: yup.string().required().oneOf(
        ['SERVER_REQUEST', 'DATA_MESSAGE']
    ), // from list
    wfsData: yup.object().shape({
        userName: yup.string(),
        userId: yup.string().test(
            'isUUID',
            'Invalid value for ${path} (${value})',
            (value) => { return isUUID(value) },
        ),
        roomId: yup.string().required(),
        syncType: yup.string(),
    }),
    payload: yup.object(),
});

/**
 * Parses JSON message string and validates against the expected schema.
 * 
 * @param {string} messageString JSON message data string
 * @returns {{event: string, wfsData: object, payload: object}}
 * @throws Will throw and error if the message is invalid JSON or and invalid schema.
 */
function parseMessage(messageString) {
    let msg;
    // console.log(msg);
    msg = JSON.parse(messageString);
    // console.log(msg);
    msg = messageSchema.validateSync(msg);
    // console.log(msg);
    return msg;
}

export class Message {
    event;
    payload;
    header;

    constructor(evt, pld, hdr) {
        if (pld && hdr) {
            this.event = evt;
            this.payload = pld;
            this.header = hdr;
        } else {
            let data = evt;
            let msg;
            try {
                msg = parseMessage(data);
            }
            catch (e) {
                console.log(e.message);
                throw new Error('Failed to create message.')
            }
            this.event = msg.event;
            this.payload = msg.payload;
            this.header = msg.wfsData; // update to header
        }
    }

    toString() {
        return JSON.stringify(this);
    }

}
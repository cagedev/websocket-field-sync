// import { Dirty } from 'dirty';
import pkg from 'dirty';
const { Dirty } = pkg;

// NOTES
// TODO class UserDB
// - [ ] check_password()
// - [ ] generate_token() - JWT
// - [ ] get_roomIds()
// - [ ] cleanup on exit


/**
 * Wrapper class for a Dirty database.
 * Handles (de)serialization.
 */
class Database {

    db;
    filename;
    type;

    /**
     * (Creates and) Loads a database from file.
     * 
     * @param {string} filename
     * @param {string} type - 'USER_DB' | 'MESSAGE_DB'
     */
    constructor(filename, type) {
        this.filename = filename;
        this.db = new Dirty(this.filename);

        this.db.on('load', function (length) {
            console.log(`Loaded ${type} containing ${length} records.`);
        });
    }

    /**
     * Write key-value pair to database.
     * Handles serialization.
     * 
     * @param {string} key - key
     * @param {object} value - value, can be any object
     * 
     * TODO: 
     */
    set(key, value) {
        this.db.set(key, JSON.stringify(value)); // default behavior
    }

    /**
     * Gets value from the database.
     * Handles deserialization.
     * 
     * @param {string} key 
     * @returns {(object|null)} parsed value or null
     */
    get(key) {
        let value = this.db.get(key);
        try {
            value = JSON.parse(value);
        }
        catch (e) {
            console.log(`ERROR ${e.message}`);
            return null;
        }
        return value;
    }

}

/**
 * Creates a database for userdata
 * 
 * TODO: Handle data validation according to schema.
 * 
 * 
 * 
var userSchemaJSON = {
    key: userId,
    value: {
        name: "Display Name",
        roomIds:
            [
                "",
            ],
        permissions:
        {
            createNewRoom: true,
            maxRooms: 1,
        },
        lastSeen: "" // DateTime of last update
    }
}
 * 
 * 
 */
export class UserDB extends Database {
    constructor(filename = './data/users.json') {
        super(filename, "USER_DB");
    }
}

/**
 * Creates a database for messagedata.
 * 
 * TODO: Handle data validation according to schema.
 */
export class MessageDB extends Database {
    constructor(filename = './data/messages.json') {
        super(filename, "MESSAGES_DB");
    }
}
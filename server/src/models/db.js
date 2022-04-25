import pkg from 'dirty';
const { Dirty } = pkg;
import { User } from './user.js';
import { v4 as uuid_v4 } from 'uuid';

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
        this.type = type;
        this.db = new Dirty(this.filename);

        this.db.on('load', (length) => {
            console.log(`Loaded ${type} containing ${length} records; ${this.db.redundantLength} are redundant.`);
        });

        // DEBUG
        this.db.on('drain', () => {
            this.db.compact();
            console.log(`All records saved to disk; ${this.db.redundantLength} redundant records.`);
        });

        // DEBUG
        this.db.on('compacted', () => {
            console.log('Database compacted.');
        });
    }

    /**
     * Write key-value pair to database.
     * Handles serialization.
     * 
     * @param {string} key - key
     * @param {object} value - value, can be any object
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

    /**
     * 
     * @param {*} key 
     */
    remove(key) {
        this.db.rm(key);
    }

}

/**
 * A database for user data.
 * 
 * @extends Database
 * 
 * TODO: Handle data validation according to schema -> User
 */
export class UserDB extends Database {
    constructor(filename = './data/users.json') {
        super(filename, "USER_DB");
    }

    /**
     * Registers user in database. User's ID is created uniquely.
     * 
     * @param {object} user - the User object
     * @returns {(object|null)}  null in case of error; otherwise it returns a validated user object
     */
    registerUser(user) {
        if (user instanceof User) {
            let id = user.getUserId()

            // Check userId against database
            if (this.db.get(id)) {
                console.log(`ERROR: UserId ${userId} already exists.`)
                return null;
            }
            else {
                this.db.set(id, user.getUserData());
                return user;
            }
        } else {
            console.log(`ERROR: Invalid user data type: ${typeof user}`)
            return null;
        }
    }

    /**
     * 
     * @param {string} userId 
     */
    removeUserById(userId) {
        this.db.rm(userId);
        // if (this.db.get(id)) {
        //     this.db.
        // } else {
        //     return false;
        // }
    }
}

/**
 * A database for room data.
 * 
 * @extends Database
 * 
 * TODO: Handle data validation according to schema.
 */
export class RoomDB extends Database {
    constructor(filename = './data/rooms.json') {
        super(filename, 'ROOM_DB');
    }

    addMessage(msg) {
        // Future
        // this.db.set(msg.header.roomId, msg.payload.value);

        // Future2
        // this.db.update(msg.header.roomId, updatefunction to append to value history queue);

        this.db.set(msg.header.roomId, msg.payload.messageData);
    }
}
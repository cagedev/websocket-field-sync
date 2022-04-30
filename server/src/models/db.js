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
     * @param {string} type - 'USER_DB' | 'ROOM_DB'
     */
    constructor(filename, type) {
        this.filename = filename;
        this.type = type;
        this.db = new Dirty(this.filename);

        this.db.on('load', (length) => {
            console.log(`Loaded ${type} containing ${length} records; ${this.db.redundantLength} are redundant.`);
        });

        // DEBUG
        // this.db.on('drain', () => {
        //     this.db.compact();
        //     console.log(`All records saved to disk; ${this.db.redundantLength} redundant records.`);
        // });

        // DEBUG
        // this.db.on('compacted', () => {
        //     console.log('Database compacted.');
        // });
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
        // console.log(value);
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
     * Removes key from the database.
     * 
     * @param {string} key - key
     */
    remove(key) {
        this.db.rm(key);
    }

    /**
     * Write key-value pair to database.
     * Handles serialization.
     * 
     * @param {string} key - key
     * @param {object} value - value, can be any object
     */
    set(key, value) {
        this.db.set(key, JSON.stringify(value));
    }

    /**
     * Update key-value pair in the database.
     * 
     * @param {string} key - key
     * @param {function(object): object} updater - updater function that is passed the current value of the key and;
     *                                             returns the new value of the key 
     */
    update(key, updater) {
        this.set(key, updater(this.get(key)));
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
     * Find a user with a certain id (basic lookup)
     * 
     * @param {string} id - the user id
     * @returns {(object|null)}  null in case of error; otherwise it returns a validated user object
     */
    getUserById(id) {
        let _usr = this.get(id);
        if (_usr) {
            // TODO parse via and return User object
            return new User(_usr);
        } else {
            return null;
        }
    }

    /**
     * UNUSED -> disabled
     * TODO full user details, for parsing
     * TODO validate permission (provide parentId)
     *
     * Registers user in database. User's ID is created uniquely.
     * 
     * @param {object} user - the User object
     * @returns {(object|null)}  null in case of error; otherwise it returns a validated user object
     */
    // registerUser(user) {
    //     if (user instanceof User) {
    //         let id = user.getUserId()

    //         // Check userId against database
    //         if (this.get(id)) {
    //             console.log(`ERROR: UserId ${userId} already exists.`)
    //             return null;
    //         }
    //         else {
    //             this.set(id, user.getUserData());
    //             return user;
    //         }
    //     } else {
    //         console.log(`ERROR: Invalid user data type: ${typeof user}`)
    //         return null;
    //     }
    // }

    /**
     * UNUSED -> disabled
     * 
     * TODO validate permission (provide parentId)
     * 
     * @param {string} userId 
     */
    // removeUserById(userId, parentId) {
    //     this.rm(userId);
    // }

    /**
     * Update lastSeen to current time.
     * 
     * @param {string} id 
     */
    seenById(id) {
        console.log('Seen: ', id);
        this.update(id, (value) => {
            value.lastSeen = Date.now();
            return value;
        });
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

    historySize = 10;

    constructor(filename = './data/rooms.json') {
        super(filename, 'ROOM_DB');
    }

    /**
     * Appends a data value to the start of the room message array; 
     * respecting historySize.
     * 
     * @param {string} id - roomId
     * @param {string} value - data value 
     */
    addMessage(id, value) {
        // TODO Use a Message class for safe parsing
        // TODO check array management for efficiency
        this.update(id, (oldValue) => {
            oldValue.unshift(value);
            if (oldValue.length > this.historySize) {
                return oldValue.slice(0, this.historySize);
            }
            return oldValue;
        });
    }
}
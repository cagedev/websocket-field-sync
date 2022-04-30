import { v4 as uuid_v4 } from 'uuid';

import { isUUID } from '../utils/utils.js'

/**
 * Class for storing user data. Contains permission logic.
 */
export class User {

    id;
    name;
    roomIds = [];
    permissions = {
        maxRooms: 1,
        viewRoomsList: false,
        // createRooms: false,
        // createUser: false,
        // editUser: false,
    };
    lastSeen = null; // timestamp (ms)
    // parentId

    /**
     * Creates a user based on a userData provided.
     * 
     * @param {object} userData - an object containing a name, roomIds, permissions
     * @returns 
     */
    constructor(userData) {
        if (userData) {
            try {
                this.name = userData.name;
            } catch (e) {
                console.log(`ERROR ${e.message}; no username provided.`);
                return null;
            }
            // Use default values if no data provided
            this.roomIds = userData.roomIds || this.roomIds;
            this.permissions = userData.permissions || this.permissions;
            this.lastSeen = userData.lastSeen || this.lastSeen;

            // Generate new uuid if no valid uuid provided
            this.id = isUUID(userData.id) ? userData.id : uuid_v4();
        }
    }

    /**
     * Returns true if the current user may send data to the specified room.
     * 
     * @param {string} roomId 
     * @returns {boolean}
     */
    isAllowedToSendToRoom(roomId) {
        if (this.roomIds.indexOf(roomId) >= 0) {
            return true;
        }
        return false;
    }

    /**
     * UNUSED -> disabled
     * Returns true if the current user may receive data from the specified room.
     * 
     * @param {string} roomId 
     * @returns {boolean}
     */
    // isAllowedToReceiveFromRoom(roomId) {
    //     if (this.roomIds.indexOf(roomId) >= 0) {
    //         return true;
    //     }
    //     return false;
    // }

    /**
     * Returns user id.
     * 
     * @returns {string} user id (uuid v4)
     */
    getUserId() {
        return this.id;
    }

    /**
     * Returns user data without id.
     * 
     * @returns {object}
     */
    getUserData() {
        return {
            name: this.name,
            roomIds: this.roomIds,
            permissions: this.permissions,
            lastSeen: this.lastSeen
        }
    }
}
import { v4 as uuid_v4 } from 'uuid';


// TODO: Handle validation
// var userSchemaJSON = {
//     key: userId,
//     value: {
//         name: "Display Name",
//         roomIds:
//             [
//                 "",
//             ],
//         permissions:
//         {
//             createNewRoom: true,
//             maxRooms: 1,
//         },
//         lastSeen: "" // DateTime of last update
//     }
// }


export class User {

    id;
    name;
    roomIds = [];
    permissions = {
        maxRooms: 1,
        createUser: false,
        editUser: false,
    };
    lastSeen = null;
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
                this.roomIds = userData.roomIds;
                this.permissions = userData.permissions;
                this.lastSeen = userData.lastSeen;
            } catch (e) {
                console.log(`ERROR ${e.message}; invalid/incomplete userData`);
                return null;
            }

        }

        // Generate a new userId
        this.id = uuid_v4();
    }

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
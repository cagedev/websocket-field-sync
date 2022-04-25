class Room {
    id; // uuid
    createdBy; // userId
    createdAt; // dateTime
    // dataType? typeof value 
    value; // string?
    history; // array (queue) of userIds-value pairs
    maxHistorySize = 10; 
}
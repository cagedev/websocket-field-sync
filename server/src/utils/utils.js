/**
 * Checks if a given string is a valid uuid.
 * 
 * @param {string} uuid 
 * @returns 
 */
export function isUUID(uuid) {

    let s = "" + uuid;
    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
        return false;
    }

    return true;
}

import pkg from 'jsonwebtoken';
const { verify: jwtVerify } = pkg;

/**
 * Verifies the 
 * @param {object} request - Node (?) request object
 * @param {string} jwtSecret - private JWT secet 
 * @param {string} [tokenName='token'] - JWT token parameter key label; defaults to 'token'
 * @returns 
 */
export function verifyClientId(request, jwtSecret, tokenName = 'token') {
    let token = new URL(request.url, `http://${request.headers.host}`).searchParams.get(tokenName);
    let status = jwtVerify(token, jwtSecret, (error, decoded) => {
        if (error) {
            return false;
        } else {
            return decoded.userId;
        }
    });
    return status;
}
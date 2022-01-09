/**
 * Thoroughly checks if variable is an {} object. Arrays and null also
 * count as objects in JavaScript, so we need to first check that variable
 * is an object and then check that it is neither an array nor null.
 * @param {*} variable 
 * @returns {boolean} true if variable is an object, false otherwise
 */
function isObject(variable) {
    return (
        typeof variable === 'object'
        && !Array.isArray(variable)
        && variable !== null
    );
}

function isEmptyObject(variable) {
    return (
        isObject(variable)
        && Object.keys(variable).length === 0
        && Object.getPrototypeOf(variable) === Object.prototype
    );
}
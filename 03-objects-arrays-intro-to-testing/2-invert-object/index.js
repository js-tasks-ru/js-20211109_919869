/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    let result = {}

    if (obj === undefined) return; 
    
    for (const [key, value] of Object.entries(obj)) {
        result[value] = key;
    }

    return result;
}

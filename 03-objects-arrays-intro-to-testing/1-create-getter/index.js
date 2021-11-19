/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const keys = path.split('.').reverse();

    return function (obj) {
        let result = null;

        if (keys.length > 0) {
            result = getKeyValue(keys, obj);
        }

        return result;
    }

    function getKeyValue(keys, obj) {
        const currKey = keys.pop();

        if (obj === undefined) {
            return;
        } else if (currKey === undefined) {
            return obj;
        } else {
            for (const [key, value] of Object.entries(obj)) {
                if (currKey === key) {
                    return getKeyValue(keys, value);
                }
            }
        }
    }
}

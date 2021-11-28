/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const pathArray = path.split('.');

    return (obj) => {
        return getKeyValue(0, obj);
    }

    function getKeyValue(index = 0, result) {
        if (index === pathArray.length || result === undefined) {
            return result;
        } else {
            return getKeyValue(index + 1, result[pathArray[index]]);
        }
    }
}

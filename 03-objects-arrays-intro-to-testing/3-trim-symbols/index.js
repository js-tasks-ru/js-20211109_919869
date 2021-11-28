/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    let count = 0;

    if (string === undefined || size === undefined) {
        return string;
    }

    return string.split("").reduce(function(result, currentValue, index, array) {
        if (result[result.length - 1] === currentValue) {
            count++;
        } else {
            count = 0;
        }

        if (count < size) {
            result = result.concat(currentValue);
        }

        return result;
    }, "");
}

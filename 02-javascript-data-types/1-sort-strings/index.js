/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const decisions = {
        asc: 1,
        desc: -1
    };

    const decision = decisions[param];

    const sorted = [...arr];
    sorted.sort(function(a, b) {
        return decision * a.localeCompare(b, ['ru', 'en'], { caseFirst : 'upper' });
    });

    return sorted;
};

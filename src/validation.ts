export const formularyValidator = (
    data: any
): data is Formulary => {

    if (!data) return false;
    // data exists

    if (data instanceof Array !== true) return false;
    // data is an array

    for (let i = 0; i < data.length; i++) {
        if (typeof data[i] !== 'string') {
            return false;
        }
    }
    // data is an array of strings

    return true;
};

export const inventoryValidator = (
    form: Formulary,
) => (
    data: any,
): data is Inventory => {

    if (!data) return false;
    // data exists

    if (data instanceof Array !== true) return false;
    // data is an array

    for (let i = 0; i < data.length; i++) {

        const {
            name,
            pack_size: size,
            strength: str,
            total_packs: total,
        } = data[i];

        if (!name  || typeof name  !== 'string') return false;
        if (!size  || typeof size  !== 'number') return false;
        if (!str   || typeof str   !== 'number') return false;
        if (!total || typeof total !== 'number') return false;

        if ( !form.includes(name) ) return false;

        if (
            !validPositiveWholeNumber(size)
            || !validPositiveWholeNumber(str)
            || !validPositiveWholeNumber(total)
        ) {
            return false;
        }

    }
    // data is an array of valid inventory objects

    return true;

};

export const validPositiveWholeNumber = (
    user_input: string | number,
) => {
    const input = String(user_input);
    const blacklistRegex = /[^0-9]/;
    const matches = input.trim().match(blacklistRegex);
    if (matches) return false;

    const num = parseInt(input.trim(), 10);
    if (num < 1) return false;

    return true;
};

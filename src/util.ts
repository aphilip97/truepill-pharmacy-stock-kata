export const capitalize = (input: string) => {
    const lowercasedStr = input.toLowerCase();
    const words = lowercasedStr.split(' ');
    const capitalizedWords = words.map((word) => {
        return `${
            word.charAt(0).toUpperCase()
        }${
            word.slice(1)
        }`;
    });
    return capitalizedWords.join(' ');
};

export const sleep = (
    ms: number,
) => new Promise((res) => {
    setTimeout(res, ms);
});

export const clear = () => process.stdout.write('\u001Bc');

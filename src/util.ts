import ansiEscapes from 'ansi-escapes';

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

export const clear = () => {
    process.stdout.write(ansiEscapes.clearTerminal);
};

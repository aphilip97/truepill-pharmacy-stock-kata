import ansiEscapes from 'ansi-escapes';
import inquirer from 'inquirer';

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

export const confirm = async (
    msg: string,
    yay?: () => Promise<void> | void,
    nay?: () => Promise<void> | void,
) => {

    const confirmation = await inquirer.prompt<{
        confirmed: boolean;
    }>({
        type: 'confirm',
        name: 'confirmed',
        message: msg,
    });

    if (confirmation['confirmed'] === true) {
        yay ? await yay() : null;
    } else {
        nay ? await nay() : null;
    }

};

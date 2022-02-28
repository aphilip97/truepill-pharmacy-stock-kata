import fs from 'fs';
import fsprom from 'fs/promises';

const loadFile = async (filename: string) => {
    const contents = await fsprom.readFile(
        `./${filename}`, 'utf8'
    );
    try {
        return JSON.parse(contents);
    } catch (error) {
        const err = new Error(
            `Malformed JSON in './${filename}' file.`,
        );
        throw err;
    }
}

export const loadData = async <T>(
    filepath: string,
    validator: (data: any) => boolean
) => {

    if (fs.existsSync(filepath)) {

        const data = await loadFile(filepath);

        const valid = validator(data);

        if (!valid) {
            const error = new Error(
                `Invalid '${filepath}' file.`,
            );

            throw error;
        }

        return data as T[];

    } else {

        console.log(
            `'${filepath}' file does not exist. Creating...`
        );

        await fsprom.writeFile(
            `${filepath}`,
            JSON.stringify([], null, 2),
        );

        return [] as T[];

    }

};

export const writeData = (
    path: string,
    data: Formulary | Inventory,
) => fsprom.writeFile(
    path,
    JSON.stringify(data, null, 2),
);

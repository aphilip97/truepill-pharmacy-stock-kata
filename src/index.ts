import fs from 'fs';
import fsprom from 'fs/promises';
import inquirer from 'inquirer';

import {
    capitalize as cap,
    clear,
} from './util.js';

type InventoryItem = {
    name: string;
    strength: number;
    pack_size: number;
    total_packs: number;
};

type ActionLoopControl = {
    action_running: boolean;
};

type Formulary = string[];
type Inventory = InventoryItem[];

let running = true;

const printFormulary = (
    form: Formulary,
    showHeading = true,
) => {

    const heading = 'Formulary';
    let col_width = heading.length;
    const padding = 2;

    // Set column width to length of longest name
    for (let i = 0; i < form.length; i++) {
        if (form[i].length > col_width) {
            col_width = form[i].length;
        }
    }

    // Pad column
    col_width += padding;

    const line = `+${'-'.repeat(col_width)}+`;
    const emptyRow = `| ${
        '(empty)'.padEnd(col_width - padding)
    } |`;

    const content = form.map((med) => {
        return `| ${med.padEnd(col_width - padding)} |`;
    });

    console.log(
        `${
            showHeading ? `\n${line}\n${
                `| ${heading.padEnd(col_width - padding)} |`
            }` : ''
        }${
            `\n${
                line
            }\n${
                content.length > 0
                ? content.join('\n')
                : emptyRow
            }\n${
                line
            }\n`
        }`,
    );

};

const printInventory = (inv: Inventory) => {

    // index column width temp
    const col1Heading = 'Name';
    const col2Heading = 'Strength (mg)';
    const col3Heading = 'Pack Size';
    const col4Heading = 'Total Packs';

    const padding = 2;

    let col1 = col1Heading.length;
    let col2 = col2Heading.length;
    let col3 = col3Heading.length;
    let col4 = col4Heading.length;

    for (let i = 0; i < inv.length; i++) {

        const nameLength = inv[i].name.length;
        if (nameLength > col1) col1 = nameLength;

        const strLength = String(inv[i].strength).length;
        if (strLength > col2) col2 = strLength;

        const sizeLength = String(inv[i].pack_size).length;
        if (sizeLength > col3) col3 = sizeLength;

        const totPackLength = String(inv[i].total_packs).length;
        if (totPackLength > col4) col4 = totPackLength;

    }

    const empty = '(empty)';

    if (empty.length > col1) col1 = empty.length;
    if (empty.length > col2) col2 = empty.length;
    if (empty.length > col3) col3 = empty.length;
    if (empty.length > col4) col4 = empty.length;

    const emptyRow = `| ${
        empty.padEnd(col1)
    } | ${
        empty.padStart(col2)
    } | ${
        empty.padStart(col3)
    } | ${
        empty.padStart(col4)
    } |`;

    // Repeat alias
    const r = (num: number, str = '-') => str.repeat(num);

    // Column widths with one space padding on each side.
    const _1 = col1 + padding;
    const _2 = col2 + padding;
    const _3 = col3 + padding;
    const _4 = col4 + padding;

    const line = `+${r(_1)}+${r(_2)}+${r(_3)}+${r(_4)}+`;

    const content = inv.map((med) => {

        const name   = String(med.name);
        const str    = String(med.strength);
        const pk_sz  = String(med.pack_size);
        const tot_pk = String(med.total_packs);

        return `| ${
            name.padEnd(col1)
        } | ${
            str.padStart(col2)
        } | ${
            pk_sz.padStart(col3)
        } | ${
            tot_pk.padStart(col4)
        } |`;

    });

    console.log(
        `\n${
            // Top line
            line
        }\n${
            // Column headers
            `| ${
                col1Heading.padEnd(col1)
            } | ${
                col2Heading.padStart(col2)
            } | ${
                col3Heading.padStart(col3)
            } | ${
                col4Heading.padStart(col4)
            } |`
        }\n${
            // Separator
            line
        }\n${
            content.length > 0
            ? content.join('\n')
            : emptyRow
        }\n${
            line
        }\n`
    );

};

const validPositiveWholeNumber = (
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

const confirm = async (
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

const formularyValidator = (data: any): data is Formulary => {

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

const inventoryValidator = (
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
        err.stack = undefined;
        throw err;
    }
}

const loadData = async <T>(
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
            error.stack = undefined;

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

const manageFormulary = (
    formulary: Formulary,
) => async (
    control: ActionLoopControl,
) => {

    const msgs = {
        initial: 'Enter medication name (or "q" to go back):',
        confirm: 'Add medications above into formulary?',
        quit: 'Continue adding medication?',
    };

    const errMsgs = {
        empty: 'Medication name cannot be empty.',
        nameRegex: 'Only letters, commas and spaces allowed.',
        numRegex: 'Only 1 positive whole number. E.g. 100',
        notFound: 'Only medication from formulary allowed.',
    };

    try {

        clear();

        const answers = await inquirer.prompt<{
            medication_name: 'q' | 'Q' | string;
        }>({
            type: 'input',
            name: 'medication_name',
            message: msgs['initial'],
            validate: (user_input: string) => {

                const input = user_input.trim();

                if (input.length === 0) {
                    return errMsgs['empty'];
                }

                /*
                    Match anything that is not a letter, comma
                    or space.
                */
                const blacklistRegex = /[^A-Za-z, ]+/;
                const matches = input.match(blacklistRegex);
                if (matches) return errMsgs['nameRegex'];

                /*
                    Match at least one letter otherwise the
                    input is empty.
                */
                const whitelistRegex = /[A-Za-z]+/;
                const matchLetter = input.match(whitelistRegex);
                if (!matchLetter) return errMsgs['empty'];

                const meds = input.split(',').map((med) => {
                    return cap(med.trim());
                });

                const filteredMeds = meds.filter(
                    med => med !== ''
                );

                const dupes = filteredMeds.filter((med) => {
                    return formulary.includes(med);
                });

                const dupesFound = dupes.length > 0;

                if (dupesFound) {
                    return `Found duplicate medication${
                        dupes.length > 1 ? 's' : ''
                    }:\n${
                        dupes.map(
                            dup => `   "${dup}"`
                        ).join('\n')
                    }`;
                }

                return true;

            },
        });

        const str = answers['medication_name'].trim();

        if (str === 'q' || str === 'Q') {
            control.action_running = false;
            return;
        }

        const meds = str.split(',').map(med => cap(med.trim()));
        const deduped = meds.filter(med => {
            return !formulary.includes(med); // Sanity check
        });

        printFormulary(deduped, false);

        await confirm(msgs['confirm'], async () => {
                formulary.push(...meds);
                await fsprom.writeFile(
                    './data/formulary.json',
                    JSON.stringify(formulary, null, 2),
                );
            },
        );

        await confirm(msgs['quit'], void 0, () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }
}

const reportFormulary = (
    formulary: Formulary,
) => async (
    control: ActionLoopControl,
) => {

    try {

        clear();
        printFormulary(formulary);

        await confirm('Go Back?', () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }

};

const manageInventory = (
    formulary: Formulary,
    inventory: Inventory,
) => async (
    control: ActionLoopControl,
) => {

    const msgs = {
        initial: (
            'Enter medication pack details (or "q" to go back):'
        ),
        name: 'Name:',
        strength: 'Strength:',
        pack_size: 'Pack size:',
        total_packs: 'Number of packs:',
        confirm: 'Add above medication pack into inventory?',
        quit: 'Continue adding medication packs?',
    };

    const errMsgs = {
        empty: 'Medication name cannot be empty.',
        medNameRegex: 'Only letters allowed. E.g. Paracetamol',
        notFound: 'Only medication from formulary allowed.',
        numErrMsg: [
            'Only 1 positive whole number greater than 0.',
            'E.g. 100, 25, 1, 999 etc.',
        ].join(' '),
    };

    type Props = keyof Omit<InventoryItem, 'name'>;

    const validateNumber = (input: string) => {
        const valid = validPositiveWholeNumber(input);
        if (!valid) return errMsgs['numErrMsg'];
        return true;
    };

    try {

        clear();
        console.log(msgs['initial']);

        const nameQuit = await inquirer.prompt<{
            name: 'q' | 'Q' | string;
        }>({
            type: 'input',
            name: 'name',
            message: msgs['name'],
            validate: (user_input: string) => {

                const input = user_input.trim();

                if (input.length === 0) {
                    return errMsgs['empty'];
                }

                // Match anything that is not a letter
                const blacklistRegex = /[^A-Za-z]/;
                const matches = input.match(blacklistRegex);

                if (matches) {
                    return errMsgs['medNameRegex'];
                }

                if (input === 'q' || input === 'Q') {
                    return true;
                }

                if (!formulary.includes(cap(input))) {
                    return errMsgs['notFound'];
                }

                return true;

            },
        });

        if (nameQuit.name === 'q' || nameQuit.name === 'Q') {
            control.action_running = false;
            return;
        }

        const pack = await inquirer.prompt<{
            [P in keyof InventoryItem]: string;
        }>([
            {
                type: 'input',
                name: 'strength',
                message: msgs['strength'],
                validate: validateNumber,
            },
            {
                type: 'input',
                name: 'pack_size',
                message: msgs['pack_size'],
                validate: validateNumber,
            },
            {
                type: 'input',
                name: 'total_packs',
                message: msgs['total_packs'],
                validate: validateNumber,
            },
        ], { name: nameQuit.name });

        pack.name = cap(pack.name.trim());

        const newItem: InventoryItem = {
            name: pack.name,
            strength: parseInt(pack.strength),
            pack_size: parseInt(pack.pack_size),
            total_packs: parseInt(pack.total_packs),
        };

        printInventory([newItem]);

        await confirm(msgs['confirm'], async () => {

            const itemIndex = inventory.findIndex((item) => {
                return (
                       item.name      === newItem.name
                    && item.strength  === newItem.strength
                    && item.pack_size === newItem.pack_size
                );
            });

            if (itemIndex === -1) {
                inventory.push(newItem);
            } else {
                inventory[
                    itemIndex
                ].total_packs += newItem.total_packs;
            }

            await fsprom.writeFile(
                './data/inventory.json',
                JSON.stringify(inventory, null, 2),
            );

        });

        await confirm(msgs['quit'], undefined, () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }

}

const reportInventory = (
    inventory: Inventory,
) => async (
    control: ActionLoopControl,
) => {

    try {

        clear();
        printInventory(inventory);

        await confirm('Go Back?', () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }

};

const quit = (
) => async (
    control: ActionLoopControl,
) => {
    running = false
    control.action_running = false;
    return;
};

const main = async (
    formulary: Formulary,
    inventory: Inventory,
) => {

    const actions: Record<
        string,
        (control: ActionLoopControl) => Promise<void>
    > = {
        'Add Medication To Formulary': manageFormulary(
            formulary,
        ),
        'Generate Formulary Report': reportFormulary(
            formulary,
        ),
        'Add Medication To Inventory': manageInventory(
            formulary,
            inventory,
        ),
        'Generate Inventory Report': reportInventory(
            inventory,
        ),
        'Quit': quit(),
    };

    try {

        const answers = await inquirer.prompt<{
            action_choice: string;
        }>([{
            type: 'list',
            name: 'action_choice',
            message: 'What would you like to do?',
            choices: Object.keys(actions),
        }]);

        const control: ActionLoopControl = {
            action_running: true
        };

        while (control.action_running) {
            await actions[
                answers['action_choice']
            ](control);
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}

(async function () {

    try {

        const formulary = await loadData<Formulary[0]>(
            'data/formulary.json',
            formularyValidator,
        ) as Formulary;

        const inventory = await loadData<Inventory[0]>(
            'data/inventory.json',
            inventoryValidator(formulary),
        ) as Inventory;

        while (running) {
            clear();
            await main(formulary, inventory);
        }

    } catch (error) {
        console.error(error);
        process.exit(1);
    }

})();

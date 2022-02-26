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

const printInventory = (inv: Inventory) => {

    // index column width temp
    let iw_temp = 0;

    for (let i = 0; i < inv.length; i++) {
        if (inv[i].name.length > iw_temp) {
            iw_temp = inv[i].name.length;
        }
    }

    // Repeat alias
    const r = (num: number) => '-'.repeat(num);

    const col1 = 'Strength (mg)';
    const col2 = 'Pack Size';
    const col3 = 'Total Packs';

    // Column widths with one space padding on each side.
    const iw = iw_temp     + 2;
    const _1 = col1.length + 2;
    const _2 = col2.length + 2;
    const _3 = col3.length + 2;

    const line = `+${r(iw)}+${r(_1)}+${r(_2)}+${r(_3)}+`;

    const content = inv.map((med) => {

        const name =   String(med.name);
        const str =    String(med.strength);
        const pk_sz =  String(med.pack_size);
        const tot_pk = String(med.total_packs);

        return `| ${
            name.padEnd(iw - 2)
        } | ${
            str.padStart(col1.length)
        } | ${
            pk_sz.padStart(col2.length)
        } | ${
            tot_pk.padStart(col3.length)
        } |`;

    });

    console.log(
        `\n${
            // Top line
            line
        }\n${
            // Column headers
            `|${' '.repeat(iw)}| ${col1} | ${col2} | ${col3} |`
        }\n${
            // Separator
            line
        }\n${
            content.join('\n')
        }\n${
            line
        }\n`
    );

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

const inventoryValidator = (data: any): data is Inventory => {

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

    }
    // data is an array of inventory objects

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

        fsprom.writeFile(
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
        confirm: 'Add medications below into formulary?',
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

        const confirmation = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: `${msgs['confirm']}\n${
                deduped.map(med => `  "${med}"`).join('\n')
            }\n `
        });

        if (confirmation['confirmed'] === true) {
            formulary.push(...meds);
            await fsprom.writeFile(
                './data/formulary.json',
                JSON.stringify(formulary, null, 2),
            );
        }

        const quit = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: msgs['quit'],
        });

        if (quit['confirmed'] === false) {
            control.action_running = false;
        }

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
        console.table(formulary);

        const quit = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: 'Go Back?',
        });

        if (quit['confirmed'] === true) {
            control.action_running = false;
        }

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
        numErrMsg: 'Only 1 positive whole number. E.g. 100',
    };

    type Props = keyof Omit<InventoryItem, 'name'>;

    const validateNumber = (
        prop: Props,
    ) => (
        user_input: string,
    ) => {
        const blacklistRegex = /[^0-9]/;
        const matches = user_input.trim().match(blacklistRegex);
        if (matches) return errMsgs['numErrMsg'];

        const input = parseInt(user_input.trim(), 10);
        if (input < 1) return errMsgs['numErrMsg'];

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
                validate: validateNumber('strength'),
            },
            {
                type: 'input',
                name: 'pack_size',
                message: msgs['pack_size'],
                validate: validateNumber('pack_size'),
            },
            {
                type: 'input',
                name: 'total_packs',
                message: msgs['total_packs'],
                validate: validateNumber('total_packs'),
            },
        ], { name: nameQuit.name });

        pack.name = cap(pack.name.trim());

        const newItem: InventoryItem = {
            name: pack.name,
            strength: parseInt(pack.strength),
            pack_size: parseInt(pack.pack_size),
            total_packs: parseInt(pack.total_packs),
        };

        const displayItem = {
            [newItem.name]: {
                'Strength (mg)': newItem.strength,
                'Pack size': newItem.pack_size,
                'Number of packs': newItem.total_packs,
            },
        };

        console.log('\n');
        console.table(displayItem);
        console.log('\n');

        const confirmation = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: msgs['confirm'],
        });

        if (confirmation['confirmed'] === true) {

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

            console.log(inventory);
            await new Promise((res) => setTimeout(res, 2000));

            await fsprom.writeFile(
                './data/inventory.json',
                JSON.stringify(inventory, null, 2),
            );

        }

        const quit = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: msgs['quit'],
        });

        if (quit['confirmed'] === false) {
            control.action_running = false;
        }

    } catch (error) {
        throw error;
    }

}

const reportInventory = (
    inventory: Inventory,
) => async (
    control: ActionLoopControl,
) => {

    type DisplayItem = {
        // name?: string;
        'Strength (mg)': number;
        'Pack Size': number;
        'Total Packs': number;
    };

    type InventoryDict = Record<string, DisplayItem>;

    const data: InventoryDict = inventory.reduce((agg, med) => {

        agg[med.name] = {
            'Strength (mg)': med.strength,
            'Pack Size': med.pack_size,
            'Total Packs': med.total_packs,
        };

        return agg;

    }, {} as InventoryDict);

    try {

        clear();

        // console.table(data);
        printInventory(inventory);

        const quit = await inquirer.prompt<{
            confirmed: boolean;
        }>({
            type: 'confirm',
            name: 'confirmed',
            message: 'Go Back?',
        });

        if (quit['confirmed'] === true) {
            control.action_running = false;
        }

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
            inventoryValidator,
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

import fs from 'fs';
import fsprom from 'fs/promises';
import inquirer from 'inquirer';

import {
    capitalize as cap,
    clear,
    sleep,
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
    filename: string,
    validator: (data: any) => boolean
) => {

    if (fs.existsSync(`./${filename}`)) {

        const data = await loadFile(filename);

        const valid = validator(data);

        if (!valid) {
            const error = new Error(
                `Invalid './${filename}' file.`,
            );
            error.stack = undefined;

            throw error;
        }

        return data as T[];

    } else {

        console.log(
            `'${filename}' file does not exist. Creating...`
        );

        fsprom.writeFile(`./${filename}`, JSON.stringify([]));

        return [] as T[];

    }

};

const manageFormulary = async (
    formulary: Formulary,
) => async (
    control: ActionLoopControl,
) => {

    const msgs = {
        initial: 'Please enter the name of the medication:',
        confirm: [
            'Are you sure you want to add the medications ',
            'below into the formulary?',
        ].join(''),
        quit: 'Continue adding medication?',
    };

    try {

        clear();

        const answers = await inquirer.prompt<{
            medication_name: string;
        }>({
            type: 'input',
            name: 'medication_name',
            message: msgs['initial'],
            validate: (user_input: string) => {

                const input = user_input.trim();
                const emptyInputErrMsg = (
                    'Medication name cannot be empty.'
                );

                if (input.length === 0) {
                    return emptyInputErrMsg;
                }

                /*
                    Match anything that is not a letter, comma
                    or space.
                */
                const blacklistRegex = /[^A-Za-z, ]+/;
                const matches = input.match(blacklistRegex);
                const err_msg = (
                    'Only letters, commas and spaces allowed.'
                );

                if (matches) {
                    return err_msg;
                }

                /*
                    Match at least one letter otherwise the
                    input is empty.
                */
                const whitelistRegex = /[A-Za-z]+/;
                const matchLetter = input.match(whitelistRegex);
                if (!matchLetter) {
                    return emptyInputErrMsg;
                }

                // Transform the input in the same way 
                const meds = input.split(',').map((med) => {
                    return cap(med.trim());
                });

                const dups = meds.filter((med) => {
                    return formulary.includes(med);
                });

                const dupsFound = dups.length > 0;

                if (dupsFound) {
                    return `Found duplicate medication${
                        dups.length > 1 ? 's' : ''
                    }:\n${
                        dups.map(
                            dup => `   "${dup}"`
                        ).join('\n')
                    }`;
                }

                return true;

            },
        });

        const str = answers['medication_name'].trim();
        const meds = str.split(',').map(med => cap(med.trim()));
        // Sanity check
        const deduped = meds.filter(med => {
            return !formulary.includes(med);
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
                './formulary.json',
                JSON.stringify(formulary)
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

const reportFormulary = async (
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

const manageInventory = async (
    inventory: Inventory,
) => async (
    control: ActionLoopControl,
) => {
    control.action_running = false;
    return;
}

const reportInventory = async (
    inventory: Inventory,
) => async (
    control: ActionLoopControl,
) => {
    control.action_running = false;
};

const quit = async (
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
        'Add Medication To Formulary': await manageFormulary(
            formulary,
        ),
        'Generate Formulary Report': await reportFormulary(
            formulary,
        ),
        'Add Medication To Inventory': await manageInventory(
            inventory,
        ),
        'Generate Inventory Report': await reportInventory(
            inventory,
        ),
        'Quit': await quit(),
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
            'formulary.json',
            formularyValidator,
        ) as Formulary;

        const inventory = await loadData<Inventory[0]>(
            'inventory.json',
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

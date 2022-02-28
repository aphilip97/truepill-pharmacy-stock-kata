import inquirer from 'inquirer';

import {
    writeData,
} from '../loading.js';

import {
    validPositiveWholeNumber,
} from '../validation.js';

import {
    printInventory,
} from '../logging.js';

import {
    confirm,
    clear,
    capitalize as cap,
} from '../util.js';

export const manageInventory = (
    formulary: Formulary,
    inventory: Inventory,
) => async (
    control: LoopControl,
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
                const item = inventory[itemIndex];
                if (!item) return;
                item.total_packs += newItem.total_packs;
            }

            await writeData(
                './data/inventory.json',
                inventory,
            );

        });

        await confirm(msgs['quit'], undefined, () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }

};

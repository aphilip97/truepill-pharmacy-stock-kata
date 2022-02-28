import inquirer from 'inquirer';

import {
    writeData,
} from '../loading.js';

import {
    printFormulary,
} from '../logging.js';

import {
    confirm,
    clear,
    capitalize as cap,
} from '../util.js';

export const manageFormulary = (
    formulary: Formulary,
) => async (
    control: LoopControl,
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
                await writeData(
                    './data/formulary.json',
                    formulary,
                );
            },
        );

        await confirm(msgs['quit'], void 0, () => {
            control.action_running = false;
        });

    } catch (error) {
        throw error;
    }
};
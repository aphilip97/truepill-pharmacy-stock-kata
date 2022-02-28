import {
    printFormulary,
} from '../logging.js';

import {
    clear,
    confirm,
} from '../util.js';

export const reportFormulary = (
    formulary: Formulary,
) => async (
    control: LoopControl,
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

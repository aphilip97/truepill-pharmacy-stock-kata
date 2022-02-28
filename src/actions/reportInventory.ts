import {
    printInventory,
} from '../logging.js';

import {
    clear,
    confirm,
} from '../util.js';

export const reportInventory = (
    inventory: Inventory,
) => async (
    control: LoopControl,
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

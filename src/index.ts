import inquirer from 'inquirer';

import {
    loadData,
} from './loading.js';

import {
    formularyValidator,
    inventoryValidator,
} from './validation.js';

import { manageFormulary } from './actions/manageFormulary.js';
import { reportFormulary } from './actions/reportFormulary.js';
import { manageInventory } from './actions/manageInventory.js';
import { reportInventory } from './actions/reportInventory.js';
import { quit } from './actions/quit.js';

import {
    clear,
} from './util.js';

const main = async (
    formulary: Formulary,
    inventory: Inventory,
    control: LoopControl,
) => {

    type Actions = (
        'Add Medication To Formulary'
        | 'Generate Formulary Report'
        | 'Add Medication To Inventory'
        | 'Generate Inventory Report'
        | 'Quit'
    );

    const actions: Record<
        Actions,
        (control: LoopControl) => Promise<void>
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
            action_choice: Actions;
        }>([{
            type: 'list',
            name: 'action_choice',
            message: 'What would you like to do?',
            choices: Object.keys(actions),
        }]);

        control.action_running = true;

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

        const control: LoopControl = {
            action_running: false,
            main_running: true,
        };

        while (control.main_running) {
            clear();
            await main(formulary, inventory, control);
        }

    } catch (error) {
        console.error(error);
        process.exit(1);
    }

})();

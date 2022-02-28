export const quit = (
) => async (
    control: LoopControl,
) => {
    control.main_running = false
    control.action_running = false;
    return;
};

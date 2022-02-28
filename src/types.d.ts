type InventoryItem = {
    name: string;
    strength: number;
    pack_size: number;
    total_packs: number;
};

type Inventory = InventoryItem[];

type Formulary = string[];

type LoopControl = {
    action_running: boolean;
    main_running: boolean;
};

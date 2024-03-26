Hooks.once("loadoutsReady", function () { 
    
    game.settings.register("loadouts", "loadouts-5e-show-quantity-bar", {
        name: "Show Quantity Bar",
        hint: "For items with a quantity value, display quantity content using the health bar",
        scope: "world",
        config: true,
        default: 50,
        choices: {
            0: "Never Displayed", 
            10: "When Controlled", 
            20: "Hovered By Owner", 
            30: "Hovered By Anyone", 
            40: "Always For Owner", 
            50: "Always For Everyone"
        },
        type: Number
    });

    game.settings.register("loadouts", "loadouts-cpr-equipped-overlay", {
        name: "Equipped Item Overlay",
        hint: "Set a custom overlay for Equipped inventory items",
        scope: "world",
        config: true,
        default: "modules/loadouts-cpr/artwork/overlays/equipped-overlay.webp",
        type: String
    });

    game.settings.register("loadouts", "loadouts-cpr-carried-overlay", {
        name: "Carried Item Overlay",
        hint: "Set a custom overlay for Carried inventory items",
        scope: "world",
        config: true,
        default: "",
        type: String
    });

    game.settings.register("loadouts", "loadouts-cpr-owned-overlay", {
        name: "Owned Item Overlay",
        hint: "Set a custom overlay for Owned inventory items",
        scope: "world",
        config: true,
        default: "",
        type: String
    });
    
});

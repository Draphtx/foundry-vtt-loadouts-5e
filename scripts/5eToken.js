class DnD5eLoadoutsToken extends LoadoutsRegistry.tokenClasses.loadoutsToken {
    defineNewToken() {
        super.defineNewToken();  // This calls the defineToken method of LoadoutsToken
        console.log("Preparing 5e item")

        if(this.objectDocument.flags?.loadouts?.stack?.max > 1){
            this.itemTokenSettings.displayBars = game.settings.get("loadouts", "loadouts-show-stack-bar"), // Set visibility for the 'hp' bar
            this.itemTokenSettings.actor = {
                system: {
                    attributes: {
                        hp: {
                            max: this.objectDocument.flags.loadouts.stack.max,
                            value: this.objectDocument.flags.loadouts.stack.members.length
                        }
                    }
                }
            }
        } else {
            console.log("Item with internal quantity found")
            if(("quantity" in this.objectDocument.system) && (this.objectDocument.system.quantity != 0)){
                this.itemTokenSettings.displayBars = game.settings.get("loadouts", "loadouts-5e-show-quantity-bar"),
                this.itemTokenSettings.actor = {
                    system: {
                        attributes: {
                            hp: {
                                max: 10, // We don't really have a maximum value for this. Arbitrarily 10, for testing.
                                value: this.objectDocument.system.quantity.value
                            }
                        }
                    }
                }
            }
        };
    };
};

class DnD5eLoadoutsItem extends LoadoutsRegistry.tokenClasses.loadoutsItem {

    compareQuantities(previousQuantity, updatedQuantity){
        const difference =  updatedQuantity - previousQuantity;
        return {
            changeAmount: Math.abs(difference),
            changeType: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : None
        };
    };

    async processIncreasedQuantity(changeAmount) {
        console.log(`processing increase in quantity by ${changeAmount}`)
        for(let i = 0; i < changeAmount; i++) {
            console.log(`processing added item ${i}`)
            this.processNewItem(this.objectDocument, this.diff, this.userId);
        };
    };

    async processDecreasedQuantity(changeAmount) { 
        console.log(`processing decrease in quantity by ${changeAmount}`)
        for(let i = 0; i < changeAmount; i++) {
            console.log(`processing removed item ${i}`)
            this.processRemovedItem(this.objectDocument, this.diff, this.userId);
        };
    };

    async processNewItem(document, diff, userId) {
        await super.processNewItem(document, diff, userId);
    };

    async processRemovedItem(document, diff, userId) {
        await super.processRemovedItem(document, diff, userId)
    }

    processUpdatedItem() {
        super.processUpdatedItem();
        console.log("processing updated item")
        
        if(this.diff?.system?.quantity){
            console.log("Quantity change")
        };
        const { changeAmount, changeType } = this.compareQuantities(this.objectDocument.system.quantity, this.diff.system.quantity)

        if(changeType == 'increase') {
            this.processIncreasedQuantity(changeAmount);
        } else if(changeType == 'decrease') {
            this.processDecreasedQuantity(changeAmount);
        } else {
            console.log("Quantity does not appear to have changed")
            return;
        }
    };
};

function processUpdatedItem(document, diff, _, userId) {
    console.log("processing updated item")
    
    if(diff?.system?.quantity){
        console.log("Quantity change")
    };
    const { changeAmount, changeType } = compareQuantities(document.system.quantity, diff.system.quantity)

    if(changeType == 'increase') {
        processIncreasedQuantity(document, diff, userId, changeAmount);
    } else if(changeType == 'decrease') {
        processDecreasedQuantity(document, diff, userId, changeAmount);
    } else {
        console.log("Quantity does not appear to have changed")
        return;
    }
}

function compareQuantities(previousQuantity, updatedQuantity){
    const difference =  updatedQuantity - previousQuantity;
    return {
        changeAmount: Math.abs(difference),
        changeType: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : None
    };
};

async function processIncreasedQuantity(document, diff, userId, changeAmount) {
    console.log(`processing increase in quantity by ${changeAmount}`)
    for(let i = 0; i < changeAmount; i++) {
        console.log(`processing added item ${i}`)
        const loadoutsItem = new DnD5eLoadoutsItem(document, diff, userId);
        await loadoutsItem.processNewItem()
    };
};

async function processDecreasedQuantity(document, diff, userId, changeAmount) { 
    console.log(`processing decrease in quantity by ${changeAmount}`)
    for(let i = 0; i < changeAmount; i++) {
        console.log(`processing removed item ${i}`)
        const loadoutsItem = new DnD5eLoadoutsItem(document, diff, userId);
        await loadoutsItem.processRemovedItem()
    };
};

//Hooks.once('loadoutsReady', function() {
    window.LoadoutsRegistry.registerTokenClass("dnd-5e", DnD5eLoadoutsToken);
    window.LoadoutsRegistry.registerTokenClass("dnd-5e", DnD5eLoadoutsItem);
    console.log("%c▞▖Loadouts 5e: loaded D&D 5e Loadouts module", 'color:#ff4bff')
//});

Hooks.on("preUpdateItem", function(document, diff, _, userId) {
    console.log("preUpdate detected")
    console.log(diff);
    processUpdatedItem(document, diff, _, userId);
    Hooks.off("preUpdateItem")
});

Hooks.on("deleteItem", function(document, _, userId){
    console.log(`item ${document._id} is being hard-deleted`)
    processDecreasedQuantity(document, _, userId, document.system.quantity)
    Hooks.off("deleteItem")
});

///canvas.tokens.controlled[0].actor.update({system: {attributes: {hp: {value: 2, max:20}}}})
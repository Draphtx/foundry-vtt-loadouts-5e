class DnD5eLoadoutsToken extends LoadoutsRegistry.tokenClasses.loadoutsToken {
    defineNewToken() {
        super.defineNewToken();  // This calls the defineToken method of LoadoutsToken
        console.log("Preparing 5e item")

        if(this.objectDocument.flags?.loadouts?.stack?.max > 1){
            this.itemTokenSettings.displayBars = game.settings.get("loadouts", "loadouts-5e-show-quantity-bar"),
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

    updateStack() {
        console.log("Lets update a stack!")
        console.log(this.loadoutsStack)
        super.updateStack();
        const updateData = {
            name: `${this.loadoutsStack.flags.loadouts.truename} (x${this.membershipIds.length})`,
            displayName: game.settings.get("loadouts", "loadouts-show-nameplates"),
            displayBars: game.settings.get("loadouts", "loadouts-5e-show-quantity-bar"),
            flags: {
                loadouts: {
                    stack: {
                        members: this.membershipIds
                    }
                }
            }
        };
    
        if (this.membershipIds.length > 1) {
            updateData.overlayEffect = game.settings.get("loadouts", "loadouts-stack-overlay");
        };
        
        try {
            this.loadoutsStack.update(updateData);
            this.loadoutsStack.actor.update({
                system: {
                    attributes: {
                        hp: {
                            max: this.objectDocument.flags.loadouts.stack.max, 
                            value: this.membershipIds.length 
                        }
                    }
                }
            });
            ui.notifications.info("Loadouts: " + this.objectDocument.parent.name + " added " + this.objectDocument.name + " to an existing stack in " + this.loadoutsTile.parent.name);
            return true;
        } catch (error) {
            console.warn(`Loadouts | unable to update stack ${this.loadoutsStack.id}`);
            console.error(`Loadouts | ${error}`);
            return false;
        };
    };

    removeLoadoutsItem() {
        super.removeLoadoutsItem()
        if (this.membersArray.length > 0) {
            this.removedItemToken.update({
                name: this.objectDocument.name + (this.membersArray.length > 1 ? ` (x${this.membersArray.length})` : ''),
                displayName: game.settings.get("loadouts", "loadouts-show-nameplates"),
                displayBars: game.settings.get("loadouts", "loadouts-5e-show-quantity-bar"),
                flags: {
                    loadouts: {
                        stack: {
                            members: this.membersArray}
                        }
                    },
                });
            this.removedItemToken.actor.update({
                system: {
                    attributes: {
                        hp: {
                            max: this.objectDocument.flags.loadouts.stack.max, 
                            value: this.membersArray.length 
                        }
                    }
                }
            });
            ui.notifications.info(`Loadouts: ${this.objectDocument.parent.name} removed '${this.objectDocument.name}' from a stack in '${this.removedItemToken.parent.name}'`);
            if(this.membersArray.length == 1) {
                this.removedItemToken.update({
                    displayBars: 0,
                    overlayEffect: "",
                    name: this.objectDocument.name,
                })
            };
        } else {
            const loadoutsToken = new DnD5eLoadoutsToken(this.removedItemToken);
            loadoutsToken.removeLoadoutsToken();
        };
    }
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
    console.log("%c❦Loadouts 5e: loaded D&D 5e Loadouts module", 'color:#ff4bff')
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
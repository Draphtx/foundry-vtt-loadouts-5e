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

    processDecreasedQuantity(changeAmount) { 
        console.log(`processing decrease in quantity by ${changeAmount}`) 
    };

    async processNewItem(document, diff, userId) {
        await super.processNewItem(document, diff, userId);
    };

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

        



        // The above is working. Now we need to find the diff between the quantities and handle each change as a new event,
        // because someone could always manually increase the quantity from 3 -> 6, for instance. So basically we need to 
        // find out how many of the object have been added or subtracted and then execute a submethod to determine where to 
        // place those individual members.

        // Then, how do we work with the existing stacks logic to determine whether a new stack is needed?

        // Then we need to handle individual item removal from the stack

        // Then we need to handle removal of the parent item, such that its id is removed from all stacks and any empty stacks have their token removed

/*
        const loadoutsScenes = game.scenes.filter(
            scene => scene.flags.loadouts).filter(
                scene => scene.flags.loadouts.isLoadoutsScene == true);
        
        const loadoutsItemToken = undefined
        for(const loadoutsScene of loadoutsScenes){
            loadoutsItemToken = game.scenes.get(loadoutsScene.id).tokens.contents.find(token => 
                token.flags.loadouts?.stack?.members?.includes(objectDocument.id))
            if(loadoutsItemToken){
                break;
            };
        };

        if((loadoutsItemToken == null) || (loadoutsItemToken == undefined)){
            console.warn("▞▖Loadouts 5e: Loadouts item not found; cannot reflect " + objectDocument.parent.name + "'s inventory change")
            return;
        };
    
        if(objectDocument.system.quantity >= 1){
            console.log("Item with internal quantity found")
            loadoutsItemToken.actor.update({
                system: {
                    attributes: {
                        hp: {
                            max: objectDocument.flags.loadouts?.stack?.max || 10,
                            value: objectDocument.system.quantity.value
                        }
                    }
                }
            });
        };
*/    };
};

//Hooks.once('loadoutsReady', function() {
    window.LoadoutsRegistry.registerTokenClass("dnd-5e", DnD5eLoadoutsToken);
    window.LoadoutsRegistry.registerTokenClass("dnd-5e", DnD5eLoadoutsItem);
    console.log("%c▞▖Loadouts 5e: loaded D&D 5e Loadouts module", 'color:#ff4bff')
//});

Hooks.on("preUpdateItem", function(document, diff, _, userId) {
    console.log("preUpdate detected")
    const loadoutsItem = new DnD5eLoadoutsItem(document, diff, userId);
    loadoutsItem.processUpdatedItem();
    Hooks.off("preUpdateItem")
});

/*
Hooks.on("updateItem", function(document, diff, _, userId){
    console.log("5e item updated")
    const loadoutsItem = new DnD5eLoadoutsItem(document, diff, userId);
    loadoutsItem.processUpdatedItem();
    Hooks.off("updateItem");
});
*/
///canvas.tokens.controlled[0].actor.update({system: {attributes: {hp: {value: 2, max:20}}}})
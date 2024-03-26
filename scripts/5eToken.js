import { statusIconMap } from './constants.js';

class DnD5eLoadoutsToken extends LoadoutsRegistry.tokenClasses.default {
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

class DnD5eLoadoutsItem extends LoadoutsRegistry.itemClasses.default {
    processUpdatedItem() {
        super.processUpdatedItem();

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
    
        if(objectDocument.system.quantity > 1){
            console.log("Item with internal quantity found")
            loadoutsItemToken.update({
                actor: {
                    system: {
                        attributes: {
                            hp: {
                                value: objectDocument.system.quantity.value
                            }
                        }
                    }
                }
            });
        };
    };
};

Hooks.on('loadoutsReady', function() {
    window.LoadoutsRegistry.registerTokenClass("dnd-5e", DnD5eLoadoutsToken);
    window.LoadoutsRegistry.registerItemClass("dnd-5e", DnD5eLoadoutsItem);
    console.log("%c▞▖Loadouts 5e: loaded D&D 5e Loadouts module", 'color:#ff4bff')
});

///canvas.tokens.controlled[0].actor.update({system: {attributes: {hp: {value: 2, max:20}}}})
game.game.turn_cooldown = function() {
    let ts = Date.now();
    if (game.player.last_year_ts > ts) game.player.last_year_ts = ts;
    if (ts - game.player.last_year_ts < constants.TURN_COOLDOWN) return true;

    return false;
}

game.game.can_do_next_year = function() {
    // Cannot proceed if actions are blocked
    if (game.tech.actions_blocked) return false;
    if (game.player.stats.won) return false;

    // Check whether there are any resource deficits
    let resource_production = game.resource_production();
    let new_resources = {};
    for (let resource in game.data.resources) {
        new_resources[resource] = game.player.resources[resource];
        if (new_resources[resource] != constants.INFINITY) {
            new_resources[resource] += resource_production[resource].increase;
            new_resources[resource] -= resource_production[resource].decrease;
        }

        if (game.player.resources[resource] >= 0 && new_resources[resource] < 0) {
            // Also unlock prestige
            game.player.flags.unlocked_prestige = true;
            return false;
        }
        if (new_resources[resource] < 0 && new_resources[resource] != constants.INFINITY) {
            // Also unlock prestige
            game.player.flags.unlocked_prestige = true;
            return false;
        }
    }

    // Special attack/defense casing
    if (new_resources.detection >= new_resources.detection_max) { // An attack is going to happen...
        if (new_resources.attack == constants.INFINITY || new_resources.attack > new_resources.defense) { // ...and we are losing...
            // Also unlock prestige
            game.player.flags.unlocked_prestige = true;
            return false;
        }
    }

    return true;
}

game.game.process_attack = function() {
    game.player.add_resource("defense", -Math.ceil(game.player.resources.attack * game.elements.prestige_upgrades.get_effect("r41") / 100.0));
    game.player.add_resource("attacks_survived", 1);
    game.player.resources.detection = 0;

    // Increase detection max and attack power
    game.player.resources.detection_max = Math.ceil(game.player.resources.detection_max * game.prestige.detection_max_multiplier());
    game.player.resources.attack = Math.ceil(game.player.resources.attack ** game.prestige.attack_power_multiplier());
    if (game.player.resources.attack >= constants.INFINITE_ATTACK) game.player.resources.attack = constants.INFINITY;

    // Unlock prestige
    game.player.flags.unlocked_prestige = true;

    // Update stats
    game.player.stats.attacks_defeated += 1;
}

game.game.next_year = function() {
    if (game.game.turn_cooldown()) return;
    if (!game.game.can_do_next_year()) return;

    game.player.last_year_ts = Date.now();

    // Produce resources
    let resource_production = game.resource_production();
    for (let resource in game.data.resources) {
        game.player.add_resource(resource, resource_production[resource].increase);
        game.player.add_resource(resource, -resource_production[resource].decrease);
    }

    // Resolve building effects
    let priority_buildings = ["exile", "human_sacrifice"];
    let buildings_processed = {};
    for (let building_id of priority_buildings) {
        if ("effect" in game.data.buildings[building_id]) {
            game.data.buildings[building_id].effect(game.elements.buildings.get_staff(building_id));
            buildings_processed[building_id] = true;
        }
    }
    for (let building_id in game.data.buildings) {
        if (building_id in buildings_processed) continue;
        if ("effect" in game.data.buildings[building_id]) {
            game.data.buildings[building_id].effect(game.elements.buildings.get_staff(building_id));
        }
    }

    // Resolve building progress
    for (let building_id in game.data.buildings) {
        if ("progress" in game.data.buildings[building_id]) {
            game.player.buildings[building_id].progress += game.data.buildings[building_id].progress.growth(game.elements.buildings.get_staff(building_id));
            if ("after_growth" in game.data.buildings[building_id].progress) game.data.buildings[building_id].progress.after_growth(game.elements.buildings.get_staff(building_id));
            if (game.player.buildings[building_id].progress >= helpers.resolve(game.data.buildings[building_id].progress.max)) {
                if (helpers.get(game.data.buildings[building_id].progress, "reset", false)) {
                    if ("fill_effect" in game.data.buildings[building_id].progress) game.data.buildings[building_id].progress.fill_effect(1);
                    game.player.buildings[building_id].progress = 0;
                }
                else {
                    if ("fill_effect" in game.data.buildings[building_id].progress) game.data.buildings[building_id].progress.fill_effect(Math.round(game.player.buildings[building_id].progress / helpers.resolve(game.data.buildings[building_id].progress.max)));
                    game.player.buildings[building_id].progress = game.player.buildings[building_id].progress % helpers.resolve(game.data.buildings[building_id].progress.max);
                }
            }
        }
    }

    // Do some capitalism
    if (game.player.laws.economic == "capitalism") {
        for (let id in game.player.citizens) {
            if (game.elements.dice.is_unemployed(game.player.citizens[id])) {
                if (helpers.get(game.player.citizens[id].get_side().symbols, "money", 0) > 0 && helpers.get(game.player.citizens[id].get_side().symbols, "production", 0) == 0) {
                    game.player.citizens[id].add_symbol("production", 1);
                }
            }
        }
    }

    // Roll all dice and return them to Aether
    game.player.cleanup();
    for (let id in game.player.citizens) {
        game.player.citizens[id].location.place = "aether";
        game.player.citizens[id].roll();
    }

    // reroll_ones
    if (game.player.prestige_upgrades.reroll_ones.level > 0 && game.player.prestige_upgrades.reroll_ones.toggle) {
        for (let id in game.player.citizens) {
            if (game.player.citizens[id].rolled == 0) game.player.citizens[id].roll();
        }
    }

    game.player.init();

    // Resolve attacks
    if (game.player.resources.detection_max <= game.player.resources.detection) {
        game.game.process_attack();
    }

    // r33: gain defense each turn
    let passive_defense = game.elements.prestige_upgrades.get_effect("r33");
    game.player.add_resource("defense", Math.floor(passive_defense));
    if (helpers.percentile_roll(100 * (passive_defense - Math.floor(passive_defense)))) game.player.add_resource("defense", 1);

    // Check if it is time to show an event, and select an event to show
    let chance_of_no_event = 100;
    let possible_events = {};
    for (let event_id in game.data.events) {
        if (!("possible" in game.data.events[event_id]) || game.data.events[event_id].possible()) {
            let percentage_chance = helpers.resolve(game.data.events[event_id].percentage);
            chance_of_no_event *= (1 - percentage_chance / 100.0);
            possible_events[event_id] = percentage_chance;
        }
    }
    if (!helpers.percentile_roll(chance_of_no_event) && !(game.player.prestige_upgrades.aggressive_isolationism.level > 0 && game.player.prestige_upgrades.aggressive_isolationism.toggle)) {
        let selected_event = null;
        let has_guaranteed_events = false; // events with 100% chance to fire show up first
        for (let event_id in possible_events) {
            if (possible_events[event_id] >= 100) {
                selected_event = event_id;
                has_guaranteed_events = true;
            }
        }
        if (!has_guaranteed_events) {
            let total_weight = 0;
            for (let event_id in possible_events) total_weight += possible_events[event_id];
            total_weight *= Math.random();
            for (let event_id in possible_events) {
                total_weight -= possible_events[event_id];
                if (total_weight <= 0) {
                    selected_event = event_id;
                    break;
                }
            }
        }  

        if ("immediate" in game.data.events[selected_event]) game.data.events[selected_event].immediate();
        game.tech.open_event(selected_event);
    }

    // Populate researches
    game.elements.researches.populate();

    // Remove flags that go away on the end of the year
    for (let flag in game.player.temporary_flags) {
        if (flag.startsWith("one_turn_")) delete game.player.temporary_flags[flag];
    }

    game.player.stats.years_passed += 1;
    game.player.year += 1;
    game.render_loop();


    game.game.save();
    // Also save start-of-turn backup
    game.game.save("backup");
}
game.resource_production = function() {
    // Calculate total production of each resource on turn end
    let production = {};

    for (let resource in game.data.resources) {
        production[resource] = {"increase": 0, "decrease": 0};
    }

    // Unemployed citizen contribution and citizen upkeep
    for (let id in game.player.citizens) {
        production["wheat"].decrease += 1;
        if ("upkeep" in game.data.citizen_classes[game.player.citizens[id].class]) {
            for (let resource in game.data.citizen_classes[game.player.citizens[id].class].upkeep) {
                production[resource].decrease += game.data.citizen_classes[game.player.citizens[id].class].upkeep[resource];
            }
        }
        // Technologies:
        if (game.conditionals.get("research_self_sufficiency") && game.elements.dice.is_peasant(game.player.citizens[id])) production["wheat"].decrease -= 1;

        if (game.elements.dice.is_unemployed(game.player.citizens[id])) {
            // No production
            if (game.conditionals.get("one_turn_no_production")) continue;

            let die_side = game.player.citizens[id].get_side();
            for (let symbol in die_side.symbols) {
                production[symbol].increase += die_side.symbols[symbol];

                // Internet
                if (symbol == "science" && die_side.symbols[symbol] > 0 && game.conditionals.get("research_internet")) production[symbol].increase += Math.floor(die_side.symbols[symbol] ** 1.2) - die_side.symbols[symbol];

                // Double production
                if (game.conditionals.get("one_turn_double_production") && !helpers.get(game.data.resources[symbol], "negative", false)) {
                    production[symbol].increase += die_side.symbols[symbol];

                    // Internet
                    if (symbol == "science" && die_side.symbols[symbol] > 0 && game.conditionals.get("research_internet")) production[symbol].increase += Math.floor(die_side.symbols[symbol] ** 1.2) - die_side.symbols[symbol];
                }

                // Technologies:
                if (game.conditionals.get("research_persistence_hunting") && symbol == "wheat" && die_side.symbols[symbol] >= 3) production.wheat.increase += 1;
            }
        }

        // Special case: Prison with Community Service (not doing it in the building)
        if (game.player.citizens[id].location.place == "prison" && game.conditionals.get("research_community_service")) {
            let die_side = game.player.citizens[id].get_side();
            for (let symbol in die_side.symbols) {
                if (symbol == "detection") continue;
                production[symbol].increase += die_side.symbols[symbol];
            }
        }
    }

    // Buildings production
    for (let building_id in game.data.buildings) {
        if (!("production" in game.data.buildings[building_id])) continue;
        let building_production = game.data.buildings[building_id].production(game.elements.buildings.get_staff(building_id));
        for (let resource in building_production) {
            if (building_production[resource] > 0) production[resource].increase += building_production[resource];
            else production[resource].decrease -= building_production[resource];
        }
        // Caste System
        if (game.player.laws.social == "caste_system") {
            if (game.player.locations[building_id][0] != null && game.player.locations[building_id][1] != null && game.elements.dice.are_same_class(game.player.citizens[game.player.locations[building_id][0]], game.player.citizens[game.player.locations[building_id][1]])) {
                // Double!
                for (let resource in building_production) {
                    if (building_production[resource] > 0) production[resource].increase += building_production[resource];
                    else production[resource].decrease -= building_production[resource];
                }
            }
        }
    }

    // fill_production
    for (let building_id in game.data.buildings) {
        if (!("progress" in game.data.buildings[building_id])) continue;
        if (!("fill_production" in game.data.buildings[building_id].progress)) continue;
        let fill_production = game.data.buildings[building_id].progress.fill_production(game.elements.buildings.total_fills(building_id));
        for (let resource in fill_production) {
            if (fill_production[resource] > 0) production[resource].increase += fill_production[resource];
            else production[resource].decrease -= fill_production[resource];
        }
        // Caste System
        if (game.player.laws.social == "caste_system") {
            if (game.player.locations[building_id][0] != null && game.player.locations[building_id][1] != null && game.elements.dice.are_same_class(game.player.citizens[game.player.locations[building_id][0]], game.player.citizens[game.player.locations[building_id][1]])) {
                // Double!
                for (let resource in fill_production) {
                    if (fill_production[resource] > 0) production[resource].increase += fill_production[resource];
                    else production[resource].decrease -= fill_production[resource];
                }
            }
        }
    }

    // Flag-based production
    if (game.conditionals.get("vassal_of_an_empire")) production.detection.increase += 1;
    if (game.conditionals.get("satellite_launch_happened")) production.detection.increase += 1;

    // Aggressive Isolationism
    if (game.player.prestige_upgrades.aggressive_isolationism.level > 0 && game.player.prestige_upgrades.aggressive_isolationism.toggle) production.detection.increase += 1;

    // Stock Market
    if (game.player.prestige_upgrades.stock_market.level > 0) production.money.increase += Math.min(5, Math.floor(game.player.resources.money / 20.0));

    return production;
}
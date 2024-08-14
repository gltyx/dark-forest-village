game.elements.dice.accept_drop = function(die, location, index, recursive=true) {
    // If location is occupied, check if occupant can relocate
    if (recursive && game.player.locations[location][index] != null) {
        if (!game.elements.dice.accept_drop(game.player.citizens[game.player.locations[location][index]], die.location.place, die.location.id, false)) {
            return false;
        }
    }
    // If location is locked, return no
    if (location == "population" && index >= game.player.population_limit) return false;

    // ----------
    // BUILDINGS
    // ----------

    // Childbirth
    if (location == "childbirth") {
        if (game.player.locations[location][1 - index] != null) {
            if (game.conditionals.get("building_childbirth_needs_same_class")) {
                if (!game.elements.dice.are_same_class(game.player.citizens[game.player.locations[location][1 - index]], die)) return false;
            }
        }
    }
    // Training
    if (location == "training") {
        if (!game.elements.dice.is_peasant(die) && !(game.player.prestige_upgrades.retraining.level > 0 && die.class == "laborer")) return false;
    }
    // Lumberjack
    if (location == "lumberjack") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Wall
    if (location == "wall") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Academia
    if (location == "academia") {
        if (game.elements.dice.is_peasant(die)) return false;
    }
    // Farm
    if (location == "farm") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Stone Quarry
    if (location == "stone_quarry") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Foundry
    if (location == "foundry") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "stone", 0) == 0) return false;
    }
    // Mint
    if (location == "mint") {
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Mayor
    if (location == "mayor") {
        if (game.elements.dice.is_peasant(die)) return false;
        if (die.class == "laborer") return false;
        if (die.rolled != 5) return false;
    }
    // Bank
    if (location == "bank") {
        if (helpers.get(die.get_side().symbols, "money", 0) == 0) return false;
    }
    // Specialist Training
    if (location == "specialist_training") {
        if (die.class != "laborer" && die.class != "specialist") return false;
    }
    // Prison
    if (location == "prison") {
        if (helpers.get(die.get_side().symbols, "detection", 0) < 2) return false;
    }
    // Prime Minister
    if (location == "prime_minister") {
        if (game.elements.dice.is_peasant(die)) return false;
        if (die.class == "laborer") return false;
        if (helpers.get(die.get_side().symbols, "money", 0) == 0) return false;
    }
    // Advisor
    if (location == "advisor") {
        if (game.elements.dice.is_peasant(die)) return false;
        if (die.class == "laborer") return false;
        if (die.symbol_count() == 0) return false;
    }
    // Union Representative
    if (location == "union_representative") {
        if (die.class != "laborer") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Coal Powerplant
    if (location == "coal_powerplant") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Oil Derrick
    if (location == "oil_derrick") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Oil Refinery
    if (location == "oil_refinery") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) < 3) return false;
    }
    // Oil Powerplant
    if (location == "oil_powerplant") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Solar Panels
    if (location == "solar_panels") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Temple
    if (location == "temple") {
        if (game.elements.dice.is_peasant(die)) return false;
    }
    // Space Probes
    if (location == "space_probes") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "plastic", 0) == 0) return false;
    }
    // Construct Generational Ship
    if (location == "construct_generational_ship") {
        if (die.class != "specialist") return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
    }
    // Generational Ship
    if (location == "generational_ship") {
        if (helpers.get(die.get_side().symbols, "wheat", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "wood", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "stone", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "metal", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "plastic", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "production", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "electricity", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "science", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "money", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "bureaucracy", 0) == 0) return false;
        if (helpers.get(die.get_side().symbols, "hope", 0) == 0) return false;
    }


    return true;
}
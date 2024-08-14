// Inner variables:
// - name: the building name
// - desc: the building description for the village
// - help_desc: the detailed building description for the help page
// - possible: a function that returns whether a building should be visible, no condition by default
// - on_build: a function that is called when the building is constructed
// - build_cost: a function/a value of the building's build cost. Free if the array is empty
// - init: a function to be called during player_init, accepts a player object
// - slots:
// --- max: the maximum amount of dice slots
// --- current: a function returning how many slots are currently available
// - production: given the current building occupancy, returns production estimates; accepts staff as input
// - show_production: whether the production needs to be shown, defaults to true
// - effect: a function that processes any special effects on turn end; argument is a list of dice involved in the building.
// - progress: if exists, a building gets a progressbar
// --- max: max displayed progress
// --- growth: production based on current occupancy; accepts staff as input
// --- after_growth: an effect that is called after growth
// --- reset: if the progressbar resets after completion (cannot fill more than once per turn), default false
// --- fill_production: extra resource production if the bar fills
// --- fill_effect: a function that is called when the progressbar fills, should accept a number of complete fills
// - choice: if exists, a building gets a row of buttons to choose between modes. It is a dict, with the keys being choice options. Values are displayed option names
// - default_choice: the key of the default choice
// - choice_possible: a function that determines when the choice becomes available
// - support: if the building should show the support meter. Should be a function that accepts staff and returns support value (0-1)

game.data.buildings = {};

game.data.buildings.childbirth = {
    "name": "Raise a Child",
    "desc": "Send two citizens to get another one<span class='conditional' data-condition='building_childbirth_needs_same_class' data-conditional_class='no-display'><br>The citizens must be of the same class</span>",
    "help_desc": "This village job is the main way of growing your population. If it is staffed by two citizens, a new citizen die will be produced at the end of the year. The new citizen die will inherit 4 sides and the class from one of the parents, with the remaining 2 sides coming from the other two.<br>This building will do nothing if all population slots are already full.<br>Both parents must be of the same class, unless a law changes that.<br><i class='fa-solid fa-weight-hanging'></i> symbols are not inherited.",
    "slots": {
        "max": 2,
        "current": 2
    },
    "effect": function(staff) {
        if (staff[0] != null && staff[1] != null) {
            game.player.add_citizen(game.elements.dice.create(staff[0], staff[1]));
        }
    }
};

game.data.buildings.training = {
    "name": "Training",
    "desc": "<span class='class-peasant'>Peasants</span><span class='conditional' data-condition='has_retraining_prestige_upgrade' data-conditional_class='no-display'> or <span class='class-laborer'>Laborers</span></span> only<br>Convert to <span class='class-laborer conditional' data-condition='is_not_serfdom' data-conditional_class='no-display'>Laborer</span><span class='class-peasant conditional' data-condition='is_serfdom' data-conditional_class='no-display'>Peasant</span><br>Replace <i class='fa-solid fa-wheat-awn'></i> with <i class='fa-solid fa-hammer'></i><br>Add <i class='fa-solid fa-satellite-dish decrease'></i> to the 6 side",
    "help_desc": "This village job converts <span class='class-peasant'>Peasants</span> into <span class='class-laborer'>Laborers</span>. All <i class='fa-solid fa-wheat-awn'></i> symbols on all sides are replaced with <i class='fa-solid fa-hammer'></i>, and a <i class='fa-solid fa-satellite-dish decrease'></i> symbol is added to the 6-value side.",
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            if (game.player.laws.social == "serfdom") die.class = "peasant";
            else die.class = "laborer";
            for (let i = 0; i < 6; i++) {
                if (helpers.get(die.sides[i].symbols, "wheat", 0) > 0) {
                    die.add_symbol("production", helpers.get(die.sides[i].symbols, "wheat", 0), i);
                    die.add_symbol("wheat", -helpers.get(die.sides[i].symbols, "wheat", 0), i);
                }
            }
            if (!game.prestige.avoid_detection_roll()) die.add_symbol("detection", 1, 5);
        }
    }
};

game.data.buildings.exile = {
    "name": "Exile",
    "desc": "Remove a citizen from the game",
    "help_desc": "This village job removes the die from your settlement. Useful if you want to get rid of unneeded dice.",
    "possible": function() {
        return !game.conditionals.get("human_sacrifice_enabled");
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "effect": function(staff) {
        for (let i in game.player.locations.exile) {
            if (game.player.locations.exile[i] != null) {
                game.player.remove_citizen(game.player.locations.exile[i]);
            }
        }
    }
};

game.data.buildings.human_sacrifice = {
    "name": "Human Sacrifice",
    "desc": "Remove a citizen from the game<br>Gain <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>3</span> per worker",
    "help_desc": "This village job removes the die from your settlement violently, producing <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>3</span> in the process. Useful if you want to get rid of unneeded dice or if the settlement is starving.",
    "possible": function() {
        return game.conditionals.get("human_sacrifice_enabled");
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wheat": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.wheat += 3;
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let i in game.player.locations.human_sacrifice) {
            if (game.player.locations.human_sacrifice[i] != null) {
                game.player.remove_citizen(game.player.locations.human_sacrifice[i]);
            }
        }
    }
};

game.data.buildings.lumberjack = {
    "name": "Lumberjack",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> on current side<br>Produce <i class='fa-solid fa-tree'></i> plus <i class='fa-solid fa-tree'></i> <span class='bold'>1</span> per <i class='fa-solid fa-hammer'></i><span class='conditional' data-condition='wooden_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-tree'></i> <span class='bold'>1</span></span><span class='conditional' data-condition='stone_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-tree'></i> <span class='bold'>2</span></span><span class='conditional' data-condition='metal_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-tree'></i> <span class='bold'>3</span></span><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-tree'></i><span class='conditional' data-condition='mechanical_saw_is_the_best' data-conditional_class='no-display'><br>25% chance: keep <i class='fa-solid fa-hammer'></i></span>",
    "help_desc": "This village job produces <i class='fa-solid fa-tree'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-tree'></i> passively. Each <i class='fa-solid fa-tree'></i> and <i class='fa-solid fa-hammer'></i> symbol on the current side produces <i class='fa-solid fa-tree'></i> <span class='bold'>1</span> by default.<br>One <i class='fa-solid fa-hammer'></i> symbol on the current side is replaced by <i class='fa-solid fa-tree'></i> afterwards.",
    "possible": function() {
        return !game.conditionals.get("one_turn_lumberjack_ban");
    },
    "build_cost": { "production": 3 },
    "on_build": function() {
        game.player.temporary_flags["seen_wood"] = true;
        game.player.flags["help_seen_wood"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wood": 0, "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.wood += helpers.get(die.get_side().symbols, "wood", 0);
            total_production.wood += helpers.get(die.get_side().symbols, "production", 0);
            
            // Technologies
            if (game.conditionals.get("research_wooden_tools")) total_production.wood += 1;
            if (game.conditionals.get("research_stone_tools")) total_production.wood += 1;
            if (game.conditionals.get("research_metal_tools")) total_production.wood += 1;
            if (game.conditionals.get("research_electric_tools") && game.player.buildings.lumberjack.choice == "electricity") total_production.wood += 2;
        }

        // Electrified
        if (game.player.buildings.lumberjack.choice == "electricity") {
            total_production.wood *= 2;
            total_production.electricity = -Math.ceil(total_production.wood / 3.0);
        }

        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            let production_loss_chance = 100;
            if (game.conditionals.get("research_mechanial_saw")) production_loss_chance = 75;
            if (game.conditionals.get("research_lumberjack_automation") && game.player.buildings.lumberjack.choice == "electricity") production_loss_chance = 100 - (100 - production_loss_chance) * 2;

            if (helpers.percentile_roll(production_loss_chance)) die.add_symbol("production", -1);
            die.add_symbol("wood", 1);
        }
    },
    "choice": {
        "no_electricity": "<i class='fa-solid fa-ban'></i>",
        "electricity": "<i class='fa-solid fa-bolt'></i>"
    },
    "default_choice": "no_electricity",
    "choice_possible": function() { return game.conditionals.get("research_sawmills"); }
};

game.data.buildings.wall = {
    "name": "Build a Wall",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> on current side<br>Spend <span class='conditional' data-condition='building_wall_choice_not_possible' data-conditional_class='no-display'><i class='fa-solid fa-tree'></i></span><span class='conditional' data-condition='building_wall_choice_possible' data-conditional_class='no-display'>resources</span> equal to die side and get <i class='fa-solid fa-shield-halved'></i> <span class='bold'>1</span><span class='conditional' data-condition='building_wall_choice_possible' data-conditional_class='no-display'><br>Using <i class='fa-solid fa-cube'></i> gives an extra <i class='fa-solid fa-shield-halved'></i></span>",
    "help_desc": "This village job serves as an early but expensive source of <i class='fa-solid fa-shield-halved'></i>. A citizen with a <i class='fa-solid fa-hammer'></i> symbol assigned there consumes <i class='fa-solid fa-tree'></i> or <i class='fa-solid fa-cube'></i> (your choice) equal to the number displayed on the die face, which ranges from 1 to 6.<br>If <i class='fa-solid fa-tree'></i> was consumed, the citizen produces <i class='fa-solid fa-shield-halved'></i> <span class='bold'>1</span>; if <i class='fa-solid fa-cube'></i> was spent, the citizen produces <i class='fa-solid fa-shield-halved'></i> <span class='bold'>2</span> instead.",
    "possible": function() {
        return game.conditionals.get("seen_detection");
    },
    "build_cost": { "wood": 5 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_reinforced_walls") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "wood": 0, "stone": 0, "defense": 0 };
        for (let die of staff) {
            if (die == null) continue;
            if (game.player.buildings.wall.choice == "wood") {
                total_production.wood -= die.rolled + 1;
                total_production.defense += 1;
            }
            if (game.player.buildings.wall.choice == "stone") {
                total_production.stone -= die.rolled + 1;
                total_production.defense += 2;
            }
        }
        if (game.player.prestige_upgrades.integrated_defense_systems.level > 0) total_production.defense *= 1 + game.player.resources.attacks_survived;
        return total_production;
    },
    "choice": {
        "wood": "<i class='fa-solid fa-tree'></i>",
        "stone": "<i class='fa-solid fa-cube'></i>"
    },
    "default_choice": "wood",
    "choice_possible": function() {
        return game.conditionals.get("seen_stone");
    }
};

game.data.buildings.academia = {
    "name": "Academia",
    "desc": "No <span class='class-peasant'>Peasants</span><br>10% per die side value to add <i class='fa-solid fa-flask'></i>, same for <i class='fa-solid fa-satellite-dish decrease'></i><br>On fill become <span class='class-scientist'>Scientist</span>, replace <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-flask'></i>",
    "help_desc": "This village job is a prime way of establishing a <i class='fa-solid fa-flask'></i> production. The citizen employed there has a 10% chance, multiplied by the number on the rolled die side (from 10% to 60%), to gain a <i class='fa-solid fa-flask'></i> symbol on the current side. However, independently, there is also a same chance to get a <i class='fa-solid fa-satellite-dish decrease'></i> symbol.<br>Additionally, the employed citizen adds its die value to the overall progress of obtaining a scientific degree. When the progress reaches 20, the currently employed citizen becomes a <span class='class-scientist'>Scientist</span>, replacing all <i class='fa-solid fa-hammer'></i> symbols on all sides with <i class='fa-solid fa-flask'></i>.",
    "possible": function() {
        return game.conditionals.get("seen_wood");
    },
    "on_build": function() {
        game.player.temporary_flags["seen_science"] = true;
        game.player.flags["help_seen_science"] = true;
    },
    "build_cost": { "wood": 5 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let production = { "science": 0 };
        for (let die of staff) {
            if (die == null) continue;
            if (game.conditionals.get("research_peer_review") && die.class == "scientist") {
                production.science += helpers.get(die.get_side().symbols, "science", 0);
            }
        }
        return production;
    },
    "progress": {
        "max": 20,
        "growth": function(staff) {
            let total_growth = 0;
            for (let die of staff) {
                if (die == null) continue;
                total_growth += die.rolled + 1;
            }
            return total_growth;
        },
        "reset": true,
        "fill_effect": function(fills) {
            let staff = game.elements.buildings.get_staff("academia");
            for (let die of staff) {
                if (die == null) continue;
                die.class = "scientist";
                for (let i = 0; i < 6; i++) {
                    if (helpers.get(die.sides[i].symbols, "production", 0) > 0) {
                        die.add_symbol("science", helpers.get(die.sides[i].symbols, "production", 0), i);
                        die.add_symbol("production", -helpers.get(die.sides[i].symbols, "production", 0), i);
                    }
                }
            }
        }
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            let percentage_chance = 10 * (die.rolled + 1);
            let science_percentage_chance = percentage_chance;
            // Technologies
            if (game.conditionals.get("research_scientific_method") && die.class == "scientist") science_percentage_chance *= 1.5;
            if (game.conditionals.get("research_mad_science") && die.class == "scientist") science_percentage_chance = 100;
            if (game.conditionals.get("research_nda") && die.class == "scientist") percentage_chance = 0;

            if (helpers.percentile_roll(science_percentage_chance)) die.add_symbol("science", 1);
            if (helpers.percentile_roll(percentage_chance)) {
                if (!game.prestige.avoid_detection_roll()) {
                    die.add_symbol("detection", 1);
                }
            }
        }
    }
};

game.data.buildings.farm = {
    "name": "Farm",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> on current side<br>Produce <i class='fa-solid fa-wheat-awn'></i> plus <i class='fa-solid fa-wheat-awn'></i> <span class='bold conditional' data-condition='agriculture_is_the_best' data-conditional_class='no-display'>1</span><span class='bold conditional' data-condition='irrigation_is_the_best' data-conditional_class='no-display'>2</span><span class='bold conditional' data-condition='fertilizers_is_the_best' data-conditional_class='no-display'>3</span> per <i class='fa-solid fa-hammer'></i><span class='conditional' data-condition='wooden_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>1</span></span><span class='conditional' data-condition='stone_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>2</span></span><span class='conditional' data-condition='metal_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>3</span></span><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-wheat-awn'></i><span class='conditional' data-condition='research_irrigation' data-conditional_class='no-display'><br>50% chance to add <i class='fa-solid fa-wheat-awn'></i></span>",
    "help_desc": "This village job produces <i class='fa-solid fa-wheat-awn'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-wheat-awn'></i> passively. Each <i class='fa-solid fa-wheat-awn'></i> and <i class='fa-solid fa-hammer'></i> symbol on the current side produces <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>1</span> by default.<br>One <i class='fa-solid fa-hammer'></i> symbol on the current side is replaced by <i class='fa-solid fa-wheat-awn'></i> afterwards. This conversion can be improved with technology.",
    "possible": function() {
        return game.conditionals.get("research_agriculture");
    },
    "build_cost": { "production": 5, "wood": 5 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_crop_rotation") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "wheat": 0, "money": 0, "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.wheat += helpers.get(die.get_side().symbols, "wheat", 0);
            total_production.wheat += helpers.get(die.get_side().symbols, "production", 0);
            
            // Technologies
            if (game.conditionals.get("research_wooden_tools")) total_production.wheat += 1;
            if (game.conditionals.get("research_stone_tools")) total_production.wheat += 1;
            if (game.conditionals.get("research_metal_tools")) total_production.wheat += 1;
            if (game.conditionals.get("research_irrigation")) total_production.wheat += helpers.get(die.get_side().symbols, "production", 0);
            if (game.conditionals.get("research_fertilizers")) total_production.wheat += helpers.get(die.get_side().symbols, "production", 0);
            if (game.conditionals.get("research_electric_tools") && game.player.buildings.farm.choice == "electricity") total_production.wheat += 2;
        }
        // Electrified
        if (game.player.buildings.farm.choice == "electricity") {
            total_production.wheat *= 2;
            total_production.electricity = -Math.ceil(total_production.wheat / 3.0);
        }

        // Technologies
        if (game.conditionals.get("research_farmer_markets") && total_production.wheat >= 5) total_production.money += 1;

        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("production", -1);
            die.add_symbol("wheat", 1);
            if (game.conditionals.get("research_irrigation")) {
                let additional_gain_roll = 50;
                if (game.conditionals.get("research_farm_automation") && game.player.buildings.farm.choice == "electricity") additional_gain_roll *= 2;

                if (helpers.percentile_roll(additional_gain_roll)) die.add_symbol("wheat", 1);
            }
        }
    },
    "choice": {
        "no_electricity": "<i class='fa-solid fa-ban'></i>",
        "electricity": "<i class='fa-solid fa-bolt'></i>"
    },
    "default_choice": "no_electricity",
    "choice_possible": function() { return game.conditionals.get("research_grain_mills"); }
};

game.data.buildings.stone_quarry = {
    "name": "Stone Quarry",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> on current side<br>Produce <i class='fa-solid fa-cube'></i> plus <i class='fa-solid fa-cube'></i> <span class='bold'>1</span> per <i class='fa-solid fa-hammer'></i><span class='conditional' data-condition='stone_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-cube'></i> <span class='bold'>1</span></span><span class='conditional' data-condition='metal_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-cube'></i> <span class='bold'>2</span></span><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-cube'></i><span class='conditional' data-condition='brickworks_is_the_best' data-conditional_class='no-display'><br>25% chance: keep <i class='fa-solid fa-hammer'></i></span>",
    "help_desc": "This village job produces <i class='fa-solid fa-cube'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-cube'></i> passively. Each <i class='fa-solid fa-cube'></i> and <i class='fa-solid fa-hammer'></i> symbol on the current side produces <i class='fa-solid fa-cube'></i> <span class='bold'>1</span> by default.<br>One <i class='fa-solid fa-hammer'></i> symbol on the current side is replaced by <i class='fa-solid fa-cube'></i> afterwards.",
    "possible": function() {
        return game.conditionals.get("research_stoneworking");
    },
    "build_cost": { "production": 5, "wood": 10 },
    "on_build": function() {
        game.player.temporary_flags["seen_stone"] = true;
        game.player.flags["help_seen_stone"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "stone": 0, "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.stone += helpers.get(die.get_side().symbols, "stone", 0);
            total_production.stone += helpers.get(die.get_side().symbols, "production", 0);

            // Technologies
            if (game.conditionals.get("research_stone_tools")) total_production.stone += 1;
            if (game.conditionals.get("research_metal_tools")) total_production.stone += 1;
            if (game.conditionals.get("research_electric_tools") && game.player.buildings.stone_quarry.choice == "electricity") total_production.stone += 2;
        }

        // Electrified
        if (game.player.buildings.stone_quarry.choice == "electricity") {
            total_production.stone *= 2;
            total_production.electricity = -Math.ceil(total_production.stone / 3.0);
        }

        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            let production_loss_chance = 100;
            if (game.conditionals.get("research_brickworks")) production_loss_chance = 75;
            if (game.conditionals.get("research_stone_quarry_automation") && game.player.buildings.stone_quarry.choice == "electricity") production_loss_chance = 100 - (100 - production_loss_chance) * 2;

            if (helpers.percentile_roll(production_loss_chance)) die.add_symbol("production", -1);
            die.add_symbol("stone", 1);
        }
    },
    "choice": {
        "no_electricity": "<i class='fa-solid fa-ban'></i>",
        "electricity": "<i class='fa-solid fa-bolt'></i>"
    },
    "default_choice": "no_electricity",
    "choice_possible": function() { return game.conditionals.get("research_cranes"); }
};

game.data.buildings.market_caravan = {
    "name": "Market Caravan",
    "desc": "Spend <i class='fa-solid fa-sack-dollar'></i> <span class='bold conditional' data-condition='trade_routes_is_the_best' data-conditional_class='no-display'>1</span><span class='bold conditional' data-condition='large_volume_trading_is_the_best' data-conditional_class='no-display'>2</span><span class='bold conditional' data-condition='massive_volume_trading_is_the_best' data-conditional_class='no-display'>10</span> and get resources <span class='conditional' data-condition='trade_routes_is_the_best' data-conditional_class='no-display'>equal to</span><span class='conditional' data-condition='large_volume_trading_is_the_best' data-conditional_class='no-display'>2\xd7</span><span class='conditional' data-condition='massive_volume_trading_is_the_best' data-conditional_class='no-display'>10\xd7</span> die side number plus <i class='fa-solid fa-satellite-dish decrease'></i> <span class='bold decrease'>1</span>",
    "help_desc": "This village job allows you to exchange <i class='fa-solid fa-sack-dollar'></i> for basic resources like <i class='fa-solid fa-wheat-awn'></i> <i class='fa-solid fa-tree'></i> <i class='fa-solid fa-cube'></i>. The return is dependent on the trader skill: you gain as many resources as the number on the rolled side indicates (1 to 6).<br>However, the Market Caravan job has the interaction with outsiders as the inevitable consequence, so an additional <span class='decrease'><i class='fa-solid fa-satellite-dish decrease'></i> <span class='bold'>1</span></span> is produced per citizen employed there.",
    "possible": function() {
        return game.conditionals.get("research_trade_routes");
    },
    "build_cost": { "wood": 10, "stone": 5 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wheat": 0, "wood": 0, "stone": 0, "money": 0, "detection": 0 };
        for (let die of staff) {
            if (die == null) continue;
            let job_multiplier = 1;
            if (game.conditionals.get("research_large_volume_trading")) job_multiplier = 2;
            if (game.conditionals.get("research_massive_volume_trading")) job_multiplier = 10;

            total_production.money -= job_multiplier;
            total_production.detection += 1;
            total_production[game.player.buildings.market_caravan.choice] += (die.rolled + 1) * job_multiplier;
        }
        return total_production;
    },
    "choice": {
        "wheat": "<i class='fa-solid fa-wheat-awn'></i>",
        "wood": "<i class='fa-solid fa-tree'></i>",
        "stone": "<i class='fa-solid fa-cube'></i>"
    },
    "default_choice": "wheat"
};

game.data.buildings.military_training = {
    "name": "Military Training",
    "desc": "Convert to <span class='class-soldier'>Soldier</span><br>For each non-<i class='fa-solid fa-shield-halved'></i> positive symbol: <span class='conditional' data-condition='garrison_is_the_best' data-conditional_class='no-display'>50% to lose it, 25% to replace with <i class='fa-solid fa-shield-halved'></i></span><span class='conditional' data-condition='leadership_is_the_best' data-conditional_class='no-display'>25% to lose it, 50% to replace with <i class='fa-solid fa-shield-halved'></i></span><br>Add <i class='fa-solid fa-hand-fist decrease'></i> to the 6 side",
    "help_desc": "This village job converts any dice into <span class='class-soldier'>Soldiers</span>. The results of a Military Training tend to be unreliable, as some dice symbols are lost while only a proportion of the rest gets converted, so you might need to Exile a few resulting dice before you get a favorable distribution. All <span class='class-soldier'>Soldiers</span> converted this way get a <i class='fa-solid fa-hand-fist decrease'></i> symbol on the 6-value side.",
    "possible": function() {
        return game.conditionals.get("research_garrison");
    },
    "build_cost": { "stone": 10 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.class = "soldier";
            for (let i = 0; i < 6; i++) {
                for (let symbol in die.sides[i].symbols) {
                    if (symbol == "defense") continue;
                    if (helpers.get(game.data.resources[symbol], "negative", false)) continue;

                    let lose_threshold = 0.5;
                    let convert_threshold = 0.75;
                    if (game.conditionals.get("research_leadership")) lose_threshold = 0.25;

                    for (let j = die.sides[i].symbols[symbol]; j > 0; j--) {
                        let roll = Math.random();
                        if (roll < convert_threshold) {
                            die.sides[i].symbols[symbol] -= 1;
                            if (roll >= lose_threshold) die.add_symbol("defense", 1, i);
                        }
                    }
                }
            }
            die.add_symbol("attack", 1, 5);
            if (game.prestige.attack_payback()) die.add_symbol("defense", 1, 5);
        }
    }
};

game.data.buildings.foundry = {
    "name": "Foundry",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> <i class='fa-solid fa-cube'></i> rolled<br>Produce <i class='fa-solid fa-gem'></i> plus <i class='fa-solid fa-gem'></i> <span class='bold'>1</span> per pair of <i class='fa-solid fa-hammer'></i><i class='fa-solid fa-cube'></i><span class='conditional' data-condition='metal_tools_are_the_best' data-conditional_class='no-display'> plus <i class='fa-solid fa-gem'></i> <span class='bold'>1</span></span><br>Spend <i class='fa-solid fa-tree'></i> <span class='bold'>2</span> per <i class='fa-solid fa-gem'></i><br>Replace one <i class='fa-solid fa-hammer'></i><i class='fa-solid fa-cube'></i> with <i class='fa-solid fa-gem'></i>",
    "help_desc": "This village job produces <i class='fa-solid fa-gem'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-gem'></i> passively. It is quite more resource-intensive than previous resource production buildings, requiring both an additional <i class='fa-solid fa-cube'></i> symbol on the current side and a <i class='fa-solid fa-tree'></i> upkeep. Each <i class='fa-solid fa-gem'></i> and a pair of <i class='fa-solid fa-hammer'></i> and <i class='fa-solid fa-cube'></i> symbols on the current side produces <i class='fa-solid fa-gem'></i> <span class='bold'>1</span> and consumes <i class='fa-solid fa-tree'></i> <span class='bold'>2</span> by default.<br>One pair of <i class='fa-solid fa-hammer'></i> <i class='fa-solid fa-cube'></i> symbols on the current side is replaced by <i class='fa-solid fa-gem'></i> afterwards.",
    "possible": function() {
        return game.conditionals.get("research_metalworking");
    },
    "build_cost": { "production": 10, "stone": 20 },
    "on_build": function() {
        game.player.temporary_flags["seen_metal"] = true;
        game.player.flags["help_seen_metal"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wood": 0, "metal": 0, "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.metal += helpers.get(die.get_side().symbols, "metal", 0);
            total_production.metal += Math.min(helpers.get(die.get_side().symbols, "production", 0), helpers.get(die.get_side().symbols, "stone", 0));

            // Technologies
            if (game.conditionals.get("research_metal_tools")) total_production.metal += 1;
            if (game.conditionals.get("research_electric_tools") && game.player.buildings.foundry.choice == "electricity") total_production.metal += 2;
        }

        total_production.wood = -2 * total_production.metal;

        // Electrified
        if (game.player.buildings.foundry.choice == "electricity") {
            total_production.metal *= 2;
            total_production.electricity = -Math.ceil(total_production.metal / 3.0);
        }

        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            if (game.conditionals.get("research_foundry_automation") && game.player.buildings.foundry.choice == "electricity") {
                if (helpers.percentile_roll(50)) die.add_symbol("production", -1);
                else die.add_symbol("stone", -1);
            }
            else {
                die.add_symbol("production", -1);
                die.add_symbol("stone", -1);
            }
            die.add_symbol("metal", 1);
        }
    },
    "choice": {
        "no_electricity": "<i class='fa-solid fa-ban'></i>",
        "electricity": "<i class='fa-solid fa-bolt'></i>"
    },
    "default_choice": "no_electricity",
    "choice_possible": function() { return game.conditionals.get("research_blast_furnace"); }
};

game.data.buildings.counseling = {
    "name": "Counseling",
    "desc": "Add <i class='fa-solid fa-weight-hanging'></i> to the current side, making it more likely to be rolled<br>Spend <i class='fa-solid fa-gem'></i> <span class='bold'>1</span> per die side value",
    "help_desc": "This village job provides a way to manipulate random outcomes. Sending a citizen there adds a <i class='fa-solid fa-weight-hanging'></i> to the current side, which makes it more likely to be rolled. Each <i class='fa-solid fa-weight-hanging'></i> symbols counts as an additional side when rolling dice, so a side with one <i class='fa-solid fa-weight-hanging'></i> symbol is 2\xd7 more likely to be rolled than a side without one.<br>The job requires a payment of <i class='fa-solid fa-gem'></i> equal to the number on the die side (from 1 to 6).",
    "possible": function() {
        return game.conditionals.get("research_psychology");
    },
    "build_cost": { "production": 20, "metal": 10 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "metal": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.metal -= die.rolled + 1;
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.sides[die.rolled].weight += 1;
            if (die.sides[die.rolled].weight > 1000) die.sides[die.rolled].weight = 1000; // Limit at 999 extra weight
        }
    }
};

game.data.buildings.mint = {
    "name": "Mint",
    "desc": "Needs <i class='fa-solid fa-hammer'></i> on current side<br>Produce <i class='fa-solid fa-sack-dollar'></i> plus <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>2</span> per <i class='fa-solid fa-hammer'></i><br>Spend <span class='conditional' data-condition='building_mint_choice_not_possible' data-conditional_class='no-display'><i class='fa-solid fa-gem'></i> <span class='bold'>1</span></span><span class='conditional' data-condition='building_mint_choice_possible' data-conditional_class='no-display'>1 resource</span> per <i class='fa-solid fa-hammer'></i><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-sack-dollar'></i><span class='conditional' data-condition='research_digital_currency' data-conditional_class='no-display'><i class='fa-solid fa-sack-dollar'></i></span>",
    "help_desc": "This village job produces <i class='fa-solid fa-sack-dollar'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-sack-dollar'></i> passively. The citizen produces <i class='fa-solid fa-sack-dollar'></i> according to symbols on the current side, and additionally <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>2</span> for each <i class='fa-solid fa-hammer'></i> on the current side by default; this also requires to spend a single unit of resource (initially <i class='fa-solid fa-gem'></i>, can be chosen later) per <i class='fa-solid fa-hammer'></i>.<br>One <i class='fa-solid fa-hammer'></i> symbol on the current side is replaced by <i class='fa-solid fa-sack-dollar'></i> afterwards.",
    "possible": function() {
        return game.conditionals.get("research_coin_minting");
    },
    "build_cost": { "production": 20, "metal": 10 },
    "on_build": function() {
        game.player.temporary_flags["seen_money"] = true;
        game.player.flags["help_seen_money"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_central_bank") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "wood": 0, "metal": 0, "money": 0 };
        let money_per_hammer = 2;
        for (let die of staff) {
            if (die == null) continue;
            total_production.money += helpers.get(die.get_side().symbols, "money", 0);
            total_production.money += money_per_hammer * helpers.get(die.get_side().symbols, "production", 0);
            total_production[game.player.buildings.mint.choice] -= helpers.get(die.get_side().symbols, "production", 0);
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("production", -1);
            die.add_symbol("money", 1);
            if (game.conditionals.get("research_digital_currency")) die.add_symbol("money", 1);
        }
    },
    "choice": {
        "wood": "<i class='fa-solid fa-tree'></i>",
        "metal": "<i class='fa-solid fa-gem'></i>"
    },
    "default_choice": "metal",
    "choice_possible": function() {
        return game.conditionals.get("research_paper_money");
    }
};

game.data.buildings.mayor = {
    "name": "Mayor",
    "desc": "No <span class='class-peasant'>Peasants</span> or <span class='class-laborer'>Laborers</span><br>Needs to roll a 6<br>Produce <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span> and <span class='decrease'><i class='fa-solid fa-satellite-dish'></i> <span class='bold'>1</span></span><br>Spend <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>10</span>",
    "help_desc": "This village job is an early way of producing <i class='fa-solid fa-landmark'></i>, which is used to change laws and pay for the construction of some later buildings.<br>This job is not available for <span class='class-peasant'>Peasants</span> or <span class='class-laborer'>Laborers</span>, and the job applicant must have rolled a 6 this turn. If a citizen with the appropriate traits is found, they produce <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span> at the cost of <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>10</span> and raising <i class='fa-solid fa-landmark'></i> by 1.",
    "possible": function() {
        return game.conditionals.get("research_governance");
    },
    "build_cost": { "metal": 20, "money": 20 },
    "on_build": function() {
        game.player.temporary_flags["seen_bureaucracy"] = true;
        game.player.flags["help_seen_bureaucracy"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "bureaucracy": 0, "money": 0, "detection": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.bureaucracy += 1;
            total_production.money -= 10;
            total_production.detection += 1;
        }
        return total_production;
    }
};

game.data.buildings.bank = {
    "name": "Bank",
    "desc": "Needs <i class='fa-solid fa-sack-dollar'></i> on current side<br>Produce <i class='fa-solid fa-sack-dollar'></i> <span class='bold conditional' data-condition='banking_is_the_best' data-conditional_class='no-display'>5</span><span class='bold conditional' data-condition='financial_instruments_is_the_best' data-conditional_class='no-display'>10</span><span class='bold conditional' data-condition='modern_monetary_theory_is_the_best' data-conditional_class='no-display'>20</span> per <i class='fa-solid fa-sack-dollar'></i> symbol</i><br>Lose a <i class='fa-solid fa-sack-dollar'></i> symbol</i>",
    "help_desc": "This village job exploits <i class='fa-solid fa-sack-dollar'></i> symbols to obtain a quick infusion of cash. The citizen working there produces <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>5</span> from each of its <i class='fa-solid fa-sack-dollar'></i> symbols, but loses one of them afterwards.",
    "possible": function() {
        return game.conditionals.get("research_banking");
    },
    "build_cost": { "metal": 20, "money": 60 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wood": 0, "metal": 0, "money": 0 };
        let money_per_symbol = 5;
        if (game.conditionals.get("research_financial_instruments")) money_per_symbol = 10;
        if (game.conditionals.get("research_modern_monetary_theory")) money_per_symbol = 20;
        for (let die of staff) {
            if (die == null) continue;
            total_production.money += money_per_symbol * helpers.get(die.get_side().symbols, "money", 0);
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("money", -1);
        }
    }
};

game.data.buildings.specialist_training = {
    "name": "Specialist Training",
    "desc": "<span class='class-laborer'>Laborer</span> or <span class='class-specialist'>Specialist</span><br>Add <i class='fa-solid fa-hammer'></i> to current side<br>Add <i class='fa-solid fa-satellite-dish decrease'></i> to random side<br>Spend <i class='fa-solid fa-sack-dollar'></i> equal to die side<br><i class='fa-solid fa-hammer'></i>\xd76: <span class='class-specialist'>Specialist</span>",
    "help_desc": "This village job helps you to improve your <span class='class-laborer'>Laborers</span>. A citizen sent there acquires a <i class='fa-solid fa-hammer'></i> symbol on the current side, at the cost of also getting a <i class='fa-solid fa-satellite-dish decrease'></i> symbol on a random side and paying <i class='fa-solid fa-sack-dollar'></i> equal to the number on the current die face (from 1 to 6).<br>If this procedure leaves the citizen with at least six <i class='fa-solid fa-hammer'></i> symbols on the current side, it becomes a <span class='class-specialist'>Specialist</span>. Specialists require an extra <i class='fa-solid fa-sack-dollar'></i> upkeep but are capable of working more jobs.",
    "possible": function() {
        return game.conditionals.get("research_specialist_training");
    },
    "build_cost": { "money": 20, "bureaucracy": 2 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "money": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.money -= die.rolled + 1;
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("production", 1);
            if (!game.prestige.avoid_detection_roll()) die.add_symbol("detection", 1, helpers.randint(5));
            if (helpers.get(die.get_side().symbols, "production", 0) >= 6) die.class = "specialist";
        }
    }
};

game.data.buildings.prison = {
    "name": "Prison",
    "desc": "Needs <i class='fa-solid fa-satellite-dish decrease'></i><i class='fa-solid fa-satellite-dish decrease'></i> rolled<span class='conditional' data-condition='research_community_service' data-conditional_class='no-display'><br>Produce resources other than <i class='fa-solid fa-satellite-dish decrease'></i></span><br><span class='conditional' data-condition='no_behavioral_shaping' data-conditional_class='no-display'>50% chance: r</span><span class='conditional' data-condition='research_behavioral_shaping' data-conditional_class='no-display'>R</span>emove <span class='conditional' data-condition='is_not_totalitarian' data-conditional_class='no-display'>one</span><span class='conditional' data-condition='is_totalitarian' data-conditional_class='no-display'>all</span> <i class='fa-solid fa-satellite-dish decrease'></i>",
    "help_desc": "This village job removes excessive <i class='fa-solid fa-satellite-dish decrease'></i> symbols from prisoners. To be assigned here, a citizen must roll at least two <i class='fa-solid fa-satellite-dish decrease'></i> symbols. By default, Prison can only remove a single <i class='fa-solid fa-satellite-dish decrease'></i> symbol, and even this is not guaranteed, as it only has a 50% chance of happening. There are several upgrades in the technology tree that make this building better at its job.",
    "possible": function() {
        return game.conditionals.get("research_penal_system");
    },
    "build_cost": { "metal": 20, "bureaucracy": 2 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            let detection_removal_chance = 50;
            if (helpers.percentile_roll(detection_removal_chance)) {
                if (game.player.laws.political == "totalitarianism") die.add_symbol("detection", -helpers.get(die.get_side().symbols, "detection", 0));
                else die.add_symbol("detection", -1);
            }
        }
    }
};

game.data.buildings.coal_powerplant = {
    "name": "Coal Powerplant",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br>Produce <i class='fa-solid fa-bolt'></i> plus <i class='fa-solid fa-bolt'></i> <span class='bold'>2</span> per <i class='fa-solid fa-hammer'></i><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-bolt'></i>",
    "help_desc": "This village job produces <i class='fa-solid fa-bolt'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-bolt'></i> passively. Only <span class='class-specialist'>Specialists</span> can work there, and they must have rolled <i class='fa-solid fa-hammer'></i> on the current side to work there. A citizen who is employed there produces <i class='fa-solid fa-bolt'></i> equal to the number of <i class='fa-solid fa-bolt'></i> symbols rolled, as well as <i class='fa-solid fa-bolt'></i> <span class='bold'>2</span> per <i class='fa-solid fa-hammer'></i> symbol by default.<br>One <i class='fa-solid fa-hammer'></i> symbol is replaced by <i class='fa-solid fa-bolt'></i> afterwards.",
    "possible": function() {
        return game.conditionals.get("research_steam_engine");
    },
    "build_cost": { "production": 200, "metal": 20 },
    "on_build": function() {
        game.player.temporary_flags["seen_electricity"] = true;
        game.player.flags["help_seen_electricity"] = true;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_national_energy_grid") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            
            total_production.electricity += helpers.get(die.get_side().symbols, "electricity", 0);
            total_production.electricity += 2 * helpers.get(die.get_side().symbols, "production", 0);
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;

            die.add_symbol("production", -1);
            die.add_symbol("electricity", 1);
        }
    }
};

game.data.buildings.oil_derrick = {
    "name": "Oil Derrick",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br><i class='fa-solid fa-hammer'></i> produce progress<br>Lose a <i class='fa-solid fa-hammer'></i> symbol<br>When full: have oil",
    "help_desc": "This village job does not produce resources on its own, but instead provides triggers for other oil-consuming buildings. This job can only be worked by <span class='class-specialist'>Specialists</span>, and they must have at least one <i class='fa-solid fa-hammer'></i> symbol on the current side. Each <i class='fa-solid fa-hammer'></i> symbol on the current side produces a unit of progress; when the progress scale is projected to be full at the end of the turn, oil-consuming buildings become able to provide actual benefits. Then, the progress needed to reach this state is increased by 1, representing the ever-dwindling limited reserves of oil you have access to. Each worker employed on this job loses a <i class='fa-solid fa-hammer'></i> symbol afterwards.",
    "possible": function() {
        return game.conditionals.get("research_oil_derrick");
    },
    "build_cost": { "metal": 100, "money": 200 },
    "init": function(player) {
        player.buildings.oil_derrick.max_progress = 5;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_shale_oil") ? 2 : 1); }
    },
    "progress": {
        "max": function() { return game.player.buildings.oil_derrick.max_progress; },
        "growth": function(staff) {
            let total_growth = 0;
            for (let die of staff) {
                if (die == null) continue;
                total_growth += helpers.get(die.get_side().symbols, "production", 0);
            }
            return total_growth;
        },
        "after_growth": function(staff) {
            for (let die of staff) {
                if (die == null) continue;
                die.add_symbol("production", -1);
            }
        },
        "reset": true,
        "fill_effect": function(fills) {
            game.player.buildings.oil_derrick.max_progress += 1;
        }
    }
};

game.data.buildings.oil_refinery = {
    "name": "Oil Refinery",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i> rolled<br>Needs to have oil<br>Produce <i class='fa-solid fa-sheet-plastic'></i> per <i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i><br>Replace <i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i><i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-sheet-plastic'></i>",
    "help_desc": "This village job produces <i class='fa-solid fa-sheet-plastic'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-sheet-plastic'></i> passively. This job is a little bit more involved than other resource-producing jobs: only <span class='class-specialist'>Specialists</span> are allowed there, the worker must have rolled at least three <i class='fa-solid fa-hammer'></i> symbols on the current side, and the Oil Derrick progressbar must be filling to full this turn (meaning that you will need another <span class='class-specialist'>Specialist</span> to staff it as well). Each <i class='fa-solid fa-sheet-plastic'></i> symbol on worker's current side, as well as each triple of <i class='fa-solid fa-hammer'></i> symbols on the current side, produce <i class='fa-solid fa-sheet-plastic'></i> <span class='bold'>1</span> at the end of the year.<br>Three <i class='fa-solid fa-hammer'></i> symbols are replaced with a single <i class='fa-solid fa-sheet-plastic'></i> symbol afterwards.",
    "possible": function() {
        return game.conditionals.get("research_oil_refinery");
    },
    "build_cost": { "money": 200, "electricity": 300 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "plastic": 0 };
        if (game.elements.buildings.total_fills("oil_derrick") == 0) return total_production;
        for (let die of staff) {
            if (die == null) continue;
            
            total_production.plastic += helpers.get(die.get_side().symbols, "plastic", 0);
            total_production.plastic += Math.floor(helpers.get(die.get_side().symbols, "production", 0) / 3.0);
        }
        return total_production;
    },
    "effect": function(staff) {
        if (game.elements.buildings.total_fills("oil_derrick") == 0) return;
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("production", -3);
            die.add_symbol("plastic", 1);
        }
    }
};

game.data.buildings.oil_powerplant = {
    "name": "Oil Powerplant",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br>Needs to have oil<br>Gain <i class='fa-solid fa-bolt'></i> plus <i class='fa-solid fa-bolt'></i> <span class='bold'>5</span> per <i class='fa-solid fa-hammer'></i><br>Replace one <i class='fa-solid fa-hammer'></i> with <i class='fa-solid fa-bolt'></i><i class='fa-solid fa-bolt'></i>",
    "help_desc": "This village job produces <i class='fa-solid fa-bolt'></i> and teaches the citizenry working there on how to produce <i class='fa-solid fa-bolt'></i> passively. Only <span class='class-specialist'>Specialists</span> can work there, and they must have rolled <i class='fa-solid fa-hammer'></i> on the current side to work there. In addition, the progressbar on the Oil Derrick must be filling to full this year in order for this job to produce anything.<br>A citizen who is employed there produces <i class='fa-solid fa-bolt'></i> equal to the number of <i class='fa-solid fa-bolt'></i> symbols rolled, as well as <i class='fa-solid fa-bolt'></i> <span class='bold'>5</span> per <i class='fa-solid fa-hammer'></i> symbol by default.<br>One <i class='fa-solid fa-hammer'></i> symbol is replaced by <i class='fa-solid fa-bolt'></i><i class='fa-solid fa-bolt'></i> afterwards.",
    "possible": function() {
        return game.conditionals.get("research_oil_powerplant");
    },
    "build_cost": { "production": 400, "metal": 60 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_national_energy_grid") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "electricity": 0 };
        if (game.elements.buildings.total_fills("oil_derrick") == 0) return total_production;
        for (let die of staff) {
            if (die == null) continue;
            
            total_production.electricity += helpers.get(die.get_side().symbols, "electricity", 0);
            total_production.electricity += 5 * helpers.get(die.get_side().symbols, "production", 0);
        }
        return total_production;
    },
    "effect": function(staff) {
        if (game.elements.buildings.total_fills("oil_derrick") == 0) return;
        for (let die of staff) {
            if (die == null) continue;
            die.add_symbol("production", -1);
            die.add_symbol("electricity", 2);
        }
    }
};

game.data.buildings.solar_panels = {
    "name": "Solar Panels",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br>Spend <i class='fa-solid fa-sheet-plastic'></i> <span class='bold'>1</span> per <i class='fa-solid fa-hammer'></i><br>Lose a <i class='fa-solid fa-hammer'></i><br>Full: add <i class='fa-solid fa-bolt'></i> production",
    "help_desc": "This village job is a way to produce unlimited <i class='fa-solid fa-bolt'></i> without worker involvement, but you need to invest into setting it up first. Only <span class='class-specialist'>Specialists</span> can work here, and they must have at least one <i class='fa-solid fa-hammer'></i> on the currently rolled side. Rolled <i class='fa-solid fa-hammer'></i> represent the total amount of work done installing and connecting the solar panels; for each <i class='fa-solid fa-hammer'></i> symbol, one unit of progress is added and <i class='fa-solid fa-sheet-plastic'></i> <span class='bold'>1</span> is deduced. Once the progressbar fills up, the building gains a permanent income of <i class='fa-solid fa-bolt'></i> <span class='bold'>1</span>.",
    "possible": function() {
        return game.conditionals.get("research_alternative_energy");
    },
    "build_cost": { "production": 300, "plastic": 30 },
    "init": function(player) {
        player.buildings.solar_panels.production = 0;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(game.conditionals.get("research_national_energy_grid") ? 2 : 1); }
    },
    "production": function(staff) {
        let total_production = { "electricity": game.player.buildings.solar_panels.production, "plastic": 0 };
        for (let die of staff) {
            if (die == null) continue;
            total_production.plastic -= helpers.get(die.get_side().symbols, "production", 0);
        }
        return total_production;
    },
    "progress": {
        "max": function () { return game.conditionals.get("research_perovskite_cells") ? 10 : 20 },
        "growth": function(staff) {
            let total_growth = 0;
            for (let die of staff) {
                if (die == null) continue;
                total_growth += helpers.get(die.get_side().symbols, "production", 0);
            }
            return total_growth;
        },
        "after_growth": function(staff) {
            for (let die of staff) {
                if (die == null) continue;
                die.add_symbol("production", -1);
            }
        },
        "reset": false,
        "fill_production": function(fills) {
            return { "electricity": fills }
        },
        "fill_effect": function(fills) {
            game.player.buildings.solar_panels.production += fills;
        }
    }
};

game.data.buildings.clone_vats = {
    "name": "Clone Vats",
    "desc": "Send a citizen to create its copy<br>Spend <i class='fa-solid fa-bolt'></i> <span class='bold'>2</span> per positive symbol anywhere on the citizen",
    "help_desc": "This village job allows you to copy great minds among your population without going through genetic roulette. Unlike Raise a Child, the Clone Vats job does not combine the traits of two parents, but takes them all from a single one. However, growing a clone is costly, and requires <i class='fa-solid fa-bolt'></i> <span class='bold'>2</span> per each positive symbol on each side of the parent.",
    "possible": function() {
        return game.conditionals.get("research_cloning");
    },
    "build_cost": { "wheat": 2000, "plastic": 50 },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "electricity": 0 };
        for (let die of staff) {
            if (die == null) continue;
            for (let i = 0; i < 6; i++) {
                total_production.electricity -= 2 * die.symbol_count(true, i);
            }
        }
        return total_production;
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            game.player.add_citizen(game.elements.dice.create(die));
        }
    }
};

game.data.buildings.prime_minister = {
    "name": "Prime Minister",
    "desc": "No <span class='class-peasant'>Peasants</span> or <span class='class-laborer'>Laborers</span><br>Needs <i class='fa-solid fa-sack-dollar'></i> on current side<br>Add <i class='fa-solid fa-satellite-dish decrease'></i> to current side<br>50%+: chance to <i class='fa-solid fa-sack-dollar'></i> \u2192 <i class='fa-solid fa-landmark'></i><br>60%+: produce <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span>",
    "help_desc": "This village job is a way to obtain <i class='fa-solid fa-landmark'></i> and a passive <i class='fa-solid fa-landmark'></i> gain unique to the <span class='bold'>Democracy</span> law.<br>The citizen performing this job must have a <i class='fa-solid fa-sack-dollar'></i> symbol on the current side, representing the need for campaign financing. In addition, this job is not available for <span class='class-peasant'>Peasants</span> or <span class='class-laborer'>Laborers</span>, but they still get a voice in who actually gets elected. Indeed, when you assign a citizen as a Prime Minister, each citizen in your village votes for or against its candidature, displayed as a support bar on the job itself. All people who rolled the same number as the proposed Prime Minister, as well as 1 higher and 1 lower, vote for the candidate; everyone else votes against.<br>Regardless of the outcome of the vote, Prime Minister, as a public figure, obtains a <i class='fa-solid fa-satellite-dish decrease'></i> symbol on the current side.<br>If the total vote for the candidacy is less than 50%, the elections are a total failure, and the system is in a deadlock, so the Prime Minister is unable to do anything and accomplishes nothing else.<br>If the vote is above 50%, Prime Minisher has a chance to learn a thing or two about governance: there is a chance equal to support level minus 50% that one of the <i class='fa-solid fa-sack-dollar'></i> symbols on the current side of the Prime Minister gets replaced by a <i class='fa-solid fa-landmark'></i> symbol.<br>If the vote is above 60%, the support is great enough that the elected Prime Minister is able to administer swift changes immediately, resulting in a gain of <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span>.",
    "possible": function() {
        return game.player.laws.political == "democracy";
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let support_level = game.data.buildings.prime_minister.support(game.elements.buildings.get_staff("prime_minister"));
        let production = { "bureaucracy": 0 };

        for (let die of staff) {
            if (die == null) continue;
            if (support_level > 0.6) production.bureaucracy += 1;
        }

        return production;
    },
    "effect": function(staff) {
        let support_level = game.data.buildings.prime_minister.support(game.elements.buildings.get_staff("prime_minister"));

        for (let die of staff) {
            if (die == null) continue;
            
            if (!game.prestige.avoid_detection_roll()) die.add_symbol("detection", 1);
            if (support_level > 0.5) {
                if (helpers.percentile_roll(100 * (support_level - 0.5))) {
                    die.add_symbol("bureaucracy", 1);
                    die.add_symbol("money", -1);
                }
            }
        }
    },
    "support": function(staff) {
        let supporters = 0;
        let all_people = 0;

        for (let citizen_id in game.player.citizens) {
            all_people += 1;

            for (let die of staff) {
                if (die == null) continue;
                if (Math.abs(die.rolled - game.player.citizens[citizen_id].rolled) <= 1) {
                    supporters += 1;
                    break;
                }
            }
        }

        if (all_people == 0) return 0.0;
        else return supporters * 1.0 / all_people;
    }
};

game.data.buildings.advisor = {
    "name": "Advisor",
    "desc": "No <span class='class-peasant'>Peasants</span> or <span class='class-laborer'>Laborers</span><br>Needs a positive symbol<br>Produce <i class='fa-solid fa-satellite-dish decrease'></i> <span class='bold decrease'>1</span><br>Copy random symbol onto a free citizen",
    "help_desc": "This village job is a way to improve your citizens unique to the <span class='bold'>Autocracy</span> law.<br>The citizen working there must not be a <span class='class-peasant'>Peasant</span> or a <span class='class-laborer'>Laborer</span>, as they are too filthy to advice the Supreme Leader. In addition, the citizen must have a knowledge to share, which means in the game terms that they must have rolled at least one positive symbol on the current side. On the year's end, a random positive symbol on the Advisor's current side is selected and added to a random side of a random unemployed citizen. Negative symbols like <i class='fa-solid fa-satellite-dish decrease'></i> and <i class='fa-solid fa-hand-fist decrease'></i> cannot be copied. If there are no free citizens, then nothing happens.<br>As the Advisor's advice is public knowledge, an additional <i class='fa-solid fa-satellite-dish decrease'></i> <span class='bold decrease'>1</span> is generated regardless of the results.",
    "possible": function() {
        return game.player.laws.political == "autocracy";
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let production = { "detection": 0 };

        for (let die of staff) {
            if (die == null) continue;
            production.detection += 1;
        }

        return production;
    },
    "effect": function(staff) {
        // Gather all free citizens
        let free_citizens = {};
        for (let citizen_id in game.player.citizens) {
            if (game.elements.dice.is_unemployed(game.player.citizens[citizen_id])) free_citizens[citizen_id] = true;
        }

        for (let die of staff) {
            if (die == null) continue;
            
            let random_citizen = helpers.random_key(free_citizens);
            if (random_citizen == null) continue;
            let random_symbol = die.random_symbol();
            game.player.citizens[random_citizen].add_symbol(random_symbol, 1, helpers.randint(5));
        }
    }
};

game.data.buildings.union_representative = {
    "name": "Union Representative",
    "desc": "<span class='class-laborer'>Laborers</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br>Remove all <i class='fa-solid fa-hammer'></i> and give them to free citizens<br><i class='fa-solid fa-hammer'></i>\xd75: produce <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span>",
    "help_desc": "This village job is a way to promote work among your population, unique to the <span class='bold'>Socialism</span> law.<br>Only <span class='class-laborer'>Laborers</span> can be assigned there, and they must have <i class='fa-solid fa-hammer'></i> on the currently rolled side. All <i class='fa-solid fa-hammer'></i> from that side are distributed among the unemployed population at random, making sure they can be used again in the resource-producing buildings. The side of the worker that actually took the Union Representative job is left devoid of <i class='fa-solid fa-hammer'></i>, however.<br>If at least five <i class='fa-solid fa-hammer'></i> symbols were distributed that way, the job also produces <i class='fa-solid fa-landmark'></i> <span class='bold'>1</span>.<br>Glory to the Revolution!",
    "possible": function() {
        return game.player.laws.economic == "socialism";
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let production = { "bureaucracy": 0 };

        for (let die of staff) {
            if (die == null) continue;
            if (helpers.get(die.get_side().symbols, "production", 0) >= 5) production.bureaucracy += 1;
        }

        return production;
    },
    "effect": function(staff) {
        // Gather all free citizens
        let free_citizens = {};
        let citizen_count = 0;
        for (let citizen_id in game.player.citizens) {
            if (game.elements.dice.is_unemployed(game.player.citizens[citizen_id])) {
                free_citizens[citizen_id] = true;
                citizen_count += 1;
            }
        }

        if (citizen_count > 0) {
            for (let die of staff) {
                if (die == null) continue;
                
                let hammers = helpers.get(die.get_side().symbols, "production", 0);
                die.add_symbol("production", -hammers);
                for (let i = 0; i < hammers; i++) {
                    let random_citizen = helpers.random_key(free_citizens);
                    game.player.citizens[random_citizen].add_symbol("production", 1, helpers.randint(5));
                }
            }
        }
    }
};

game.data.buildings.temple = {
    "name": "Temple",
    "desc": "No <span class='class-peasant'>Peasants</span><br>Convert to <span class='class-priest'>Priest</span><br>Lose all positive symbols<br>Add <i class='fa-solid fa-satellite-dish decrease'></i> to all sides<br>Add <span class='conditional' data-condition='no_fanaticism' data-conditional_class='no-display'><i class='fa-solid fa-sun'></i></span><span class='conditional' data-condition='fanaticism_is_the_best' data-conditional_class='no-display'><i class='fa-solid fa-sun'></i><i class='fa-solid fa-sun'></i></span><span class='conditional' data-condition='indoctrination_is_the_best' data-conditional_class='no-display'><i class='fa-solid fa-sun'></i><i class='fa-solid fa-sun'></i><i class='fa-solid fa-sun'></i></span><span class='conditional' data-condition='missionary_is_the_best' data-conditional_class='no-display'><i class='fa-solid fa-sun'></i>\xd74</span><span class='conditional' data-condition='zealotry_is_the_best' data-conditional_class='no-display'><i class='fa-solid fa-sun'></i>\xd75</span> to <span class='conditional' data-condition='no_anthropology' data-conditional_class='no-display'><span class='bold'>1</span> side</span><span class='conditional' data-condition='anthropology_is_the_best' data-conditional_class='no-display'><span class='bold'>1</span> and <span class='bold'>2</span> sides</span><span class='conditional' data-condition='mythology_is_the_best' data-conditional_class='no-display'><span class='bold'>1</span>-<span class='bold'>3</span> sides</span><span class='conditional' data-condition='archaeology_is_the_best' data-conditional_class='no-display'><span class='bold'>1</span>-<span class='bold'>4</span> sides</span><span class='conditional' data-condition='merchandising_is_the_best' data-conditional_class='no-display'><span class='bold'>1</span>-<span class='bold'>5</span> sides</span>",
    "help_desc": "This village job provides a way to passively produce <i class='fa-solid fa-sun'></i>. A person employed there (which must not be a <span class='class-peasant'>Peasant</span>) becomes a <span class='class-priest'>Priest</span> and acquires <i class='fa-solid fa-sun'></i> symbols based on researched technologies. All other symbols are removed; this includes <i class='fa-solid fa-sun'></i> symbols if a you send a Priest to work there again. In addition, every side of the newly-minted Priest gets a <i class='fa-solid fa-satellite-dish decrease'></i> symbol, as priesthood is a very public class.",
    "possible": function() {
        return game.conditionals.get("research_theology")
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;

            die.class = "priest";
            for (let resource in game.data.resources) {
                if (!helpers.get(game.data.resources[resource], "negative", false)) {
                    for (let i = 0; i < 6; i++) {
                        die.add_symbol(resource, -helpers.get(die.get_side(i).symbols, resource, 0), i);
                    }
                }
            }

            for (let i = 0; i < 6; i++) {
                if (!game.prestige.avoid_detection_roll()) die.add_symbol("detection", 1, i);
            }

            die.add_symbol("hope", 1, 0);
            if (game.conditionals.get("research_fanaticism")) die.add_symbol("hope", 1, 0);
            if (game.conditionals.get("research_indoctrination")) die.add_symbol("hope", 1, 0);
            if (game.conditionals.get("research_missionary")) die.add_symbol("hope", 1, 0);
            if (game.conditionals.get("research_zealotry")) die.add_symbol("hope", 1, 0);
            if (game.conditionals.get("research_anthropology")) die.add_symbol("hope", 1, 1);
            if (game.conditionals.get("research_mythology")) die.add_symbol("hope", 1, 2);
            if (game.conditionals.get("research_archaeology")) die.add_symbol("hope", 1, 3);
            if (game.conditionals.get("research_merchandising")) die.add_symbol("hope", 1, 4);
        }
    }
};

game.data.buildings.space_probes = {
    "name": "Space Probes",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-sheet-plastic'></i> on current side<br>Gain progress per <i class='fa-solid fa-sheet-plastic'></i><br>Full: add <i class='fa-solid fa-flask'></i> production",
    "help_desc": "This village job is a way to produce unlimited <i class='fa-solid fa-flask'></i> without worker involvement, but you need to invest into setting it up first. Only <span class='class-specialist'>Specialists</span> can work here, and they must have at least one <i class='fa-solid fa-sheet-plastic'></i> on the current side. Rolled <i class='fa-solid fa-sheet-plastic'></i> represent the total amout of work done constructing and launching additional space probes; for each <i class='fa-solid fa-sheet-plastic'></i> symbol rolled, one unit of progress is added. Once the progressbar fills up, the building gains a permanent income of <i class='fa-solid fa-flask'></i> <span class='bold'>1</span>.",
    "possible": function() {
        return game.conditionals.get("research_space_probes");
    },
    "build_cost": { "production": 10000, "plastic": 500 },
    "init": function(player) {
        player.buildings.space_probes.production = 0;
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "science": game.player.buildings.space_probes.production };
        return total_production;
    },
    "progress": {
        "max": 6,
        "growth": function(staff) {
            let total_growth = 0;
            for (let die of staff) {
                if (die == null) continue;
                total_growth += helpers.get(die.get_side().symbols, "plastic", 0);
            }
            return total_growth;
        },
        "reset": false,
        "fill_production": function(fills) {
            return { "science": fills }
        },
        "fill_effect": function(fills) {
            game.player.buildings.space_probes.production += fills;
        }
    }
};

game.data.buildings.construct_generational_ship = {
    "name": "Construct Generational Ship",
    "desc": "<span class='class-specialist'>Specialists</span> only<br>Needs <i class='fa-solid fa-hammer'></i> on current side<br>Spend <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>15</span>, <i class='fa-solid fa-tree'></i> <span class='bold'>5</span>, <i class='fa-solid fa-cube'></i> <span class='bold'>5</span>, <i class='fa-solid fa-gem'></i> <span class='bold'>3</span>, <i class='fa-solid fa-sheet-plastic'></i> <span class='bold'>1</span> per <i class='fa-solid fa-hammer'></i>",
    "help_desc": "This village job is tasked with the construction of a Generational Ship, necessary to win the game. Only <span class='class-specialist'>Specialists</span> can work on this project. A total of <i class='fa-solid fa-hammer'></i> <span class='bold'>1000</span> symbols must be invested into the project, along with <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>15</span>, <i class='fa-solid fa-tree'></i> <span class='bold'>5</span>, <i class='fa-solid fa-cube'></i> <span class='bold'>5</span>, <i class='fa-solid fa-gem'></i> <span class='bold'>3</span>, <i class='fa-solid fa-sheet-plastic'></i> <span class='bold'>1</span> per a <i class='fa-solid fa-hammer'></i> symbol. When the ship is constructed, you will need to select a colonist for it as well.",
    "possible": function() {
        return game.conditionals.get("research_project_genesis") && !game.conditionals.get("generational_ship_constructed");
    },
    "slots": {
        "max": 2,
        "current": function() { return game.prestige.modify_current_slots(1); }
    },
    "production": function(staff) {
        let total_production = { "wheat": 0, "wood": 0, "stone": 0, "metal": 0, "plastic": 0 };
        for (let die of staff) {
            if (die == null) continue;
            let progress = helpers.get(die.get_side().symbols, "production", 0);
            total_production.wheat -= 15 * progress;
            total_production.wood -= 5 * progress;
            total_production.stone -= 5 * progress;
            total_production.metal -= 3 * progress;
            total_production.plastic -= 1 * progress;
        }
        return total_production;
    },
    "show_production": false,
    "progress": {
        "max": 1000,
        "growth": function(staff) {
            let total_growth = 0;
            for (let die of staff) {
                if (die == null) continue;
                total_growth += helpers.get(die.get_side().symbols, "production", 0);
            }
            return total_growth;
        },
        "reset": true,
        "fill_effect": function(fills) {
            game.player.temporary_flags.generational_ship_constructed = true;
        }
    }
};

game.data.buildings.generational_ship = {
    "name": "Generational Ship",
    "desc": "Needs <i class='fa-solid fa-wheat-awn'></i> <i class='fa-solid fa-tree'></i> <i class='fa-solid fa-cube'></i> <i class='fa-solid fa-gem'></i> <i class='fa-solid fa-sheet-plastic'></i> <i class='fa-solid fa-hammer'></i> <i class='fa-solid fa-bolt'></i> <i class='fa-solid fa-flask'></i> <i class='fa-solid fa-sack-dollar'></i> <i class='fa-solid fa-landmark'></i> <i class='fa-solid fa-sun'></i> rolled<br>Win the game!",
    "help_desc": "This village job wins you the game. Just send a person that has all of <i class='fa-solid fa-wheat-awn'></i>, <i class='fa-solid fa-tree'></i>, <i class='fa-solid fa-cube'></i>, <i class='fa-solid fa-gem'></i>, <i class='fa-solid fa-sheet-plastic'></i>, <i class='fa-solid fa-hammer'></i>, <i class='fa-solid fa-bolt'></i>, <i class='fa-solid fa-flask'></i>, <i class='fa-solid fa-sack-dollar'></i>, <i class='fa-solid fa-landmark'></i> and <i class='fa-solid fa-sun'></i> symbols on the current side. After all, the new colony will need a balanced production of resources to develop, so the people skilled in everything are a must. Once you send a citizen into this job, you will win at the end of the year.",
    "possible": function() {
        return game.conditionals.get("generational_ship_constructed") && !game.conditionals.get("generational_ship_launched");
    },
    "slots": {
        "max": 1,
        "current": 1
    },
    "effect": function(staff) {
        for (let die of staff) {
            if (die == null) continue;
            game.player.temporary_flags.generational_ship_launched = true;
            game.game.show_win_screen();
        }
    }
};
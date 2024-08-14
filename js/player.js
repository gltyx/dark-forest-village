class Player {
    constructor() {
        this.tab = "village";
        this.help_tab = "basics";
        this.resources = {};

        for (let resource in game.data.resources) {
            this.resources[resource] = helpers.get(game.data.resources[resource], "default", 0);
        }

        this.year = 1;
        this.last_year_ts = 0;
        this.population_limit = 5;
        this.citizens = {};
        for (let i = 0; i < 3; i++) {
            let id = helpers.generate_id();
            while (id in this.citizens) id = helpers.generate_id();
            this.citizens[id] = game.elements.dice.create();
            this.citizens[id].roll();
        }
        this.buildings = {};
        game.elements.buildings.player_init(this);

        this.settings = {};
        game.tech.settings.player_init(this);

        this.researches = [];
        game.elements.researches.player_init(this, true);

        this.prestige_upgrades = {};
        game.elements.prestige_upgrades.player_init(this);

        this.laws = {};
        game.elements.laws.player_init(this);

        this.stats = {};
        game.tech.stats.player_init(this);

        this.temporary_flags = {}; // Variables for one-time unlocks during a given reset
        this.flags = {}; // Variables for one-time unlocks

        this.current_event = null;

        this.locations = {}; // A reverse array for citizens

        this.cursor_die = null;
    };

    init() {
        game.elements.tabs.select(this.tab);
        game.elements.tabs.select_help(this.help_tab);
        game.elements.buildings.load_init();
        game.elements.prestige_upgrades.load_init();
        game.elements.laws.load_init();
        game.tech.settings.load_init();

        // We will need to drop Aether dice into the population tray
        // Gather info about their classes and numbers
        let aether_dice = {};
        for (let citizen_class in game.data.citizen_classes) {
            aether_dice[citizen_class] = [];
            for (let i = 0; i < 6; i++) aether_dice[citizen_class].push([]);
        }

        // Place citisens where they belong
        for (let id in this.citizens) {
            if (this.citizens[id].location.place == "aether") {
                aether_dice[this.citizens[id].class][this.citizens[id].rolled].push(id);
            }
            else {
                let die = game.elements.dice.render(this.citizens[id]);
                die.id = "die_" + id;
                die.dataset.id = id;
                document.getElementById("location_" + this.citizens[id].location.place + "_" + this.citizens[id].location.id).appendChild(die);

                // Populate reverse array
                this.locations[this.citizens[id].location.place][this.citizens[id].location.id] = id;
            }
        }

        // Now place aether dice
        let last_population_index = 0;
        for (let citizen_class in aether_dice) {
            for (let i = 0; i < 6; i++) {
                for (let id of aether_dice[citizen_class][i]) {
                    while (this.locations.population[last_population_index] !== null) last_population_index++;
                    this.citizens[id].location.place = "population";
                    this.citizens[id].location.id = last_population_index;

                    // Create a die
                    let die = game.elements.dice.render(this.citizens[id]);
                    die.id = "die_" + id;
                    die.dataset.id = id;
                    document.getElementById("location_" + this.citizens[id].location.place + "_" + this.citizens[id].location.id).appendChild(die);

                    // Populate reverse array
                    this.locations[this.citizens[id].location.place][this.citizens[id].location.id] = id;
                }
            }
        }

        // Update seen resource flags based on dice and their production
        for (let id in this.citizens) {
            for (let i = 0; i < 6; i++) {
                for (let symbol in this.citizens[id].sides[i].symbols) {
                    if (this.citizens[id].sides[i].symbols[symbol] > 0) {
                        this.temporary_flags["seen_" + symbol] = true;
                        this.flags["help_seen_" + symbol] = true;
                    }
                }
            }

            this.temporary_flags["seen_class_" + this.citizens[id].class] = true;
            this.flags["help_seen_class_" + this.citizens[id].class] = true;
        }

        // Open event if needed
        if (this.current_event != null) game.tech.open_event(this.current_event);
        else game.tech.close_event();

        // Show win screen if needed
        if (this.stats.won) game.game.show_win_screen();
        else game.game.close_win_screen();
    };

    // Game functions

    add_resource(resource, amount) {
        if (game.player.resources[resource] != constants.INFINITY) game.player.resources[resource] += amount;
        // Attack is capped at 2
        if (resource == "attack" && game.player.resources[resource] != constants.INFINITY && game.player.resources[resource] < 2) game.player.resources[resource] = 2;

        // Set seen flags
        if (amount != 0) {
            this.temporary_flags["seen_" + resource] = true;
            this.flags["help_seen_" + resource] = true;
        }

        // Update stats
        if (resource == "hope" && amount >= 0) this.stats.hope_earned += amount;
    }

    // Helpers

    can_afford(cost) {
        for (let resource in cost) {
            if (this.resources[resource] != constants.INFINITY && this.resources[resource] < cost[resource]) return false;
        }
        return true;
    }

    buy(cost) {
        if (!this.can_afford(cost)) return false;
        for (let resource in cost) {
            if (this.resources[resource] != constants.INFINITY) this.resources[resource] -= cost[resource];
        }
        return true;
    }

    add_citizen(die) {
        // Check if there is a free slot first
        let citizen_count = 0;
        for (let citizen_id in this.citizens) citizen_count++;
        if (citizen_count >= this.population_limit) return;

        this.cleanup();

        let id = helpers.generate_id();
        while (id in this.citizens) id = helpers.generate_id();
        this.citizens[id] = die;
        this.citizens[id].roll();

        this.init();
    }

    remove_citizen(citizen_id) {
        this.cleanup();
        delete this.citizens[citizen_id];
        this.init();
    }

    citizen_count() {
        let count = 0;
        for (let citizen_id in this.citizens) count++;
        return count;
    }

    // Resets

    prestige() {
        this.add_resource("hope", game.prestige.hope_gain_formula());

        if (this.year == 1) this.stats.prestiged_year_1 += 1;
        else this.stats.prestiged += 1;

        this.cleanup();

        for (let resource in game.data.resources) {
            if (helpers.get(game.data.resources[resource], "reset", true))
                this.resources[resource] = helpers.get(game.data.resources[resource], "default", 0);
        }

        // r23: starting max detection is higher
        this.resources.detection_max = game.prestige.base_detection_max();

        this.temporary_flags = {};
        this.tab = "prestige";

        this.year = 1;
        // r42: start with more population limit
        this.population_limit = game.elements.prestige_upgrades.get_effect("r42");
        this.citizens = {};
        for (let i = 0; i < 3; i++) {
            let id = helpers.generate_id();
            while (id in this.citizens) id = helpers.generate_id();
            this.citizens[id] = game.elements.dice.create();
            this.citizens[id].roll();

            // reroll_ones
            if (this.prestige_upgrades.reroll_ones.level > 0 && this.prestige_upgrades.reroll_ones.toggle) {
                if (this.citizens[id].rolled == 0) this.citizens[id].roll();
            }

            // Self-Sufficiency: start with a wheat
            if (this.prestige_upgrades.self_sufficiency.level > 0) this.citizens[id].add_symbol("wheat", 1, 0);
        }
        this.buildings = {};
        game.elements.buildings.player_init(this);

        this.researches = [];
        game.elements.researches.player_init(this);

        this.laws = {};
        game.elements.laws.player_init(this);

        this.current_event = null;

        this.cursor_die = null;

        this.init();
        game.render_loop();
        game.game.save();
        // Also save backup
        game.game.save("backup");
    };

    // Reset and next turn cleanup
    cleanup() {
        // Citizen cleanup
        for (let id in this.citizens) {
            if (document.getElementById("die_" + id)) {
                document.getElementById("die_" + id).parentElement.removeChild(document.getElementById("die_" + id));
            }
        }

        // Reverse location array cleanup
        for (let place in this.locations) {
            for (let id in this.locations[place]) {
                this.locations[place][id] = null;
            }
        }
    };

    // Save/load

    save() {
        let save = [];
        save.push(this.tab); // 0
        save.push(this.resources); // 1
        save.push(this.year); // 2
        save.push(this.population_limit); // 3
        let citizen_saves = [];
        for (let id in this.citizens) citizen_saves.push(this.citizens[id].save());
        save.push(citizen_saves); // 4
        save.push(this.temporary_flags); // 5
        save.push(this.flags); // 6
        save.push(this.help_tab); // 7
        save.push(this.current_event); // 8
        save.push(this.buildings); // 9
        save.push(this.settings); // 10
        save.push(this.researches); // 11
        save.push(this.prestige_upgrades); // 12
        save.push(this.laws); // 13
        save.push(this.stats); // 14

        return save;
    };

    load(save) {
        this.cleanup();

        this.tab = save[0];
        for (let resource in game.data.resources) {
            if (resource in save[1]) {
                this.resources[resource] = save[1][resource];
            }
        }
        this.year = save[2];
        this.population_limit = save[3];
        this.citizens = {};
        for (let citizen of save[4]) {
            let id = helpers.generate_id();
            while (id in this.citizens) id = helpers.generate_id();
            this.citizens[id] = game.elements.dice.create();
            this.citizens[id].load(citizen);
        }
        this.temporary_flags = save[5];
        this.flags = save[6];
        this.help_tab = save[7];
        this.current_event = save[8];
        for (let building_id in save[9]) {
            for (let key in save[9][building_id]) {
                this.buildings[building_id][key] = save[9][building_id][key];
            }
        }
        for (let setting_id in save[10]) {
            this.settings[setting_id] = save[10][setting_id];
        }
        this.researches = save[11];
        for (let upgrade_id in save[12]) {
            this.prestige_upgrades[upgrade_id] = save[12][upgrade_id];
        }
        for (let category_id in save[13]) {
            if (save[13][category_id] != null)
                this.laws[category_id] = save[13][category_id];
        }
        for (let stat in save[14]) {
            this.stats[stat] = save[14][stat];
        }

        this.cursor_die = null;

        this.init();
        game.render_loop();
    };
};
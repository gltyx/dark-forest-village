game.elements.buildings = {};

game.elements.buildings.player_init = function(player) {
    for (let building_id in game.data.buildings) {
        player.buildings[building_id] = {
            "built": false
        };
        if (!("build_cost" in game.data.buildings[building_id])) player.buildings[building_id].built = true;

        // Extras
        if ("progress" in game.data.buildings[building_id]) player.buildings[building_id].progress = 0;
        if ("choice" in game.data.buildings[building_id]) player.buildings[building_id].choice = game.data.buildings[building_id].default_choice;

        // Init
        if ("init" in game.data.buildings[building_id]) game.data.buildings[building_id].init(player);
    }
};

game.elements.buildings.load_init = function() {
    // Run choice selection for choice buildings
    for (let building_id in game.data.buildings) {
        if ("choice" in game.data.buildings[building_id]) game.elements.buildings.select_choice(building_id, game.player.buildings[building_id].choice, true);
    }
};

game.elements.buildings.init = function() {
    let village_frag = document.createDocumentFragment();
    let help_frag = document.createDocumentFragment();

    for (let building_id in game.data.buildings) {
        // Village element:
        let village_building = document.createElement("div");
        village_building.classList.add("building");
        village_building.dataset.building = building_id;
        // name
        let building_name_holder = document.createElement("div");
        building_name_holder.classList.add("name-holder");
        let building_name = document.createElement("p");
        building_name.classList.add("name");
        building_name.textContent = game.data.buildings[building_id].name;
        building_name_holder.appendChild(building_name);
        village_building.appendChild(building_name_holder);
        // desc
        let building_desc_holder = document.createElement("div");
        building_desc_holder.classList.add("desc");
        let building_desc = document.createElement("p");
        building_desc.innerHTML = game.data.buildings[building_id].desc;
        building_desc_holder.appendChild(building_desc);
        village_building.appendChild(building_desc_holder);
        // dice-tray
        let building_dice_tray = document.createElement("div");
        building_dice_tray.classList.add("dice-tray");
        building_dice_tray.dataset.dice = game.data.buildings[building_id].slots.max;
        building_dice_tray.dataset.location = building_id;
        village_building.appendChild(building_dice_tray);
        // production-holder
        let building_production_holder = document.createElement("div");
        building_production_holder.classList.add("production-holder");
        village_building.appendChild(building_production_holder);
        // extras-holder
        let building_extras_holder = document.createElement("div");
        building_extras_holder.classList.add("extras-holder");
        // --- progress
        if ("progress" in game.data.buildings[building_id]) {
            let progressbar = document.createElement("div");
            progressbar.classList.add("progressbar");

            let progressbar_growth = document.createElement("div");
            progressbar_growth.classList.add("growth");
            progressbar.appendChild(progressbar_growth);

            let progressbar_current = document.createElement("div");
            progressbar_current.classList.add("current");
            progressbar.appendChild(progressbar_current);

            let progressbar_status = document.createElement("p");
            progressbar_status.classList.add("status");
            progressbar.appendChild(progressbar_status);

            building_extras_holder.appendChild(progressbar);
        }
        // --- choice
        if ("choice" in game.data.buildings[building_id]) {
            let choice_list = document.createElement("div");
            choice_list.classList.add("choice-list");

            for (let choice_id in game.data.buildings[building_id].choice) {
                let choice_option = document.createElement("div");
                choice_option.classList.add("choice");
                choice_option.classList.add("choice-" + building_id);
                choice_option.dataset.building = building_id;
                choice_option.dataset.choice = choice_id;
                choice_option.onclick = function() { game.elements.buildings.select_choice(building_id, choice_id); };
                choice_option.innerHTML = game.data.buildings[building_id].choice[choice_id];
                choice_list.appendChild(choice_option);
            }

            building_extras_holder.appendChild(choice_list);
        }
        // --- support
        if ("support" in game.data.buildings[building_id]) {
            let progressbar = document.createElement("div");
            progressbar.classList.add("progressbar");

            let progressbar_current = document.createElement("div");
            progressbar_current.classList.add("current");
            progressbar.appendChild(progressbar_current);

            let progressbar_status = document.createElement("p");
            progressbar_status.classList.add("status");
            progressbar.appendChild(progressbar_status);

            building_extras_holder.appendChild(progressbar);
        }
        village_building.appendChild(building_extras_holder);
        // purchase
        if ("build_cost" in game.data.buildings[building_id]) {
            let purchase_button = document.createElement("div");
            purchase_button.classList.add("purchase");
            purchase_button.classList.add("button");
            purchase_button.onclick = function() { game.elements.buildings.buy(building_id); };
            purchase_button.appendChild(game.render.resource_cost(game.data.buildings[building_id].build_cost));
            village_building.appendChild(purchase_button);
        }

        village_frag.appendChild(village_building);

        let help_entry = document.createElement("p");
        help_entry.classList.add("conditional");
        help_entry.dataset.condition = "help_seen_building_" + building_id;
        help_entry.dataset.conditional_class = "no-display";
        help_entry.innerHTML = "<span class='bold'>" + game.data.buildings[building_id].name + "</span><br>" + game.data.buildings[building_id].help_desc;

        help_frag.appendChild(help_entry);
    }

    document.getElementById("village_buildings").appendChild(village_frag);
    document.getElementById("help_village_buildings").appendChild(help_frag);

    // Run choice selection for choice buildings
    for (let building_id in game.data.buildings) {
        game.elements.buildings.select_choice(building_id, game.player.buildings[building_id].choice, true);
    }
};

game.elements.buildings.render = function() {
    // Process buildings
    for (let element of document.getElementsByClassName("building")) {
        let building_id = element.dataset.building;

        // Built
        if (game.player.buildings[building_id].built) element.classList.add("built");
        else element.classList.remove("built");

        // Possible
        if ("possible" in game.data.buildings[building_id] && !(game.data.buildings[building_id].possible())) {
            element.classList.add("no-display");
        }
        else {
            element.classList.remove("no-display");
            game.player.temporary_flags["seen_building_" + building_id] = true;
            game.player.flags["help_seen_building_" + building_id] = true;
        }

        // Dice slots
        let current_dice_slots = helpers.resolve(game.data.buildings[building_id].slots.current);
        for (let inner_element of element.getElementsByClassName("dice-holder")) {
            if (inner_element.dataset.index < current_dice_slots) inner_element.classList.remove("no-display");
            else inner_element.classList.add("no-display");
        }

        // Production
        if ("production" in game.data.buildings[building_id] && helpers.get(game.data.buildings[building_id], "show_production", true)) {
            let building_production = game.data.buildings[building_id].production(game.elements.buildings.get_staff(building_id));
            // Caste System
            if (game.player.laws.social == "caste_system") {
                if (game.player.locations[building_id][0] != null && game.player.locations[building_id][1] != null && game.elements.dice.are_same_class(game.player.citizens[game.player.locations[building_id][0]], game.player.citizens[game.player.locations[building_id][1]])) {
                    // Double!
                    for (let resource in building_production) {
                        building_production[resource] *= 2;
                    }
                }
            }
            // fill_production
            if ("progress" in game.data.buildings[building_id] && "fill_production" in game.data.buildings[building_id].progress) {
                let fill_production = game.data.buildings[building_id].progress.fill_production(game.elements.buildings.total_fills(building_id));
                for (let resource in fill_production) {
                    if (!(resource in building_production)) building_production[resource] = 0;
                    building_production[resource] += fill_production[resource];
                }
                // Caste System
                if (game.player.laws.social == "caste_system") {
                    if (game.player.locations[building_id][0] != null && game.player.locations[building_id][1] != null && game.elements.dice.are_same_class(game.player.citizens[game.player.locations[building_id][0]], game.player.citizens[game.player.locations[building_id][1]])) {
                        // Double!
                        for (let resource in fill_production) {
                            if (!(resource in building_production)) building_production[resource] = 0;
                            building_production[resource] += fill_production[resource];
                        }
                    }
                }
            }

            for (let inner_element of element.getElementsByClassName("production-holder")) {
                inner_element.innerHTML = "";
                for (let resource in building_production) {
                    if (building_production[resource] == 0) continue;
                    let resource_holder = document.createElement("p");
                    if (helpers.get(game.data.resources[resource], "negative", false)) resource_holder.classList.add("decrease");
                    resource_holder.innerHTML = (building_production[resource] > 0 ? "+" : "") + helpers.number_format(building_production[resource]) + " <i class='" + game.data.resources[resource].class + "'></i>";
                    inner_element.appendChild(resource_holder);
                }
            }
        }

        // Choices
        if ("choice_possible" in game.data.buildings[building_id]) {
            for (let inner_element of element.getElementsByClassName("choice-list")) {
                if (game.data.buildings[building_id].choice_possible()) inner_element.classList.remove("no-display");
                else inner_element.classList.add("no-display");
            }
        }

        // Progress
        if ("progress" in game.data.buildings[building_id]) {
            for (let inner_element of element.getElementsByClassName("progressbar")) {
                inner_element.style.setProperty("--max", helpers.resolve(game.data.buildings[building_id].progress.max));
                inner_element.style.setProperty("--current", game.player.buildings[building_id].progress);
                inner_element.style.setProperty("--growth", game.data.buildings[building_id].progress.growth(game.elements.buildings.get_staff(building_id)));
                for (let inner_inner_element of inner_element.getElementsByClassName("status")) {
                    let progress_growth = game.data.buildings[building_id].progress.growth(game.elements.buildings.get_staff(building_id));
                    if (progress_growth > 0) inner_inner_element.textContent = game.player.buildings[building_id].progress + "\uFF0F" + helpers.resolve(game.data.buildings[building_id].progress.max) + " + " + progress_growth;
                    else inner_inner_element.textContent = game.player.buildings[building_id].progress + "\uFF0F" + helpers.resolve(game.data.buildings[building_id].progress.max);
                }
            }
        }

        // Support
        if ("support" in game.data.buildings[building_id]) {
            let support_value = game.data.buildings[building_id].support(game.elements.buildings.get_staff(building_id));

            for (let inner_element of element.getElementsByClassName("progressbar")) {
                inner_element.style.setProperty("--max", 1);
                inner_element.style.setProperty("--current", support_value);
                for (let inner_inner_element of inner_element.getElementsByClassName("status")) {
                    inner_inner_element.textContent = Math.round(support_value * 100) + "%";
                }
            }
        }

        // Purchase button
        if ("build_cost" in game.data.buildings[building_id] && !game.player.buildings[building_id].built) {
            for (let inner_element of element.getElementsByClassName("purchase")) {
                if (game.player.can_afford(game.data.buildings[building_id].build_cost)) inner_element.classList.remove("disabled");
                else inner_element.classList.add("disabled");
            }
        }
    }
};

// Game-related stuff

game.elements.buildings.get_staff = function(building_id) {
    let staff = [];
    for (let citizen_id of game.player.locations[building_id]) {
        if (citizen_id == null) staff.push(null)
        else staff.push(game.player.citizens[citizen_id]);
    }
    return staff;
}

game.elements.buildings.buy = function(building_id) {
    if (game.player.buy(game.data.buildings[building_id].build_cost)) {
        game.player.buildings[building_id].built = true;
        if ("on_build" in game.data.buildings[building_id]) game.data.buildings[building_id].on_build();
        game.render_loop();
    }
}

game.elements.buildings.select_choice = function(building_id, choice_id, init=false) {
    game.player.buildings[building_id].choice = choice_id;
    for (let element of document.getElementsByClassName("choice-" + building_id)) {
        if (element.dataset.choice == choice_id) element.classList.add("selected");
        else element.classList.remove("selected");
    }
    if (!init) game.render_loop();
}

game.elements.buildings.total_fills = function(building_id) {
    if (!("progress" in game.data.buildings[building_id])) return 0;
    let total_progress = game.player.buildings[building_id].progress + game.data.buildings[building_id].progress.growth(game.elements.buildings.get_staff(building_id));
    if (total_progress < helpers.resolve(game.data.buildings[building_id].progress.max)) return 0;
    if (helpers.get(game.data.buildings[building_id].progress, "reset", false)) return 1;
    return Math.floor(total_progress / helpers.resolve(game.data.buildings[building_id].progress.max));
}

// Empty the building
game.elements.buildings.empty = function(building_id) {
    let free_population_slot = 0;
    for (let i in game.player.locations[building_id]) {
        if (game.player.locations[building_id][i] == null) continue;
        while (game.player.locations.population[free_population_slot] != null) free_population_slot += 1;
        game.player.citizens[game.player.locations[building_id][i]].location.place = "population";
        game.player.citizens[game.player.locations[building_id][i]].location.id = free_population_slot;

        game.player.locations.population[free_population_slot] = game.player.locations[building_id][i];
        document.getElementById("location_population_" + free_population_slot).appendChild(document.getElementById("die_" + game.player.locations[building_id][i]));
        game.player.locations[building_id][i] = null;
    }
}
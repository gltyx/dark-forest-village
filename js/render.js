game.render_loop = function() {
    // Recalculate some classes
    document.getElementById("new_turn").classList.remove("disabled");

    // Set years
    for (let element of document.getElementsByClassName("current-year")) {
        element.textContent = "Year " + game.player.year;
    }

    // Enable/disable new turn button
    if (game.game.can_do_next_year()) {
        document.getElementById("new_turn").classList.remove("disabled");
    }
    else {
        document.getElementById("new_turn").classList.add("disabled");
    }

    // Fix resource and production numbers
    let production = game.resource_production();
    for (let element of document.getElementsByClassName("resource")) {
        let resource = element.dataset.resource;
        for (let inner_element of element.getElementsByClassName("amount")) {
            inner_element.textContent = helpers.number_format(game.player.resources[resource]);
        }
        if (!helpers.get(game.data.resources[resource], "negative", false)) {
            for (let inner_element of element.getElementsByClassName("increase")) inner_element.textContent = "+"+helpers.number_format(production[resource].increase);
            for (let inner_element of element.getElementsByClassName("decrease")) inner_element.textContent = "-"+helpers.number_format(production[resource].decrease);
        }
        else {
            for (let inner_element of element.getElementsByClassName("decrease")) inner_element.textContent = "+"+helpers.number_format(production[resource].increase);
            for (let inner_element of element.getElementsByClassName("increase")) inner_element.textContent = "-"+helpers.number_format(production[resource].decrease);
        }

        // Detection is a special case
        if (resource == "detection") {
            for (let inner_element of element.getElementsByClassName("limit")) inner_element.textContent = "\uFF0F"+helpers.number_format(game.player.resources.detection_max);
        }

        if (game.player.resources[resource] >= 0 && game.player.resources[resource] + production[resource].increase - production[resource].decrease < 0) {
            element.classList.add("warning");
        }
        else element.classList.remove("warning");
    }

    // Some special resource numbers for detection progressbar
    for (let element of document.getElementsByClassName("detection-meter")) {
        for (let inner_element of element.getElementsByClassName("progressbar")) {
            inner_element.style.setProperty("--detection-max", game.player.resources.detection_max);
            inner_element.style.setProperty("--detection-current", game.player.resources.detection);
            inner_element.style.setProperty("--detection-growth", production.detection.increase);
        }
        // Fix invaders name
        for (let inner_element of element.getElementsByClassName("invaders")) {
            let invaders_name = null;
            let invaders_power = -Infinity;
            for (let threshold in game.data.enemy_names) {
                if (threshold > game.player.resources.attack) continue;
                if (threshold > invaders_power) {
                    invaders_name = game.data.enemy_names[threshold];
                    invaders_power = +threshold;
                }
            }
            inner_element.textContent = invaders_name;
        }
    }

    // Some special handling of attack vs. defense and detection meter
    let attack = game.player.resources.attack + production.attack.increase - production.attack.decrease;
    if (game.player.resources.attack == constants.INFINITY) attack = constants.INFINITY;
    let defense = game.player.resources.defense + production.defense.increase - production.defense.decrease;

    for (let element of document.getElementsByClassName("detection-consequences")) {
        for (let inner_element of element.getElementsByClassName("prediction")) {
            if (attack == constants.INFINITY || attack > defense) {
                inner_element.classList.add("decrease");
                inner_element.classList.remove("increase");
                inner_element.textContent = "Will lose";
            }
            else {
                inner_element.classList.add("increase");
                inner_element.classList.remove("decrease");
                inner_element.textContent = "Will win";
            }
        }
        if ((attack == constants.INFINITY || attack > defense) && game.player.resources.detection_max <= game.player.resources.detection + production.detection.increase - production.detection.decrease) {
            element.classList.add("warning");
        }
        else {
            element.classList.remove("warning");
        }
    }

    // Fist Strike button
    for (let element of document.getElementsByClassName("first-strike")) {
        if (game.player.resources.attack == constants.INFINITY || game.player.resources.attack > game.player.resources.defense) element.classList.add("disabled");
        else element.classList.remove("disabled");
    }

    // Lock population slots
    for (let i = 0; i < constants.MAX_POPULATION; i++) {
        if (document.getElementById("location_population_" + i).classList.contains("buyable")) {
            for (let element of document.getElementById("location_population_" + i).getElementsByClassName("resource-cost"))
                element.parentElement.removeChild(element);
        }

        if (i > game.player.population_limit) document.getElementById("location_population_" + i).classList.add("locked");
        else document.getElementById("location_population_" + i).classList.remove("locked");

        if (i == game.player.population_limit) {
            document.getElementById("location_population_" + i).classList.remove("locked");
            document.getElementById("location_population_" + i).classList.add("buyable");
            let resource_cost = helpers.get(game.data.population_slot_cost, i, {});
            document.getElementById("location_population_" + i).appendChild(game.render.resource_cost(resource_cost));
            if (!game.player.can_afford(resource_cost)) document.getElementById("location_population_" + i).classList.add("disabled");
            else document.getElementById("location_population_" + i).classList.remove("disabled");
        }
        else {
            document.getElementById("location_population_" + i).classList.remove("buyable");
            document.getElementById("location_population_" + i).classList.remove("disabled");
        }
    }

    // DETECTED
    if (game.conditionals.get("seen_detection") || game.conditionals.get("help_seen_hope")) document.getElementById("app").classList.add("detected");
    else document.getElementById("app").classList.remove("detected");

    // Render calls
    game.elements.buildings.render();
    game.elements.researches.render();
    game.elements.prestige_upgrades.render();
    game.elements.laws.render();
    game.tech.stats.render();

    // Conditional rendering
    for (let element of document.getElementsByClassName("conditional")) {
        if (!game.conditionals.get(element.dataset.condition)) element.classList.add(element.dataset.conditional_class);
        else element.classList.remove(element.dataset.conditional_class);
    }

    // Handle prestige
    for (let element of document.getElementsByClassName("hope-bar")) {
        // Set prestige gain
        let hope_gain = game.prestige.hope_gain_formula();
        for (let inner_element of element.getElementsByClassName("hope-gain-amount")) {
            inner_element.textContent = hope_gain;
        }

        // Set conditions for next prestige unit
        let defense_for_next_hope = game.prestige.defense_needed_for_hope_gain(hope_gain + 1);
        for (let inner_element of element.getElementsByClassName("hope-gain-hint")) {
            if (hope_gain >= 100 || (defense_for_next_hope == null && game.player.resources.attack == constants.INFINITY)) inner_element.classList.add("no-display");
            else {
                inner_element.classList.remove("no-display");
                if (defense_for_next_hope == null) inner_element.innerHTML = "Next when you successfully defend against the next attack";
                else inner_element.innerHTML = "Next at <i class='fa-solid fa-shield-halved'></i> <span class='bold'>" + helpers.number_format(defense_for_next_hope) + "</span>";
            }
        }
    }

    // Event rendering
    if (game.player.current_event != null) {
        for (let element of document.getElementsByClassName("event-window")) { 
            for (let inner_element of element.getElementsByClassName("options")) {
                for (let i = 0; i < inner_element.children.length; i++) {
                    if ("possible" in game.data.events[game.player.current_event].options[i] && !game.data.events[game.player.current_event].options[i].possible()) inner_element.children[i].classList.add("disabled");
                    else inner_element.children[i].classList.remove("disabled");
                }
            }
        }
    }

    // Auto next year
    if (game.player.settings["auto-next-year"] == "on") game.game.next_year();
}
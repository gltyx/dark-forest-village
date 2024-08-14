game.elements.prestige_upgrades = {};

game.elements.prestige_upgrades.player_init = function(player) {
    for (let upgrade_id in game.data.prestige_upgrades) {
        player.prestige_upgrades[upgrade_id] = {
            "level": 0
        }
        if (helpers.get(game.data.prestige_upgrades[upgrade_id], "toggle", false)) player.prestige_upgrades[upgrade_id].toggle = true;
    }
};

game.elements.prestige_upgrades.load_init = function() {
    // Switch toggles
    for (let upgrade_id in game.data.prestige_upgrades) {
        if (helpers.get(game.data.prestige_upgrades[upgrade_id], "toggle", false)) {
            game.elements.prestige_upgrades.flip_toggle(upgrade_id, game.player.prestige_upgrades[upgrade_id].toggle);
        }
    }
};

game.elements.prestige_upgrades.init = function() {
    // Set the upgrades
    for (let element of document.getElementsByClassName("upgrade")) {
        if (!("upgrade" in element.dataset)) continue;

        let element_id = element.dataset.upgrade;
        if (!(element_id in game.data.prestige_upgrades)) continue;

        let desc_holder = document.createElement("div");
        desc_holder.classList.add("desc-holder");

        if ("name" in game.data.prestige_upgrades[element_id]) {
            let upgrade_name = document.createElement("p");
            upgrade_name.classList.add("name");
            upgrade_name.textContent = game.data.prestige_upgrades[element_id].name;
            desc_holder.appendChild(upgrade_name);
        }

        let upgrade_desc = document.createElement("p");
        upgrade_desc.classList.add("desc");
        upgrade_desc.innerHTML = game.data.prestige_upgrades[element_id].desc;
        desc_holder.appendChild(upgrade_desc);

        if (helpers.get(game.data.prestige_upgrades[element_id], "is_repeatable", false)) {
            let upgrade_current = document.createElement("p");
            upgrade_current.classList.add("current");
            upgrade_current.innerHTML = "Current: <span class='bold'>" + helpers.get(game.data.prestige_upgrades[element_id], "effect_formatting", "<span class='amount'></span>") + "</span>";
            desc_holder.appendChild(upgrade_current);

            let upgrade_next = document.createElement("p");
            upgrade_next.classList.add("next");
            upgrade_next.innerHTML = "Next: <span class='bold'>" + helpers.get(game.data.prestige_upgrades[element_id], "effect_formatting", "<span class='amount'></span>") + "</span>";
            desc_holder.appendChild(upgrade_next);
        }

        let cost_holder = document.createElement("div");
        cost_holder.classList.add("cost-holder");
        cost_holder.innerHTML = "<p><i class='fa-solid fa-sun'></i> <span class='bold cost'></span></p>";

        element.appendChild(desc_holder);
        element.appendChild(cost_holder);

        // Toggle
        if (helpers.get(game.data.prestige_upgrades[element_id], "toggle", false)) {
            let toggle = document.createElement("div");
            toggle.classList.add("toggle");
            toggle.id = "upgrade_toggle_" + element_id;

            let on_option = document.createElement("p");
            on_option.classList.add("option");
            on_option.dataset.option = 1;
            on_option.textContent = "On";
            on_option.onclick = function() { game.elements.prestige_upgrades.flip_toggle(element_id, true); };
            toggle.appendChild(on_option);

            let off_option = document.createElement("p");
            off_option.classList.add("option");
            off_option.dataset.option = 0;
            off_option.textContent = "Off";
            off_option.onclick = function() { game.elements.prestige_upgrades.flip_toggle(element_id, false); };
            toggle.appendChild(off_option);

            element.appendChild(toggle);
        }

        element.onclick = function() { game.elements.prestige_upgrades.buy(this.dataset.upgrade); };
    }
};

game.elements.prestige_upgrades.render = function() {
    // Update the upgrades
    for (let element of document.getElementsByClassName("upgrade")) {
        if (!("upgrade" in element.dataset)) continue;

        let element_id = element.dataset.upgrade;
        if (!(element_id in game.data.prestige_upgrades)) continue;

        let is_complete = game.elements.prestige_upgrades.is_complete(element_id);

        if (is_complete) element.classList.add("complete");
        else element.classList.remove("complete");
            
        // Can afford?
        let upgrade_cost = game.elements.prestige_upgrades.get_cost(element_id);
        if (!game.player.can_afford({"hope": upgrade_cost}) && !is_complete) element.classList.add("disabled");
        else element.classList.remove("disabled");

        // Update cost and effects
        for (let inner_element of element.getElementsByClassName("cost")) inner_element.textContent = helpers.number_format(upgrade_cost);

        if (helpers.get(game.data.prestige_upgrades[element_id], "is_repeatable", false)) {
            for (let inner_element of element.getElementsByClassName("current")) {
                for (let inner_inner_element of inner_element.getElementsByClassName("amount")) inner_inner_element.textContent = helpers.roundto(game.elements.prestige_upgrades.get_effect(element_id), 3);
            }
            for (let inner_element of element.getElementsByClassName("next")) {
                for (let inner_inner_element of inner_element.getElementsByClassName("amount")) inner_inner_element.textContent = helpers.roundto(game.elements.prestige_upgrades.get_effect(element_id, game.player.prestige_upgrades[element_id].level + 1), 3);
            }
        }
    }
};

// Tech functions
game.elements.prestige_upgrades.get_cost = function(upgrade_id) {
    if (helpers.get(game.data.prestige_upgrades[upgrade_id], "is_repeatable", false)) {
        return game.data.prestige_upgrades[upgrade_id].cost(game.player.prestige_upgrades[upgrade_id].level + 1);
    }
    else {
        return helpers.resolve(game.data.prestige_upgrades[upgrade_id].cost);
    }
};

game.elements.prestige_upgrades.get_effect = function(upgrade_id, level=null) {
    if (level == null) level = game.player.prestige_upgrades[upgrade_id].level;
    if (!("effect" in game.data.prestige_upgrades[upgrade_id])) return level;

    if (helpers.get(game.data.prestige_upgrades[upgrade_id], "is_repeatable", false)) {
        return game.data.prestige_upgrades[upgrade_id].effect(level);
    }
    else {
        return helpers.resolve(game.data.prestige_upgrades[upgrade_id].effect);
    }
};

game.elements.prestige_upgrades.is_complete = function(upgrade_id) {
    if (!helpers.get(game.data.prestige_upgrades[upgrade_id], "is_repeatable", false) && game.player.prestige_upgrades[upgrade_id].level > 0) return true;
    if (helpers.get(game.data.prestige_upgrades[upgrade_id], "is_repeatable", false) && "max_level" in game.data.prestige_upgrades[upgrade_id] && game.player.prestige_upgrades[upgrade_id].level >= game.data.prestige_upgrades[upgrade_id].max_level) return true;
    return false;
};

game.elements.prestige_upgrades.buy = function(upgrade_id) {
    if (game.elements.prestige_upgrades.is_complete(upgrade_id)) return;
    if (game.player.buy({"hope": game.elements.prestige_upgrades.get_cost(upgrade_id)})) {
        game.player.prestige_upgrades[upgrade_id].level += 1;
        if ("on_purchase" in game.data.prestige_upgrades[upgrade_id]) {
            game.data.prestige_upgrades[upgrade_id].on_purchase();
        }
    }
};

// Toggles
game.elements.prestige_upgrades.flip_toggle = function(upgrade_id, new_option) {
    game.player.prestige_upgrades[upgrade_id].toggle = new_option;
    for (let element of document.getElementById("upgrade_toggle_" + upgrade_id).getElementsByClassName("option")) {
        if (element.dataset.option == new_option) element.classList.add("selected");
        else element.classList.remove("selected");
    }
};
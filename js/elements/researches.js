game.elements.researches = {};

game.elements.researches.player_init = function(player, initial=false) {
    let max_researches = initial ? 3 : game.prestige.researches_available();
    for (let i = 0; i < max_researches; i++) player.researches.push(null);
};

game.elements.researches.render = function() {
    for (let element of document.getElementsByClassName("research-cards")) {
        let max_researches = game.player.researches.length;

        // Create new research slots if needed
        while (element.children.length < max_researches) {
            let research_card = document.createElement("div");
            research_card.classList.add("research-card-slot");
            research_card.dataset.slot = element.children.length;
            research_card.onclick = function() { game.elements.researches.research_slot(this.dataset.slot) };

            let research_name = document.createElement("p");
            research_name.classList.add("name");
            research_card.appendChild(research_name);

            let research_desc = document.createElement("p");
            research_desc.classList.add("desc");
            research_card.appendChild(research_desc);

            let research_cost = document.createElement("p");
            research_cost.classList.add("cost");
            research_cost.innerHTML = "<i class='fa-solid fa-flask'></i> <span class='cost-value'></span>";
            research_card.appendChild(research_cost);

            element.appendChild(research_card);
        }

        // Disable inactive research slots, enable active ones
        for (let i = 0; i < element.children.length; i++) {
            if (i >= max_researches) {
                element.children[i].classList.add("no-display");
            }
            else {
                element.children[i].classList.remove("no-display");
                if (game.player.researches[i] == null) element.children[i].classList.remove("available");
                else {
                    element.children[i].classList.add("available");
                    for (let inner_element of element.children[i].getElementsByClassName("name")) {
                        inner_element.textContent = game.data.researches[game.player.researches[i]].name;
                    }
                    for (let inner_element of element.children[i].getElementsByClassName("desc")) {
                        inner_element.innerHTML = game.data.researches[game.player.researches[i]].desc;
                    }
                    for (let inner_element of element.children[i].getElementsByClassName("cost-value")) {
                        inner_element.textContent = helpers.number_format(game.data.researches[game.player.researches[i]].cost);
                    }
                    
                    if (game.player.can_afford({"science": game.data.researches[game.player.researches[i]].cost})) {
                        element.children[i].classList.remove("disabled");
                    } 
                    else {
                        element.children[i].classList.add("disabled");
                    }
                }
            }
        }
    }
};

game.elements.researches.research_slot = function(slot) {
    if (game.player.researches.length <= slot) return;
    if (game.player.researches[slot] == null) return;
    if (game.player.buy({"science": game.data.researches[game.player.researches[slot]].cost})) {
        game.player.temporary_flags["research_" + game.player.researches[slot]] = true;
        if ("on_research" in game.data.researches[game.player.researches[slot]]) {
            game.data.researches[game.player.researches[slot]].on_research();
        }
        game.player.researches[slot] = null;

        // r24: maybe increase detection max by 1
        if (helpers.percentile_roll(game.elements.prestige_upgrades.get_effect("r24"))) game.player.resources.detection_max += 1;
        // r34: reduce attack
        game.player.add_resource("attack", -Math.floor(game.player.resources.attack * game.elements.prestige_upgrades.get_effect("r34") / 100.0));
    }
};

game.elements.researches.populate = function() {
    // Clean player researches up
    game.player.researches = [];
    game.elements.researches.player_init(game.player);

    // Collect all researches that can show up, together with their weights
    let possible_researches = {};
    let total_weight = 0;
    for (let research_id in game.data.researches) {
        if (game.conditionals.get("research_" + research_id)) continue; // already researched
        if ("possible" in game.data.researches[research_id] && !game.data.researches[research_id].possible()) continue;

        let have_all_prereqs = true;
        if ("prerequisites" in game.data.researches[research_id]) {
            for (let prereq_id of game.data.researches[research_id].prerequisites) {
                if (!game.conditionals.get("research_" + prereq_id)) have_all_prereqs = false;
            }
        }
        if (!have_all_prereqs) continue;

        possible_researches[research_id] = helpers.resolve(game.data.researches[research_id].weight);
        total_weight += possible_researches[research_id];
    }

    // Roll for researches
    for (let i = 0; i < game.player.researches.length; i++) {
        if (total_weight == 0) break;
        let rolled_weight = total_weight * Math.random();
        for (let research_id in possible_researches) {
            rolled_weight -= possible_researches[research_id];
            if (rolled_weight < 0) {
                game.player.researches[i] = research_id;
                total_weight -= possible_researches[research_id];
                break;
            }
        }
        delete possible_researches[game.player.researches[i]];
    } 
}
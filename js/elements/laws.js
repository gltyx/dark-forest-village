game.elements.laws = {};

game.elements.laws.player_init = function(player) {
    player.laws.current_category = null;
    for (let category_id in game.data.law_categories) {
        player.laws[category_id] = null;
        if (player.laws.current_category == null) player.laws.current_category = category_id;
    }

    // Set default laws
    for (let law_id in game.data.laws) {
        if (helpers.get(game.data.laws[law_id], "default", false)) {
            player.laws[game.data.laws[law_id].category] = law_id;
        }
    }
};

game.elements.laws.load_init = function() {
    game.elements.laws.select_category(game.player.laws.current_category);

    // Select current law in each category
    for (let category_id in game.data.law_categories) {
        if (game.player.laws[category_id] != null) {
            game.elements.laws.select_law_in_category(category_id, game.player.laws[category_id]);
        }
    }
};

game.elements.laws.init = function() {
    // Set law category tabs
    for (let element of document.getElementsByClassName("current-laws")) {
        for (let category_id in game.data.law_categories) {
            let current_law = document.createElement("div");
            current_law.classList.add("current-law");
            current_law.dataset.category = category_id;

            let law_category_name = document.createElement("p");
            law_category_name.textContent = game.data.law_categories[category_id];
            current_law.appendChild(law_category_name);

            let law_name = document.createElement("p");
            law_name.classList.add("name");
            law_name.dataset.category = category_id;
            current_law.appendChild(law_name);

            let law_desc = document.createElement("p");
            law_desc.classList.add("desc");
            law_desc.dataset.category = category_id;
            current_law.appendChild(law_desc);

            current_law.onclick = function() { game.elements.laws.select_category(this.dataset.category); };
            element.appendChild(current_law);
        }
    }

    // Set law categories
    let law_category_divs = {};
    for (let category_id in game.data.law_categories) {
        law_category_divs[category_id] = document.createElement("div");
        law_category_divs[category_id].classList.add("law-options");
        law_category_divs[category_id].dataset.category = category_id;
    }

    for (let law_id in game.data.laws) {
        let law_element = document.createElement("div");
        law_element.classList.add("option");
        if (helpers.get(game.data.laws[law_id], "default", false)) law_element.classList.add("default");
        law_element.dataset.law = law_id;

        let law_name = document.createElement("p");
        law_name.classList.add("name");
        law_name.textContent = game.data.laws[law_id].name;
        law_element.appendChild(law_name);

        let law_desc = document.createElement("p");
        law_desc.classList.add("desc");
        law_desc.innerHTML = game.data.laws[law_id].desc;
        law_element.appendChild(law_desc);

        let law_class_opinion_holder = document.createElement("div");
        law_class_opinion_holder.classList.add("class-opinion-holder");
        if (!helpers.get(game.data.laws[law_id], "default", false)) {
            for (let class_id in game.data.laws[law_id].support_threshold) {
                let law_class_opinion = document.createElement("div");
                law_class_opinion.classList.add("class-opinion");
                law_class_opinion.classList.add("conditional");
                law_class_opinion.dataset.condition = "help_seen_class_" + class_id;
                law_class_opinion.dataset.conditional_class = "hidden";

                let law_class_opinion_die = document.createElement("div");
                law_class_opinion_die.classList.add("class-die");
                law_class_opinion_die.classList.add("class-" + class_id);
                law_class_opinion.appendChild(law_class_opinion_die);

                let law_class_opinion_support = document.createElement("p");
                law_class_opinion_support.classList.add("class-support");
                if (game.data.laws[law_id].support_threshold[class_id] < 5) law_class_opinion_support.textContent = (game.data.laws[law_id].support_threshold[class_id] + 1) + "+";
                if (game.data.laws[law_id].support_threshold[class_id] == 5) law_class_opinion_support.textContent = "6";
                if (game.data.laws[law_id].support_threshold[class_id] > 5) law_class_opinion_support.textContent = "-";
                law_class_opinion.appendChild(law_class_opinion_support);

                law_class_opinion_holder.appendChild(law_class_opinion);
            }
        }
        law_element.appendChild(law_class_opinion_holder);

        let law_cost = document.createElement("p");
        law_cost.classList.add("cost");
        if (helpers.get(game.data.laws[law_id], "default", false)) law_cost.textContent = "Free";
        else law_cost.innerHTML = "<i class='fa-solid fa-landmark'></i> <span class='cost-amount'></span>";
        law_element.appendChild(law_cost);

        let law_progressbar = document.createElement("div");
        law_progressbar.classList.add("support-meter");
        law_progressbar.innerHTML = "<div class='support'></div><p class='percentage'></p>";
        law_element.appendChild(law_progressbar);

        law_element.onclick = function() { game.elements.laws.switch_law(this.dataset.law); };
        law_category_divs[game.data.laws[law_id].category].appendChild(law_element);
    }
    
    for (let category_id in law_category_divs) {
        document.getElementById("tab_laws").appendChild(law_category_divs[category_id]);
    }
};

game.elements.laws.render = function() {
    // Change laws in header
    for (let element of document.getElementsByClassName("current-laws")) {
        for (let inner_element of element.getElementsByClassName("name")) {
            if (game.player.laws[inner_element.dataset.category] == null) continue;
            inner_element.textContent = game.data.laws[game.player.laws[inner_element.dataset.category]].name;
        }
        for (let inner_element of element.getElementsByClassName("desc")) {
            if (game.player.laws[inner_element.dataset.category] == null) continue;
            inner_element.innerHTML = game.data.laws[game.player.laws[inner_element.dataset.category]].short_desc;
        }
    }

    // Change law cost and support
    for (let element of document.getElementsByClassName("law-options")) {
        for (let inner_element of element.getElementsByClassName("option")) {
            let law_id = inner_element.dataset.law;

            if (helpers.get(game.data.laws[law_id], "default", false)) continue;

            let law_cost = game.elements.laws.calculate_cost(law_id);
            let law_support = game.elements.laws.calculate_support(law_id);

            if (game.player.can_afford({"bureaucracy": law_cost})) inner_element.classList.remove("disabled");
            else inner_element.classList.add("disabled");

            for (let inner_inner_element of inner_element.getElementsByClassName("cost-amount")) {
                inner_inner_element.textContent = law_cost;
            }
            for (let inner_inner_element of inner_element.getElementsByClassName("support-meter")) {
                inner_inner_element.style.setProperty("--support-percentage", law_support);
            }
            for (let inner_inner_element of inner_element.getElementsByClassName("percentage")) {
                inner_inner_element.textContent = Math.round(law_support * 100) + "%";
            }
        }
    }

    // TODO: can/cannot afford a law
};

// Helpers

game.elements.laws.select_category = function(category_id) {
    game.player.laws.current_category = category_id;

    for (let element of document.getElementsByClassName("current-law")) {
        if (element.dataset.category == category_id) element.classList.add("selected");
        else element.classList.remove("selected");
    }

    for (let element of document.getElementsByClassName("law-options")) {
        if (element.dataset.category == category_id) element.classList.remove("no-display");
        else element.classList.add("no-display");
    }
};

game.elements.laws.select_law_in_category = function(category_id, law_id) {
    game.player.laws[category_id] = law_id;

    for (let element of document.getElementsByClassName("law-options")) {
        if (element.dataset.category != category_id) continue;
        for (let inner_element of element.getElementsByClassName("option")) {
            if (inner_element.dataset.law == law_id) inner_element.classList.add("selected");
            else inner_element.classList.remove("selected");
        }
    }
};

game.elements.laws.switch_law = function(law_id) {
    let category_id = game.data.laws[law_id].category;

    let law_cost = game.elements.laws.calculate_cost(law_id);

    if (game.player.buy({"bureaucracy": law_cost})) {
        // Trigger the switchout effect of the previous law
        let old_law = game.player.laws[category_id];
        game.elements.laws.select_law_in_category(category_id, law_id);

        if (old_law != game.player.laws[category_id] && "on_switch_out" in game.data.laws[old_law]) game.data.laws[old_law].on_switch_out();

        // Clear up the jobs
        for (let building_id in game.data.buildings) {
            game.elements.buildings.empty(building_id);
        }
    }
};

game.elements.laws.calculate_cost = function(law_id) {
    if (helpers.get(game.data.laws[law_id], "default", false)) return 0;
    else {
        let support = game.elements.laws.calculate_support(law_id);
        if (support < 0.1) return 25;
        if (support > 0.9) return 1;
        return Math.round(Math.pow(25, (0.9 - support) / 0.8));
    }
};

game.elements.laws.calculate_support = function(law_id) {
    let supporters = 0;
    let population = game.player.citizen_count();

    if (helpers.get(game.data.laws[law_id], "default", false)) return 1.0;

    for (let citizen_id in game.player.citizens) {
        if (game.player.citizens[citizen_id].rolled >= game.data.laws[law_id].support_threshold[game.player.citizens[citizen_id].class]) supporters += 1;
    }

    if (population == 0) return 0.0;
    else return supporters * 1.0 / population;
};
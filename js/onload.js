game.onload = function() {
    // Load player
    game.player = new Player();

    // Create resource amounts in header
    for (let element of document.getElementsByClassName("header")) {
        let resource_frag = document.createDocumentFragment();
        for (let resource in game.data.resources) {
            if (helpers.get(game.data.resources[resource], "include", true)) {
                let resource_container = document.createElement("div");
                resource_container.classList.add("resource");
                resource_container.dataset.resource = resource;
                if (helpers.get(game.data.resources[resource], "conditional") != null) {
                    resource_container.classList.add("conditional");
                    resource_container.dataset.conditional_class = "hidden";
                    resource_container.dataset.condition = helpers.get(game.data.resources[resource], "conditional");
                }

                let resource_icon = document.createElement("i");
                resource_icon.className = game.data.resources[resource].class;
                resource_container.appendChild(resource_icon);

                let resource_amount = document.createElement("p");
                resource_amount.classList.add("amount");
                resource_amount.textContent = helpers.get(game.data.resources[resource], "default", 0);
                resource_container.appendChild(resource_amount);

                let resource_increase = document.createElement("p");
                resource_increase.classList.add("increase");
                resource_increase.textContent = "+0";
                resource_container.appendChild(resource_increase);

                let resource_decrease = document.createElement("p");
                resource_decrease.classList.add("decrease");
                resource_decrease.textContent = "-0";
                resource_container.appendChild(resource_decrease);

                resource_frag.appendChild(resource_container);
            }
        }
        element.appendChild(resource_frag);
    }

    // Element initializers
    game.elements.tabs.init();
    game.elements.tabs.init_help();
    game.elements.buildings.init();
    game.elements.prestige_upgrades.init();
    game.elements.laws.init();
    game.tech.settings.init();

    // Insert dice holders
    for (let element of document.getElementsByClassName("dice-tray")) {
        // Add info to the reverse array in a player
        game.player.locations[element.dataset.location] = [];

        let resource_frag = document.createDocumentFragment();
        for (let i = 0; i < element.dataset.dice; i++) {
            let dice_holder = document.createElement("div");
            dice_holder.classList.add("dice-holder");
            dice_holder.dataset.index = i;
            dice_holder.id = "location_" + element.dataset.location + "_" + i;

            dice_holder.ondragover = game.elements.dice.dragover;
            dice_holder.ondrop = game.elements.dice.drop;
            dice_holder.onclick = game.elements.dice.onclick_location;

            if (element.dataset.location == "population") dice_holder.onclick = function(event) { game.elements.dice.onclick_location(event); game.game.expand_population_limit(i); };

            resource_frag.appendChild(dice_holder);

            game.player.locations[element.dataset.location].push(null);
        }
        element.appendChild(resource_frag);
    }

    // Register hotkeys
    document.addEventListener("keydown", game.tech.keyboard_interrupt);

    // Load player data
    game.saveload.get("save", game.game.load);

    // Init dice locations and other stuff
    game.player.init();

    // Start render loop
    game.render_interval = setInterval(game.render_loop, constants.RENDER_INTERVAL);
    game.render_loop();

    // Start animation loop
    game.animation_interval = setInterval(game.animation_loop, constants.ANIMATION_INTERVAL);
    game.animation_loop();

    // Start save loop
    game.save_interval = setInterval(game.game.save, constants.SAVE_INTERVAL);
    game.game.save();
};

window.onload = game.onload;
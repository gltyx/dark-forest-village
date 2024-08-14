game.elements.dice = {};

game.elements.dice.class = class {
    constructor() {
        this.class = "peasant";
        this.sides = [];
        for (let i = 0; i < 6; i++) {
            this.sides.push({"symbols": {}, "weight": 1});
        }
        this.rolled = 0;
        this.location = {"place": "aether", "id": 0};
    };

    roll() {
        let total_weight = 0;
        for (let i = 0; i < 6; i++) total_weight += this.sides[i].weight;
        total_weight = helpers.randint(total_weight - 1);
        for (let i = 0; i < 6; i++) {
            total_weight -= this.sides[i].weight;
            if (total_weight < 0) {
                this.rolled = i;
                break;
            }
        }
    };

    add_symbol(symbol, amount, side = null) {
        // null is current side
        if (side == null) side = this.rolled;

        // 999 symbol cap
        this.sides[side].symbols[symbol] = Math.max(0, Math.min(999, helpers.get(this.sides[side].symbols, symbol, 0) + amount));
    };

    get_side(side=null) {
        // gets side data
        // null is current side
        if (side == null) side = this.rolled;
        return this.sides[side];
    };

    symbol_count(positive_only=true, side=null) {
        // returns the total symbol count on a specified side
        // null is current side
        // positive_only excludes negative traits like detection
        if (side == null) side = this.rolled;
        let symbol_count = 0;
        for (let symbol in this.sides[side].symbols) {
            if (positive_only && helpers.get(game.data.resources[symbol], "negative", false)) continue;
            symbol_count += this.sides[side].symbols[symbol];
        }
        return symbol_count;
    };

    random_symbol(positive_only=true, side=null) {
        // returns the name of a random symbol on specified side
        // null is current side
        // returns null if there are no symbols
        // positive_only excludes negative traits like detection
        if (side == null) side = this.rolled;
        let symbol_count = this.symbol_count(positive_only, side);
        if (symbol_count == 0) return null;
        symbol_count = helpers.randint(symbol_count - 1);
        for (let symbol in this.sides[side].symbols) {
            if (positive_only && helpers.get(game.data.resources[symbol], "negative", false)) continue;
            symbol_count -= this.sides[side].symbols[symbol];
            if (symbol_count < 0) return symbol;
        }
    };

    // Save/load

    save() {
        return [this.class, this.sides, this.rolled, this.location];
    };

    load(save) {
        this.class = save[0];
        this.sides = save[1];
        this.rolled = save[2];
        this.location = save[3];
    };
};

game.elements.dice.create = function(parent_1 = null, parent_2 = null) {
    if (parent_1 == null) { // no parents -- create default Peasant die
        let die = new game.elements.dice.class;
        die.add_symbol("wheat", 1, 1);
        die.add_symbol("wheat", 1, 2);
        die.add_symbol("wheat", 1, 3);
        die.add_symbol("wheat", 2, 4);
        die.add_symbol("wheat", 4, 5);
        return die;
    }
    else if (parent_2 == null) { // one parent -- create a die copy
        let die = new game.elements.dice.class;
        die.class = parent_1.class;
        for (let i = 0; i < 6; i++) {
            die.sides[i].weight = parent_1.sides[i].weight;
            for (let symbol in parent_1.sides[i].symbols) {
                die.add_symbol(symbol, parent_1.sides[i].symbols[symbol], i);
            }
        }
        return die;
    }
    else { // two parents -- mix four sides from one and two from other
        let main_parent = helpers.randint(1);
        if (main_parent == 1) {
            main_parent = parent_1;
            parent_1 = parent_2;
            parent_2 = main_parent;
        }
        let off_trait_1 = helpers.randint(5);
        let off_trait_2 = helpers.randint(4);
        if (off_trait_2 >= off_trait_1) off_trait_2++;

        let die = new game.elements.dice.class;
        die.class = parent_1.class;
        for (let i = 0; i < 6; i++) {
            let parent = parent_1;
            if (i == off_trait_1 || i == off_trait_2) parent = parent_2;
            // die.sides[i].weight = parent.sides[i].weight;  Weights are not inherited
            for (let symbol in parent.sides[i].symbols) {
                die.add_symbol(symbol, parent.sides[i].symbols[symbol], i);
            }
        }
        return die;
    }
};

game.elements.dice.render = function(die, side = null, include_events = true) {
    // returns a rendered HTML for the die
    // null is current side
    if (side == null) side = die.rolled;

    let die_main = document.createElement("div");
    die_main.classList.add("die");
    die_main.classList.add("class-" + die.class);

    let die_side = document.createElement("p");
    die_side.classList.add("rolled");
    die_side.textContent = side + 1;
    die_main.appendChild(die_side);

    let side_data = die.get_side(side);
    let symbols = [];
    for (let resource in game.data.resources) {
        if (!helpers.get(game.data.resources[resource], "negative", false) && resource in side_data.symbols && side_data.symbols[resource] > 0) {
            symbols.push(resource);
        }
    }
    // 1 symbol - takes all space
    // 2 symbols - 2 rows, 1 column
    // 3-4 symbols - 2 rows, 2 columns
    // 5-6 symbols - 3 rows, 2 columns
    // 7-9 symbols - 3 rows, 3 columns
    // etc...
    if (symbols.length > 0) {
        let die_symbols = document.createElement("div");
        die_symbols.classList.add("symbols");
        let rows = Math.ceil(Math.sqrt(symbols.length));
        let columns = Math.round(Math.sqrt(symbols.length));
        let squish_factor = Math.max(rows * 3, columns * 3.5);
        die_symbols.style.setProperty("--rows", rows);
        die_symbols.style.setProperty("--columns", columns);
        die_symbols.style.setProperty("--squish-factor", squish_factor);

        for (let symbol of symbols) {
            // 1 to 3 is displayed as 1 to 3 corresponding symbols
            // 4+ is symbol x amount
            let die_symbol = document.createElement("p");
            die_symbol.classList.add("symbol");
            if (side_data.symbols[symbol] <= 3) {
                for (let i = 0; i < side_data.symbols[symbol]; i++) {
                    let html_symbol = document.createElement("i");
                    html_symbol.className = game.data.resources[symbol].class;
                    die_symbol.appendChild(html_symbol);
                }
            }
            else {
                let html_symbol = document.createElement("i");
                html_symbol.className = game.data.resources[symbol].class;
                die_symbol.appendChild(html_symbol);

                let symbol_amount = document.createElement("span");
                symbol_amount.textContent = "\xd7" + helpers.number_format(side_data.symbols[symbol]);
                die_symbol.appendChild(symbol_amount);
            }
            die_symbols.appendChild(die_symbol);
        }
        die_main.appendChild(die_symbols);
    }
    
    // Special casing for detection and attack increases
    for (let symbol of ["detection", "attack"]) {
        if (symbol in side_data.symbols && side_data.symbols[symbol] > 0) {
            let symbol_holder = document.createElement("div");
            symbol_holder.classList.add("symbol-" + symbol);
            if (side_data.symbols[symbol] <= 2) { // No space for 3
                for (let i = 0; i < side_data.symbols[symbol]; i++) {
                    let html_symbol = document.createElement("i");
                    html_symbol.className = game.data.resources[symbol].class;
                    symbol_holder.appendChild(html_symbol);
                }
            }
            else {
                let html_symbol = document.createElement("i");
                html_symbol.className = game.data.resources[symbol].class;
                symbol_holder.appendChild(html_symbol);

                let symbol_amount = document.createElement("span");
                symbol_amount.textContent = "\xd7" + helpers.number_format(side_data.symbols[symbol]);
                symbol_holder.appendChild(symbol_amount);
            }
            die_main.appendChild(symbol_holder);
        }
    }

    // Weight display
    if (side_data.weight > 1) {
        let weight_holder = document.createElement("div");
        weight_holder.classList.add("symbol-weight");

        let html_symbol = document.createElement("i");
        html_symbol.className = "fa-solid fa-weight-hanging";
        weight_holder.appendChild(html_symbol);

        if (side_data.weight > 2) {
            let symbol_amount = document.createElement("span");
            symbol_amount.textContent = "\xd7" + helpers.number_format(side_data.weight - 1);
            weight_holder.appendChild(symbol_amount);
        }

        die_main.appendChild(weight_holder);
    }

    if (include_events) {
        // drag-and-drop
        die_main.draggable = true;
        die_main.ondragstart = game.elements.dice.dragstart;
        die_main.ondragend = game.elements.dice.dragend;

        // click methods
        die_main.onclick = game.elements.dice.onclick;
        
        // hover tooltips
        die_main.onmouseenter = game.tech.dice_tooltip_hover;
        die_main.onmouseleave = game.tech.dice_tooltip_end_hover;
    }

    return die_main;
};

// Drag-and-drop handlers
game.elements.dice.dragstart = function(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
    event.dataTransfer.effectAllowed = "move";

    // Remove highlighters for possible locations
    let highlighted_elements = document.getElementsByClassName("can-drop");
    while (highlighted_elements.length) {
        highlighted_elements[0].classList.remove("can-drop");
    }

    // Set highlighters for possible locations
    for (let element of document.getElementsByClassName("dice-holder")) {
        if (element.parentElement.dataset.location == null) continue;
        let location = element.parentElement.dataset.location;
        let index = +element.dataset.index;
        if (game.elements.dice.accept_drop(game.player.citizens[event.currentTarget.dataset.id], location, index)) {
            element.classList.add("can-drop");
        }
    }

    // Block cursor_die
    game.player.cursor_die = null;

    // Block tooltips
    game.tech.block_tooltips = true;
    game.tech.delete_dice_tooltip();
};

game.elements.dice.dragend = function(event) {
    // Remove highlighters for possible locations
    let highlighted_elements = document.getElementsByClassName("can-drop");
    while (highlighted_elements.length) {
        highlighted_elements[0].classList.remove("can-drop");
    }

    // Remove block tooltip
    game.tech.block_tooltips = false;
    game.tech.dice_tooltip_hover(event);
};

game.elements.dice.dragover = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
};

game.elements.dice.drop = function(event) {
    let die_id = event.dataTransfer.getData("text/plain");
    let location = event.currentTarget.parentElement.dataset.location;
    let index = +event.currentTarget.dataset.index;

    if (game.elements.dice.accept_drop(game.player.citizens[die_id], location, index)) {
        event.preventDefault();

        // If the place is already occupied, swap
        if (game.player.locations[location][index] != null) {
            let old_parent = document.getElementById("die_" + die_id).parentElement;
            old_parent.appendChild(document.getElementById("die_" + game.player.locations[location][index]));
            game.player.citizens[game.player.locations[location][index]].location.place = game.player.citizens[die_id].location.place;
            game.player.citizens[game.player.locations[location][index]].location.id = game.player.citizens[die_id].location.id;
        }

        event.currentTarget.appendChild(document.getElementById("die_" + die_id));

        // Correct location placement data
        game.player.locations[game.player.citizens[die_id].location.place][game.player.citizens[die_id].location.id] = game.player.locations[location][index];
        game.player.locations[location][index] = die_id;
        game.player.citizens[die_id].location.place = location;
        game.player.citizens[die_id].location.id = index;
    }

    // Re-render stuff
    game.render_loop();
};

// Click handlers
game.elements.dice.onclick = function(event) {
    event.stopPropagation();

    // Set highlighters for possible locations
    for (let element of document.getElementsByClassName("dice-holder")) {
        if (element.parentElement.dataset.location == null) continue;
        let location = element.parentElement.dataset.location;
        let index = +element.dataset.index;
        if (game.elements.dice.accept_drop(game.player.citizens[event.currentTarget.dataset.id], location, index)) {
            element.classList.add("can-drop");
        }
    }

    game.player.cursor_die = event.currentTarget.dataset.id;
};

game.elements.dice.onclick_location = function(event) {
    let die_id = game.player.cursor_die;
    let location = event.currentTarget.parentElement.dataset.location;
    let index = +event.currentTarget.dataset.index;

    if (die_id == null) return;

    if (game.elements.dice.accept_drop(game.player.citizens[die_id], location, index)) {
        // If the place is already occupied, swap
        if (game.player.locations[location][index] != null) {
            let old_parent = document.getElementById("die_" + die_id).parentElement;
            old_parent.appendChild(document.getElementById("die_" + game.player.locations[location][index]));
            game.player.citizens[game.player.locations[location][index]].location.place = game.player.citizens[die_id].location.place;
            game.player.citizens[game.player.locations[location][index]].location.id = game.player.citizens[die_id].location.id;
        }

        event.currentTarget.appendChild(document.getElementById("die_" + die_id));

        // Correct location placement data
        game.player.locations[game.player.citizens[die_id].location.place][game.player.citizens[die_id].location.id] = game.player.locations[location][index];
        game.player.locations[location][index] = die_id;
        game.player.citizens[die_id].location.place = location;
        game.player.citizens[die_id].location.id = index;

        // Clear cursor_die
        game.player.cursor_die = null;

        // Remove highlighters for possible locations
        let highlighted_elements = document.getElementsByClassName("can-drop");
        while (highlighted_elements.length) {
            highlighted_elements[0].classList.remove("can-drop");
        }
    }

    // Re-render stuff
    game.render_loop();
};
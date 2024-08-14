game.tech.block_tooltips = false;

game.tech.dice_tooltip_hover = function(event) {
    if (game.tech.block_tooltips) return;
    clearTimeout(game.tech.dice_tooltip_delete_timeout);
    if (document.getElementById("dice_tooltip").classList.contains("no-display")) {
        game.tech.dice_tooltip_hover_timeout = setTimeout(game.tech.draw_dice_tooltip, constants.DICE_TOOLTIP_HOVER_DELAY, event.currentTarget.dataset.id);
    }
    else game.tech.draw_dice_tooltip(event.currentTarget.dataset.id);
};

game.tech.dice_tooltip_hover_on_tooltip = function(event) {
    clearTimeout(game.tech.dice_tooltip_delete_timeout);
};

game.tech.dice_tooltip_end_hover = function(event) {
    clearTimeout(game.tech.dice_tooltip_hover_timeout);
    game.tech.dice_tooltip_delete_timeout = setTimeout(game.tech.delete_dice_tooltip, constants.DICE_TOOLTIP_HOVER_DELAY);
};

game.tech.delete_dice_tooltip = function() {
    document.getElementById("dice_tooltip").classList.add("no-display");
};

game.tech.draw_dice_tooltip = function(id) {
    if (game.tech.block_tooltips) return;
    let bounding_box = document.getElementById("die_" + id).getBoundingClientRect();
    let app_box = document.getElementById("app").getBoundingClientRect();

    document.getElementById("dice_tooltip").style.top = null;
    document.getElementById("dice_tooltip").style.bottom = null;
    document.getElementById("dice_tooltip").style.left = null;
    document.getElementById("dice_tooltip").style.right = null;

    let center_x = (bounding_box.left + bounding_box.right) / 2;
    let center_y = (bounding_box.top + bounding_box.bottom) / 2;

    if (center_x > app_box.width / 2) document.getElementById("dice_tooltip").style.right = "1em";
    else document.getElementById("dice_tooltip").style.left = "1em";

    if (center_y > app_box.height / 2) document.getElementById("dice_tooltip").style.bottom = (app_box.height - center_y + bounding_box.height * 3 / 4) + "px";
    else document.getElementById("dice_tooltip").style.top = (center_y + bounding_box.height * 3 / 4) + "px";

    // Insert elements
    document.getElementById("dice_tooltip").innerHTML = "";

    let big_dice_holder = document.createElement("div");
    big_dice_holder.classList.add("dice-holder");
    big_dice_holder.classList.add("big");
    big_dice_holder.style.fontSize = "2.5em";
    big_dice_holder.appendChild(game.elements.dice.render(game.player.citizens[id], game.player.citizens[id].rolled, false));
    document.getElementById("dice_tooltip").appendChild(big_dice_holder);

    for (let i = 0; i < 6; i++) {
        let dice_holder = document.createElement("div");
        dice_holder.classList.add("dice-holder");
        dice_holder.style.fontSize = "1.25em";
        dice_holder.appendChild(game.elements.dice.render(game.player.citizens[id], i, false));
        document.getElementById("dice_tooltip").appendChild(dice_holder);
    }

    let class_name = document.createElement("p");
    class_name.classList.add("class-name");
    class_name.classList.add("class-" + game.player.citizens[id].class);
    class_name.textContent = game.data.citizen_classes[game.player.citizens[id].class].name;
    document.getElementById("dice_tooltip").appendChild(class_name);

    let sides_name = document.createElement("p");
    sides_name.textContent = "Sides";
    document.getElementById("dice_tooltip").appendChild(sides_name);

    document.getElementById("dice_tooltip").classList.remove("no-display");
};
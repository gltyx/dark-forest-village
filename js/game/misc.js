game.game.expand_population_limit = function(slot) {
    if (slot != game.player.population_limit) return;
    let resource_cost = helpers.get(game.data.population_slot_cost, game.player.population_limit, {});
    if (game.player.buy(resource_cost)) {
        game.player.population_limit += 1;
        game.render_loop();
    }
}

game.game.first_strike = function() {
    if (game.player.resources.attack == constants.INFINITY || game.player.resources.attack > game.player.resources.defense) return;
    game.game.process_attack();
}

game.game.show_win_screen = function() {
    game.player.stats.won = true;
    for (let element of document.getElementsByClassName("win-screen-holder")) {
        element.classList.remove("no-display");
    }
}

game.game.close_win_screen = function() {
    game.player.stats.won = false;
    for (let element of document.getElementsByClassName("win-screen-holder")) {
        element.classList.add("no-display");
    }
}
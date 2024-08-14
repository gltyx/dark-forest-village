game.elements.dice.is_unemployed = function(die) {
    if (die.location.place == "aether") return true;
    if (die.location.place == "population") return true;
    
    return false;
}

game.elements.dice.is_peasant = function(die) {
    if (die.class == "peasant") return true;
    if (die.class == "laborer" && game.player.laws.economic == "feudalism") return true;
    return false;
}

game.elements.dice.are_same_class = function(die_1, die_2) {
    if (die_1.class == die_2.class) return true;
    if (game.elements.dice.is_peasant(die_1) && game.elements.dice.is_peasant(die_2)) return true;
    return false;
}
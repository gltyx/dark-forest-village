game.prestige.hope_gain_formula = function() {
    let attacks_survived = game.player.resources.attacks_survived;
    if (attacks_survived == 0) return 0;
    if (game.player.resources.attack != constants.INFINITY) {
        attacks_survived += Math.min(1.0, game.player.resources.defense * 1.0 / game.player.resources.attack);
    }
    let gain = attacks_survived ** game.prestige.hope_gain_attacks_survived_power();
    gain *= game.prestige.hope_gain_bonus();
    return Math.floor(gain);
};

game.prestige.defense_needed_for_hope_gain = function(hope_gain) {
    // null if it is impossible to gain more just from Defense

    if (game.player.resources.attack == constants.INFINITY) return null;
    if (game.player.resources.attacks_survived == 0) return null;
    let base_gain = (hope_gain / game.prestige.hope_gain_bonus()) ** (1.0 / game.prestige.hope_gain_attacks_survived_power());
    base_gain -= game.player.resources.attacks_survived;
    base_gain *= game.player.resources.attack;
    base_gain = Math.ceil(base_gain);
    if (base_gain >= game.player.resources.attack) return null;
    if (base_gain <= game.player.resources.defense) return game.player.resources.defense + 1;

    return Math.ceil(base_gain);
};

// From Hope upgrades
game.prestige.hope_gain_bonus = function() {
    let bonus = 1.0;

    // r12: per population
    for (let citizen_id in game.player.citizens) {
        bonus *= (1 + game.elements.prestige_upgrades.get_effect("r12") / 100.0);
    }

    // r13: based on unspent Hope
    bonus *= game.elements.prestige_upgrades.get_effect("r13");

    // r14: per tech
    for (let research_id in game.data.researches) {
        if (game.conditionals.get("research_" + research_id)) bonus *= (1 + game.elements.prestige_upgrades.get_effect("r14") / 100.0);
    }

    return bonus;
};

// Return modified power used for the Hope gain
game.prestige.hope_gain_attacks_survived_power = function() {
    return game.elements.prestige_upgrades.get_effect("r11");
}
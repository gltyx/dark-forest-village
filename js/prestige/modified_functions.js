// Returns true if an attempt to add a detection symbol fails
game.prestige.avoid_detection_roll = function() {
    return helpers.percentile_roll(game.elements.prestige_upgrades.get_effect("r22"));
}

// Returns the number of researches available every turn
game.prestige.researches_available = function() {
    return game.elements.prestige_upgrades.get_effect("r44");
}

// Returns if attack symbol addition is accompanied by defense
game.prestige.attack_payback = function() {
    return helpers.percentile_roll(game.elements.prestige_upgrades.get_effect("r32"));
}

// Returns modified amount of current slots (needed for that function that makes it 2)
game.prestige.modify_current_slots = function(slots) {
    if (game.player.prestige_upgrades.workplace_shifts.level > 0) return Math.max(2, slots);
    return slots;
}

// Returns attack increase on successful attack resolution
game.prestige.attack_power_multiplier = function() {
    return game.elements.prestige_upgrades.get_effect("r31");
}

// Returns detection multiplier on successful attack resolution
game.prestige.detection_max_multiplier = function() {
    return game.elements.prestige_upgrades.get_effect("r21");
}

// Returns the base detection_max
game.prestige.base_detection_max = function() {
    return game.elements.prestige_upgrades.get_effect("r23");
}

// Returns modified chance of the negative event occuring
game.prestige.modify_negative_event_percentage = function(percentage) {
    return percentage * (100 - game.elements.prestige_upgrades.get_effect("r43")) / 100.0;
}
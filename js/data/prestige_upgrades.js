// Inner variables:
// - name: the upgrade name, optional
// - desc: the upgrade description
// - is_repeatable: if the upgrade is repeatable, default false
// - max_level: max level if an upgrade is repeatable
// - effect: the function that returns the effect, accepts current level; can be a value if non-repeatable
// - on_purchase: a function that is called on purchase, add if needed
// - cost: value/function if it is not repeatable, function that accepts next level if repeatable
// - effect_formatting: any special formatting goes here. Must be a string, must include a span with amount class. Default value is "<span class='amount'></span>"
// - toggle: if it has an on/off toggle, default false

game.data.prestige_upgrades = {};

// ==========
// REPEATABLE
// ==========

game.data.prestige_upgrades.r11 = {
    "desc": "Gain more <i class='fa-solid fa-sun'></i> based on attacks defeated.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 2 + 0.5 * Math.log2(level / 2.0 + 1);
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "x<span class='sup amount'></span>"
};

game.data.prestige_upgrades.r12 = {
    "desc": "Gain more <i class='fa-solid fa-sun'></i> based on population.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        if (level < 3) return 3 * level - level * (level - 1) / 2;
        else return level + 3;
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "+<span class='amount'></span>% ea."
};

game.data.prestige_upgrades.r13 = {
    "desc": "Gain more <i class='fa-solid fa-sun'></i> based on unspent <i class='fa-solid fa-sun'></i>.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 1 + Math.log2(game.player.resources.hope + 1) * Math.log2(level ** 2 + 1) / 8.0;
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "\xd7<span class='amount'></span>"
};

game.data.prestige_upgrades.r14 = {
    "desc": "Gain more <i class='fa-solid fa-sun'></i> based on technologies researched.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        if (level < 4) return 1 * level - level * (level - 1) / 8.0;
        else return level / 4.0 + 1.5;
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "+<span class='amount'></span>% ea."
};

game.data.prestige_upgrades.r21 = {
    "desc": "<i class='fa-solid fa-satellite-dish'></i> limit increases faster per attack defeated.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 2 + 0.5 * Math.log2(level + 1);
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "\xd7<span class='amount'></span>"
};

game.data.prestige_upgrades.r22 = {
    "desc": "Chance to not get <i class='fa-solid fa-satellite-dish decrease'></i> when an effect adds it to a die.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 100 * (1 - Math.pow(0.9, level));
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "<span class='amount'></span>%"
};

game.data.prestige_upgrades.r23 = {
    "desc": "Base <i class='fa-solid fa-satellite-dish'></i> limit is higher based on unspent <i class='fa-solid fa-sun'></i>.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return Math.ceil(10 + Math.log2(game.player.resources.hope + 1) * level);
    },
    "cost": function(level) { return Math.round(2 ** level); }
};

game.data.prestige_upgrades.r24 = {
    "desc": "Each technology researched has a chance to increase <i class='fa-solid fa-satellite-dish'></i> limit by 1.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 100 * (1 - Math.pow(0.8, level));
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "<span class='amount'></span>%"
};

game.data.prestige_upgrades.r31 = {
    "desc": "<i class='fa-solid fa-hand-fist'></i> increases slower per attack defeated.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 1 + Math.pow(0.9, level ** 0.75);
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "x<span class='sup amount'></span>"
};

game.data.prestige_upgrades.r32 = {
    "desc": "Chance to get <i class='fa-solid fa-shield-halved'></i> when an effect adds <i class='fa-solid fa-hand-fist decrease'></i> to a die.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 100 * (1 - Math.pow(0.8, level));
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "<span class='amount'></span>%"
};

game.data.prestige_upgrades.r33 = {
    "desc": "Gain <i class='fa-solid fa-shield-halved'></i> each turn based on unspent <i class='fa-solid fa-sun'></i>, rounded randomly.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return Math.log2(game.player.resources.hope + 1) * Math.log2(level ** 1.5 + 1) / 30.0;
    },
    "cost": function(level) { return Math.round(2 ** level); }
};

game.data.prestige_upgrades.r34 = {
    "desc": "Each technology researched reduces <i class='fa-solid fa-hand-fist'></i> by a percentage, rounded down.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 20 * (1 - Math.pow(0.9, level));
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "-<span class='amount'></span>%"
};

game.data.prestige_upgrades.r41 = {
    "desc": "Lose less <i class='fa-solid fa-shield-halved'></i> when you successfully defend against an attack.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 100 * Math.pow(0.5, level ** 0.5);
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "<span class='amount'></span>%"
};

game.data.prestige_upgrades.r42 = {
    "desc": "Start with more population slots unlocked.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 5 + level;
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "on_purchase": function() { game.player.population_limit = Math.max(game.player.population_limit, game.elements.prestige_upgrades.get_effect("r42")); }
};

game.data.prestige_upgrades.r43 = {
    "desc": "Decrease chance of negative events based on unspent <i class='fa-solid fa-sun'></i>.",
    "is_repeatable": true,
    "max_level": 31,
    "effect": function(level) {
        return 100 * (1 - Math.pow(0.97, Math.log2(game.player.resources.hope + 1) * level));
    },
    "cost": function(level) { return Math.round(2 ** level); },
    "effect_formatting": "-<span class='amount'></span>%"
};

game.data.prestige_upgrades.r44 = {
    "desc": "More technologies are available on each roll.",
    "is_repeatable": true,
    "max_level": 11,
    "effect": function(level) {
        return 3 + level;
    },
    "cost": function(level) { return 2 * Math.round(8 ** (level - 1)); }
};

// ==============
// NON-REPEATABLE
// ==============

game.data.prestige_upgrades.government = {
    "name": "Government",
    "desc": "Unlock the <span class='bold'>Governance</span> technology, providing a way to produce <i class='fa-solid fa-landmark'></i> and modify laws.",
    "cost": 1
};

game.data.prestige_upgrades.stock_market = {
    "name": "Stock Market",
    "desc": "Gain <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>1</span> per each 20 <i class='fa-solid fa-sack-dollar'></i> you have every year, capped at <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>5</span>.",
    "cost": 2
};

game.data.prestige_upgrades.integrated_defense_systems = {
    "name": "Integrated Defense Systems",
    "desc": "Build a Wall jobs produce +100% more <i class='fa-solid fa-shield-halved'></i> per attack defeated (additively).",
    "cost": 3
};

game.data.prestige_upgrades.aggressive_isolationism = {
    "name": "Aggressive Isolationism",
    "desc": "Events no longer happen at the cost of <span class='decrease'><i class='fa-solid fa-satellite-dish'></i> <span class='bold'>1</span></span> per year. Can be toggled off.",
    "cost": 4,
    "toggle": true
};

game.data.prestige_upgrades.self_sufficiency = {
    "name": "Self-Sufficiency",
    "desc": "All <span class='class-peasant'>Peasants</span> gain <i class='fa-solid fa-wheat-awn'></i> on a <span class='bold'>1</span> side.",
    "cost": 6,
    "on_purchase": function() {
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.elements.dice.is_peasant(game.player.citizens[citizen_id])) {
                game.player.citizens[citizen_id].add_symbol("wheat", 1, 0);
            }
        }
        game.player.init();
    }
};

game.data.prestige_upgrades.first_strike = {
    "name": "First Strike",
    "desc": "You can trigger attacks voluntarily at any time.",
    "cost": 8,
    "on_purchase": function() { game.player.flags.first_strike_bought = true; }
};

game.data.prestige_upgrades.reroll_ones = {
    "name": "Halfling Luck",
    "desc": "Citizen dice that roll a <span class='bold'>1</span> are rerolled once. Can be toggled off.",
    "cost": 16,
    "toggle": true
};

game.data.prestige_upgrades.retraining = {
    "name": "Retraining",
    "desc": "<span class='class-laborer'>Laborers</span> can attend Training as well.",
    "cost": 32
};

game.data.prestige_upgrades.workplace_shifts = {
    "name": "Workplace Shifts",
    "desc": "All jobs get a second slot.",
    "cost": 64
};

game.data.prestige_upgrades.religion = {  // TODO
    "name": "Religion",
    "desc": "Unlock the <span class='bold'>Theology</span> technology, providing a way to produce <i class='fa-solid fa-sun'></i> without resetting.",
    "cost": 128
};

game.data.prestige_upgrades.final_frontier = {  // TODO
    "name": "The Final Frontier",
    "desc": "Unlock the <span class='bold'>Space Exploration</span> technology, providing an alternate way to produce <i class='fa-solid fa-flask'></i> and a path to the victory.",
    "cost": 512
};
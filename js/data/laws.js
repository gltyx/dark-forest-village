// law_categories: key-value (key -> localization)

// laws:
// Inner variables:
// - name: localized name
// - default: if it is a default law, which is also free; false by default
// - desc: description
// - short_desc: description for a topbar
// - category: category from law_categories
// - support_threshold: key-value of citizen classes and thresholds (0-6, 0 is always ok, 6 is always against)

game.data.law_categories = {
    "political": "Political System",
    "economic": "Economic System",
    "social": "Social System"
};

game.data.laws = {};

game.data.laws.anarchy = {
    "name": "Anarchy",
    "default": true,
    "desc": "No effect.",
    "short_desc": "No effect",
    "category": "political"
};

game.data.laws.democracy = {
    "name": "Democracy",
    "desc": "Unlock a <span class='bold'>Prime Minister</span> job, which has a chance of converting <i class='fa-solid fa-sack-dollar'></i> symbols into <i class='fa-solid fa-landmark'></i> at the cost of gaining <i class='fa-solid fa-satellite-dish decrease'></i>.",
    "short_desc": "Unlock a <span class='bold'>Prime Minister</span> job",
    "category": "political",
    "support_threshold": {
        "peasant": 4,
        "laborer": 2,
        "scientist": 1,
        "soldier": 5,
        "specialist": 1,
        "priest": 5
    }
};

game.data.laws.autocracy = {
    "name": "Autocracy",
    "desc": "Unlock an <span class='bold'>Advisor</span> job, which spreads a random positive symbol on the current side to a random free citizen at the cost of gaining <i class='fa-solid fa-satellite-dish decrease'></i>.",
    "short_desc": "Unlock an <span class='bold'>Advisor</span> job",
    "category": "political",
    "support_threshold": {
        "peasant": 5,
        "laborer": 5,
        "scientist": 4,
        "soldier": 1,
        "specialist": 4,
        "priest": 1
    }
};

game.data.laws.totalitarianism = {
    "name": "Totalitarianism",
    "desc": "<span class='bold'>Prison</span> removes all <i class='fa-solid fa-satellite-dish decrease'></i> symbols instead of just one.",
    "short_desc": "<span class='bold'>Prison</span> removes all <i class='fa-solid fa-satellite-dish decrease'></i>",
    "category": "political",
    "support_threshold": {
        "peasant": 2,
        "laborer": 4,
        "scientist": 5,
        "soldier": 2,
        "specialist": 5,
        "priest": 4
    }
};

game.data.laws.barter = {
    "name": "Barter",
    "default": true,
    "desc": "No effect.",
    "short_desc": "No effect",
    "category": "economic"
};

game.data.laws.feudalism = {
    "name": "Feudalism",
    "desc": "<span class='class-laborer'>Laborers</span> count as <span class='class-peasant'>Peasants</span> for all purposes, except for supporting laws.",
    "short_desc": "<span class='class-laborer'>Laborers</span> are <span class='class-peasant'>Peasants</span>",
    "category": "economic",
    "support_threshold": {
        "peasant": 5,
        "laborer": 4,
        "scientist": 3,
        "soldier": 1,
        "specialist": 5,
        "priest": 1
    }
};

game.data.laws.capitalism = {
    "name": "Capitalism",
    "desc": "Each free citizen that rolled a <i class='fa-solid fa-sack-dollar'></i> symbol but not a <i class='fa-solid fa-hammer'></i> symbol gets a <i class='fa-solid fa-hammer'></i> on the end of the year.",
    "short_desc": "<i class='fa-solid fa-sack-dollar'></i> symbols create <i class='fa-solid fa-hammer'></i> symbols",
    "category": "economic",
    "support_threshold": {
        "peasant": 4,
        "laborer": 3,
        "scientist": 1,
        "soldier": 5,
        "specialist": 1,
        "priest": 3
    }
};

game.data.laws.socialism = {
    "name": "Socialism",
    "desc": "Unlock a <span class='bold'>Union Representative</span> job for <span class='class-laborer'>Laborers</span>, which spreads its <i class='fa-solid fa-hammer'></i> symbols among the free population and produces <i class='fa-solid fa-landmark'></i> if enough symbols were distributed.",
    "short_desc": "Unlock a <span class='bold'>Union Representative</span> job",
    "category": "economic",
    "support_threshold": {
        "peasant": 1,
        "laborer": 2,
        "scientist": 4,
        "soldier": 3,
        "specialist": 5,
        "priest": 5
    }
};

game.data.laws.tribalism = {
    "name": "Tribalism",
    "default": true,
    "desc": "No effect.",
    "short_desc": "No effect",
    "category": "social"
};

game.data.laws.serfdom = {
    "name": "Serfdom",
    "desc": "<span class='bold'>Training</span> produces <span class='class-peasant'>Peasants</span>.",
    "short_desc": "<span class='bold'>Training</span> produces <span class='class-peasant'>Peasants</span>",
    "category": "social",
    "support_threshold": {
        "peasant": 5,
        "laborer": 5,
        "scientist": 4,
        "soldier": 1,
        "specialist": 1,
        "priest": 4
    }
};

game.data.laws.caste_system = {
    "name": "Caste System",
    "desc": "If two citizens of the same class work together on a job, their production and consumption are doubled.",
    "short_desc": "Same-class dice on a job produce/consume double",
    "category": "social",
    "support_threshold": {
        "peasant": 5,
        "laborer": 5,
        "scientist": 3,
        "soldier": 4,
        "specialist": 1,
        "priest": 2
    }
};

game.data.laws.egalitarianism = {
    "name": "Egalitarianism",
    "desc": "<span class='bold'>Raise a Child</span> can be done by two people of different classes.",
    "short_desc": "Can assign different-class to <span class='bold'>Raise a Child</span>",
    "category": "social",
    "support_threshold": {
        "peasant": 1,
        "laborer": 2,
        "scientist": 3,
        "soldier": 4,
        "specialist": 4,
        "priest": 5
    }
};
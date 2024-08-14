// Inner variables:
// - class: FontAwesome icon class
// - default: how many of the resource you start with, 0 by default
// - include: if it needs to be included on top, true by default
// - reset: if this currency resets on prestige, true by default
// - negative: if having this symbol on a die is detrimental, false by default
// - conditional: a name of conditional that defines when the resource becomes visible, none by default


game.data.resources = {
    "wheat": {
        "class": "fa-solid fa-wheat-awn",
        "default": 10 
    },
    "wood": {
        "class": "fa-solid fa-tree",
        "conditional": "seen_wood"
    },
    "stone": {
        "class": "fa-solid fa-cube",
        "conditional": "seen_stone"
    },
    "metal": {
        "class": "fa-solid fa-gem",
        "conditional": "seen_metal"
    },
    "plastic": {
        "class": "fa-solid fa-sheet-plastic",
        "conditional": "seen_plastic"
    },
    "production": {
        "class": "fa-solid fa-hammer",
        "conditional": "seen_production"
    },
    "electricity": {
        "class": "fa-solid fa-bolt",
        "conditional": "seen_electricity"
    },
    "science": {
        "class": "fa-solid fa-flask",
        "conditional": "seen_science"
    },
    "money": {
        "class": "fa-solid fa-sack-dollar",
        "conditional": "seen_money"
    },
    "bureaucracy": {
        "class": "fa-solid fa-landmark",
        "conditional": "seen_bureaucracy"
    },
    "attack": {
        "class": "fa-solid fa-hand-fist",
        "default": 3,
        "include": false,
        "negative": true
    },
    "defense": {
        "class": "fa-solid fa-shield-halved",
        "include": false
    },
    "detection": {
        "class": "fa-solid fa-satellite-dish",
        "include": false,
        "negative": true
    },
    "detection_max": {
        "include": false,
        "default": 10
    },
    "attacks_survived": {
        "include": false
    },
    "hope": {
        "class": "fa-solid fa-sun",
        "include": false,
        "reset": false
    }
}
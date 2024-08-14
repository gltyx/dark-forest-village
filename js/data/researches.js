// Inner variables:
// - name: the technology name
// - desc: the technology desc
// - cost: the technology cost, in science
// - weight: the technology weight, for rolling - can be a function too
// - possible: if exists, a function that dictates when the research becomes eligible for the pool; defaults to always true
// - prerequisites: the list of technologies that need to be researched first before this one; empty list by default
// - on_research: anything special that happens on researching the technology, if needed

game.data.research_tiers = {
    "tier_1": {"cost": 2, "weight": 100},
    "tier_2": {"cost": 4, "weight": 60},
    "tier_3": {"cost": 7, "weight": 20},
    "tier_4": {"cost": 15, "weight": 10},
    "tier_5": {"cost": 30, "weight": 4},
    "tier_6": {"cost": 80, "weight": 1.5},
    "tier_7": {"cost": 150, "weight": 0.5},
    "tier_8": {"cost": 400, "weight": 0.15},
    "tier_9": {"cost": 1000, "weight": 0.04},
    "tier_10": {"cost": 2500, "weight": 0.01},
    "tier_11": {"cost": 6000, "weight": 0.003},
    "tier_12": {"cost": 16000, "weight": 0.0006}
};


game.data.researches = {};

// Hunting tree
game.data.researches.persistence_hunting = {
    "name": "Persistence Hunting",
    "desc": "If a free citizen rolled at least <i class='fa-solid fa-wheat-awn'></i>\xd73, they produce an additional <i class='fa-solid fa-wheat-awn'></i>.",
    "cost": game.data.research_tiers.tier_1.cost,
    "weight": game.data.research_tiers.tier_1.weight
};
game.data.researches.self_sufficiency = {
    "name": "Self-Sufficiency",
    "desc": "<span class='class-peasant'>Peasants</span> no longer require upkeep.",
    "prerequisites": ["persistence_hunting"],
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};

// Lumberjack tree
game.data.researches.mechanical_saw = {
    "name": "Mechanical Saw",
    "desc": "Citizens in a Lumberjack job have a 25% chance to not lose <i class='fa-solid fa-hammer'></i>.",
    "possible": function() { return game.player.buildings.lumberjack.built },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.sawmills = {
    "name": "Sawmills",
    "desc": "Lumberjack jobs gain an option to be electrified, producing double the amount of <i class='fa-solid fa-tree'></i> at the cost of <i class='fa-solid fa-bolt'></i> <span class='bold'>1</span> per <i class='fa-solid fa-tree'></i> <span class='bold'>3</span> produced, rounded up.",
    "possible": function() { return game.player.buildings.lumberjack.built && game.conditionals.get("seen_electricity"); },
    "prerequisites": ["mechanical_saw", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.lumberjack_automation = {
    "name": "Lumberjack Automation",
    "desc": "Electrified Lumberjack jobs have double the chance to not lose <i class='fa-solid fa-hammer'></i>.",
    "possible": function() { return game.player.buildings.lumberjack.built; },
    "prerequisites": ["sawmills", "industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Stoneworking tree
game.data.researches.stoneworking = {
    "name": "Stoneworking",
    "desc": "Unlock a Stone Quarry job, which produces <i class='fa-solid fa-cube'></i>.",
    "possible": function() { return game.conditionals.get("seen_wood") },
    "cost": game.data.research_tiers.tier_2.cost,
    "weight": game.data.research_tiers.tier_2.weight
};
game.data.researches.brickworks = {
    "name": "Brickworks",
    "desc": "Citizens in a Stone Quarry job have a 25% chance to not lose <i class='fa-solid fa-hammer'></i>.",
    "possible": function() { return game.player.buildings.stone_quarry.built },
    "prerequisites": ["stoneworking"],
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.cranes = {
    "name": "Cranes",
    "desc": "Stone Quarry jobs gain an option to be electrified, producing double the amount of <i class='fa-solid fa-cube'></i> at the cost of <i class='fa-solid fa-bolt'></i> <span class='bold'>1</span> per <i class='fa-solid fa-cube'></i> <span class='bold'>3</span> produced, rounded up.",
    "possible": function() { return game.player.buildings.stone_quarry.built && game.conditionals.get("seen_electricity"); },
    "prerequisites": ["brickworks", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.stone_quarry_automation = {
    "name": "Stone Quarry Automation",
    "desc": "Electrified Stone Quarry jobs have double the chance to not lose <i class='fa-solid fa-hammer'></i>.",
    "possible": function() { return game.player.buildings.stone_quarry.built; },
    "prerequisites": ["cranes", "industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Tools tree
game.data.researches.wooden_tools = {
    "name": "Wooden Tools",
    "desc": "Each Farm and Lumberjack job produces 1 resource extra.",
    "possible": function() { return game.conditionals.get("seen_wood") },
    "cost": game.data.research_tiers.tier_2.cost,
    "weight": game.data.research_tiers.tier_2.weight / 5.0
};
game.data.researches.stone_tools = {
    "name": "Stone Tools",
    "desc": "Each Farm, Lumberjack and Stone Quarry job produces 1 resource extra.",
    "possible": function() { return game.conditionals.get("seen_stone") },
    "prerequisites": ["wooden_tools"],
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight / 5.0
};
game.data.researches.metal_tools = {
    "name": "Metal Tools",
    "desc": "Each Farm, Lumberjack, Stone Quarry and Foundry job produces 1 resource extra.",
    "possible": function() { return game.conditionals.get("seen_metal") },
    "prerequisites": ["stone_tools"],
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.electric_tools = {
    "name": "Electric Tools",
    "desc": "If electrified, each Farm, Lumberjack, Stone Quarry and Foundry job produces 2 resources extra.",
    "possible": function() { return game.conditionals.get("seen_electricity") },
    "prerequisites": ["metal_tools", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};

// Farming tree
game.data.researches.agriculture = {
    "name": "Agriculture",
    "desc": "Unlock a Farm job, which produces <i class='fa-solid fa-wheat-awn'></i>.",
    "possible": function() { return game.conditionals.get("seen_wood") },
    "cost": game.data.research_tiers.tier_2.cost,
    "weight": game.data.research_tiers.tier_2.weight
};
game.data.researches.farmer_markets = {
    "name": "Farmer Markets",
    "desc": "If Farm would produce at least <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>5</span> in a year, an extra <i class='fa-solid fa-sack-dollar'></i> is produced.",
    "possible": function() { return game.player.buildings.farm.built; },
    "prerequisites": ["agriculture"],
    "on_research": function() {
        game.player.temporary_flags["seen_money"] = true;
        game.player.flags["help_seen_money"] = true;
    },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.irrigation = {
    "name": "Irrigation",
    "desc": "Farm jobs produce an extra <i class='fa-solid fa-wheat-awn'></i> per <i class='fa-solid fa-hammer'></i> and have a 50% chance to add an additional <i class='fa-solid fa-wheat-awn'></i>.",
    "possible": function() { return game.player.buildings.farm.built; },
    "prerequisites": ["agriculture"],
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight
};
game.data.researches.fertilizers = {
    "name": "Fertilizers",
    "desc": "Farm jobs produce an extra <i class='fa-solid fa-wheat-awn'></i> per <i class='fa-solid fa-hammer'></i>.",
    "possible": function() { return game.player.buildings.farm.built; },
    "prerequisites": ["irrigation"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};
game.data.researches.crop_rotation = {
    "name": "Crop Rotation",
    "desc": "Farm job gets a second slot.",
    "possible": function() { return game.player.buildings.farm.built; },
    "prerequisites": ["irrigation"],
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.grain_mills = {
    "name": "Grain Mills",
    "desc": "Farm jobs gain an option to be electrified, producing double the amount of <i class='fa-solid fa-wheat-awn'></i> at the cost of <i class='fa-solid fa-bolt'></i> <span class='bold'>1</span> per <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>3</span> produced, rounded up.",
    "possible": function() { return game.player.buildings.farm.built && game.conditionals.get("seen_electricity"); },
    "prerequisites": ["irrigation", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.farm_automation = {
    "name": "Farm Automation",
    "desc": "Electrified Farm jobs have double the chance to add an additional <i class='fa-solid fa-wheat-awn'></i>.",
    "possible": function() { return game.player.buildings.farm.built; },
    "prerequisites": ["grain_mills", "industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Trading tree
game.data.researches.trade_routes = {
    "name": "Trade Routes",
    "desc": "Unlock a Market Caravan job, which exchanges <i class='fa-solid fa-sack-dollar'></i> for <i class='fa-solid fa-wheat-awn'></i> <i class='fa-solid fa-tree'></i> <i class='fa-solid fa-cube'></i> at the cost of <i class='fa-solid fa-satellite-dish'></i>.",
    "possible": function() { return game.conditionals.get("seen_wood") && game.conditionals.get("seen_stone") && game.conditionals.get("seen_money") },
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight
};
game.data.researches.large_volume_trading = {
    "name": "Large Volume Trading",
    "desc": "Market Caravan job produces double the resources at the cost of <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>2</span>.",
    "possible": function() { return game.player.buildings.market_caravan.built },
    "prerequisites": ["trade_routes"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};
game.data.researches.massive_volume_trading = {
    "name": "Massive Volume Trading",
    "desc": "Market Caravan job produces ten times the resources at the cost of <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>10</span>.",
    "possible": function() { return game.player.buildings.market_caravan.built },
    "prerequisites": ["large_volume_trading"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};

// Science tree
game.data.researches.scientific_method = {
    "name": "Scientific Method",
    "desc": "<span class='class-scientist'>Scientists</span> working in Academia have a 1.5\xd7 chance to obtain a <i class='fa-solid fa-flask'></i>.",
    "possible": function() { return game.player.buildings.academia.built; },
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight
};
game.data.researches.mad_science = {
    "name": "Mad Science",
    "desc": "<span class='class-scientist'>Scientists</span> working in Academia always obtain a <i class='fa-solid fa-flask'></i>.",
    "possible": function() { return game.player.buildings.academia.built; },
    "prerequisites": ["scientific_method", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.peer_review = {
    "name": "Peer-Reviewed Journals",
    "desc": "<span class='class-scientist'>Scientists</span> working in Academia produce <i class='fa-solid fa-flask'></i> based on the <i class='fa-solid fa-flask'></i> symbols on the rolled side.",
    "possible": function() { return game.player.buildings.academia.built; },
    "prerequisites": ["scientific_method", "industrialization"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};
game.data.researches.nda = {
    "name": "NDA",
    "desc": "<span class='class-scientist'>Scientists</span> working in Academia do not gain <i class='fa-solid fa-satellite-dish decrease'></i>.",
    "possible": function() { return game.player.buildings.academia.built; },
    "prerequisites": ["mad_science", "peer_review"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Military tree
game.data.researches.garrison = {
    "name": "Garrison",
    "desc": "Unlock a Military Training job, which converts dice into <span class='class-soldier'>Soldiers</span>. Soldiers produce <i class='fa-solid fa-shield-halved'></i> at the cost of occasional <i class='fa-solid fa-hand-fist'></i>.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_stone") },
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight
};
game.data.researches.leadership = {
    "name": "Leadership",
    "desc": "Military Training is more effective.",
    "possible": function() { return game.player.buildings.military_training.built; },
    "prerequisites": ["garrison", "governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};

// Walls tree
game.data.researches.reinforced_walls = {
    "name": "Reinforced Walls",
    "desc": "Build a Wall job gets a second slot.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_stone") && game.player.buildings.wall.built; },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight
};

// Max detection tree
game.data.researches.language = {
    "name": "Language",
    "desc": "Increase <i class='fa-solid fa-satellite-dish'></i> limit by 2.",
    "possible": function() { return game.conditionals.get("seen_detection"); },
    "on_research": function() { game.player.resources.detection_max += 2; },
    "cost": game.data.research_tiers.tier_2.cost,
    "weight": game.data.research_tiers.tier_2.weight / 5.0
};
game.data.researches.ciphers = {
    "name": "Ciphers",
    "desc": "Increase <i class='fa-solid fa-satellite-dish'></i> limit by 6.",
    "possible": function() { return game.conditionals.get("seen_detection"); },
    "prerequisites": ["language"],
    "on_research": function() { game.player.resources.detection_max += 6; },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.cryptography = {
    "name": "Cryptography",
    "desc": "Increase <i class='fa-solid fa-satellite-dish'></i> limit by 15.",
    "possible": function() { return game.conditionals.get("seen_detection"); },
    "prerequisites": ["ciphers"],
    "on_research": function() { game.player.resources.detection_max += 15; },
    "cost": game.data.research_tiers.tier_7.cost,
    "weight": game.data.research_tiers.tier_7.weight / 5.0
};
game.data.researches.quantum_communications = {
    "name": "Quantum Communications",
    "desc": "Increase <i class='fa-solid fa-satellite-dish'></i> limit by 50.",
    "possible": function() { return game.conditionals.get("seen_detection"); },
    "prerequisites": ["cryptography"],
    "on_research": function() { game.player.resources.detection_max += 50; },
    "cost": game.data.research_tiers.tier_12.cost,
    "weight": game.data.research_tiers.tier_12.weight / 5.0
};

// Attack reduction tree
game.data.researches.moats = {
    "name": "Moats",
    "desc": "Decrease <i class='fa-solid fa-hand-fist'></i> by 1.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 8; },
    "on_research": function() { game.player.add_resource("attack", -1); },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};
game.data.researches.castles = {
    "name": "Castles",
    "desc": "Decrease <i class='fa-solid fa-hand-fist'></i> by 4.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 50; },
    "prerequisites": ["moats"],
    "on_research": function() { game.player.add_resource("attack", -4); },
    "cost": game.data.research_tiers.tier_5.cost,
    "weight": game.data.research_tiers.tier_5.weight / 5.0
};
game.data.researches.star_fortress = {
    "name": "Star Fortress",
    "desc": "Decrease <i class='fa-solid fa-hand-fist'></i> by 20.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 400; },
    "prerequisites": ["castles"],
    "on_research": function() { game.player.add_resource("attack", -20); },
    "cost": game.data.research_tiers.tier_7.cost,
    "weight": game.data.research_tiers.tier_7.weight / 5.0
};
game.data.researches.trench_warfare = {
    "name": "Trench Warfare",
    "desc": "Decrease <i class='fa-solid fa-hand-fist'></i> by 80.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 3000; },
    "prerequisites": ["star_fortress"],
    "on_research": function() { game.player.add_resource("attack", -80); },
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};
game.data.researches.dark_forest_protocol = {
    "name": "Dark Forest Protocol",
    "desc": "Set <i class='fa-solid fa-hand-fist'></i> to 10000.",
    "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack == constants.INFINITY; },
    "on_research": function() { game.player.resources.attack = 10000; },
    "cost": game.data.research_tiers.tier_12.cost,
    "weight": game.data.research_tiers.tier_12.weight / 5.0
};

// Metalworking tree
game.data.researches.metalworking = {
    "name": "Metalworking",
    "desc": "Unlock a Foundry job, which produces <i class='fa-solid fa-gem'></i>.",
    "possible": function() { return game.conditionals.get("seen_wood") && game.conditionals.get("seen_stone") },
    "cost": game.data.research_tiers.tier_3.cost,
    "weight": game.data.research_tiers.tier_3.weight
};
game.data.researches.blast_furnace = {
    "name": "Blast Furnace",
    "desc": "Foundry jobs gain an option to be electrified, producing double the amount of <i class='fa-solid fa-gem'></i> at the cost of <i class='fa-solid fa-bolt'></i> <span class='bold'>1</span> per <i class='fa-solid fa-gem'></i> <span class='bold'>3</span> produced, rounded up.",
    "possible": function() { return game.player.buildings.foundry.built && game.conditionals.get("seen_electricity"); },
    "prerequisites": ["metalworking", "electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.foundry_automation = {
    "name": "Foundry Automation",
    "desc": "Electrified Foundry jobs only lose either a <i class='fa-solid fa-cube'></i> symbol or a <i class='fa-solid fa-hammer'></i> symbol (chosen at random), not both.",
    "possible": function() { return game.player.buildings.foundry.built; },
    "prerequisites": ["blast_furnace", "industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Psychology
game.data.researches.psychology = {
    "name": "Psychology",
    "desc": "Unlock a Counseling job, which makes certain dice sides more likely to be rolled.",
    "possible": function() { return game.conditionals.get("seen_metal") },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight / 5.0
};

// Minting tree
game.data.researches.coin_minting = {
    "name": "Coin Minting",
    "desc": "Unlock a Mint job, which produces <i class='fa-solid fa-sack-dollar'></i> out of <i class='fa-solid fa-gem'></i>.",
    "possible": function() { return game.conditionals.get("seen_metal") },
    "cost": game.data.research_tiers.tier_4.cost,
    "weight": game.data.research_tiers.tier_4.weight
};
game.data.researches.paper_money = {
    "name": "Paper Money",
    "desc": "Mint gets an option to consume <i class='fa-solid fa-tree'></i> instead of <i class='fa-solid fa-gem'></i>.",
    "possible": function() { return game.player.buildings.mint.built },
    "prerequisites": ["coin_minting", "governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};
game.data.researches.central_bank = {
    "name": "Central Bank",
    "desc": "Mint job gets a second slot.",
    "possible": function() { return game.player.buildings.mint.built },
    "prerequisites": ["paper_money"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.digital_currency = {
    "name": "Digital Currency",
    "desc": "Mint jobs gain an additional <i class='fa-solid fa-sack-dollar'></i> symbol.",
    "possible": function() { return game.player.buildings.mint.built },
    "prerequisites": ["central_bank", "electricity"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};

// Banking tree
game.data.researches.banking = {
    "name": "Banking",
    "desc": "Unlock a Bank job, which produces <i class='fa-solid fa-sack-dollar'></i> out of <i class='fa-solid fa-sack-dollar'></i> symbols.",
    "possible": function() { return game.conditionals.get("seen_money") },
    "prerequisites": ["coin_minting", "governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};
game.data.researches.financial_instruments = {
    "name": "Financial Instruments",
    "desc": "Bank jobs produce <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>10</span> out of each <i class='fa-solid fa-sack-dollar'></i> symbol.",
    "possible": function() { return game.player.buildings.bank.built },
    "prerequisites": ["banking"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.modern_monetary_theory = {
    "name": "Modern Monetary Theory",
    "desc": "Bank jobs produce <i class='fa-solid fa-sack-dollar'></i> <span class='bold'>20</span> out of each <i class='fa-solid fa-sack-dollar'></i> symbol.",
    "possible": function() { return game.player.buildings.bank.built },
    "prerequisites": ["financial_instruments"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Governance
game.data.researches.governance = {
    "name": "Governance",
    "desc": "Unlock a Mayor job, which produces <i class='fa-solid fa-landmark'></i>.",
    "possible": function() { return game.player.prestige_upgrades.government.level > 0 && game.conditionals.get("seen_metal") && game.conditionals.get("seen_money") },
    "cost": game.data.research_tiers.tier_5.cost,
    "weight": game.data.research_tiers.tier_5.weight
};

// Theology tree
game.data.researches.theology = {
    "name": "Theology",
    "desc": "Unlock a Temple job, which converts citizens into <span class='class-priest'>Priests</span>.",
    "possible": function() { return game.player.prestige_upgrades.religion.level > 0 },
    "prerequisites": ["governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight
};
// Anthropology
game.data.researches.anthropology = {
    "name": "Anthropology",
    "desc": "All current and future <span class='class-priest'>Priests</span> get a <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>2</span> side.<br><span class='decrease'>Mutually exclusive with Fanaticism.</span>",
    "possible": function() { return !game.conditionals.get("research_fanaticism") },
    "prerequisites": ["theology"],
    "cost": game.data.research_tiers.tier_7.cost,
    "weight": game.data.research_tiers.tier_7.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 1);
            }
        }
        game.player.init();
        // Remove Fanaticism
        for (let i in game.player.researches) {
            if (game.player.researches[i] == "fanaticism") game.player.researches[i] = null;
        }
    }
};
game.data.researches.mythology = {
    "name": "Mythology",
    "desc": "All current and future <span class='class-priest'>Priests</span> get a <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>3</span> side.",
    "prerequisites": ["anthropology"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 2);
            }
        }
        game.player.init();
    }
};
game.data.researches.archaeology = {
    "name": "Archaeology",
    "desc": "All current and future <span class='class-priest'>Priests</span> get a <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>4</span> side.",
    "prerequisites": ["mythology"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 3);
            }
        }
        game.player.init();
    }
};
game.data.researches.merchandising = {
    "name": "Merchandising",
    "desc": "All current and future <span class='class-priest'>Priests</span> get a <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>5</span> side.",
    "prerequisites": ["archaeology"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 4);
            }
        }
        game.player.init();
    }
};
// Fanaticism
game.data.researches.fanaticism = {
    "name": "Fanaticism",
    "desc": "All current and future <span class='class-priest'>Priests</span> get another <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>1</span> side.<br><span class='decrease'>Mutually exclusive with Anthropology.</span>",
    "possible": function() { return !game.conditionals.get("research_anthropology") },
    "prerequisites": ["theology"],
    "cost": game.data.research_tiers.tier_7.cost,
    "weight": game.data.research_tiers.tier_7.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 0);
            }
        }
        game.player.init();
        // Remove Anthropology
        for (let i in game.player.researches) {
            if (game.player.researches[i] == "anthropology") game.player.researches[i] = null;
        }
    }
};
game.data.researches.indoctrination = {
    "name": "Indoctrination",
    "desc": "All current and future <span class='class-priest'>Priests</span> get another <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>1</span> side.",
    "prerequisites": ["fanaticism"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 0);
            }
        }
        game.player.init();
    }
};
game.data.researches.missionary = {
    "name": "Missionary",
    "desc": "All current and future <span class='class-priest'>Priests</span> get another <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>1</span> side.",
    "prerequisites": ["indoctrination"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 0);
            }
        }
        game.player.init();
    }
};
game.data.researches.zealotry = {
    "name": "Zealotry",
    "desc": "All current and future <span class='class-priest'>Priests</span> get another <i class='fa-solid fa-sun'></i> symbol on the <span class='bold'>1</span> side.",
    "prerequisites": ["missionary"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0,
    "on_research": function() {
        // Add symbols to Priests
        game.player.cleanup();
        for (let citizen_id in game.player.citizens) {
            if (game.player.citizens[citizen_id].class == "priest") {
                game.player.citizens[citizen_id].add_symbol("hope", 1, 0);
            }
        }
        game.player.init();
    }
};

// Prison tree
game.data.researches.penal_system = {
    "name": "Penal System",
    "desc": "Unlock a Prison job, which removes excess <i class='fa-solid fa-satellite-dish decrease'></i> symbols.",
    "possible": function() { return game.conditionals.get("seen_metal") },
    "prerequisites": ["governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight / 5.0
};
game.data.researches.community_service = {
    "name": "Community Service",
    "desc": "Prison jobs produce all resources on the rolled side other than <i class='fa-solid fa-satellite-dish decrease'></i>.",
    "possible": function() { return game.player.buildings.prison.built; },
    "prerequisites": ["penal_system"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight / 5.0
};
game.data.researches.behavioral_shaping = {
    "name": "Behavioral Shaping",
    "desc": "Prison always removes <i class='fa-solid fa-satellite-dish decrease'></i>.",
    "possible": function() { return game.player.buildings.prison.built; },
    "prerequisites": ["community_service", "psychology"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Specialists
game.data.researches.specialist_training = {
    "name": "Specialist Training",
    "desc": "Unlock a Specialist Training job, which adds <i class='fa-solid fa-hammer'></i> symbols and converts <span class='class-laborer'>Laborers</span> into <span class='class-specialist'>Specialists</span>.",
    "possible": function() { return game.conditionals.get("seen_money") },
    "prerequisites": ["governance"],
    "cost": game.data.research_tiers.tier_6.cost,
    "weight": game.data.research_tiers.tier_6.weight
};

// Unlocks tree
game.data.researches.electricity = {
    "name": "Electricity",
    "desc": "No effect. Prerequisite technology.",
    "prerequisites": ["metalworking", "specialist_training"],
    "cost": game.data.research_tiers.tier_7.cost,
    "weight": game.data.research_tiers.tier_7.weight
};
game.data.researches.industrialization = {
    "name": "Industrialization",
    "desc": "No effect. Prerequisite technology.",
    "prerequisites": ["electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight
};
game.data.researches.space_exploration = {
    "name": "Space Exploration",
    "desc": "No effect. Prerequisite technology.",
    "possible": function() { return game.player.prestige_upgrades.final_frontier.level > 0 },
    "prerequisites": ["industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight
};

// Internet
game.data.researches.internet = {
    "name": "Internet",
    "desc": "<i class='fa-solid fa-flask'></i> gain from each free citizen is raised to a power of 1.2 individually.",
    "prerequisites": ["industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight
};

// Power tree
game.data.researches.steam_engine = {
    "name": "Steam Engine",
    "desc": "Unlock a Coal Powerplant building, where <span class='class-specialist'>Specialists</span> produce <i class='fa-solid fa-bolt'></i>.",
    "prerequisites": ["electricity"],
    "cost": game.data.research_tiers.tier_8.cost,
    "weight": game.data.research_tiers.tier_8.weight
};
game.data.researches.oil_powerplant = {
    "name": "Oil Powerplant",
    "desc": "Unlock an Oil Powerplant building, where <span class='class-specialist'>Specialists</span> produce <i class='fa-solid fa-bolt'></i> from oil.",
    "prerequisites": ["industrialization", "oil_derrick", "steam_engine"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight
};
game.data.researches.alternative_energy = {
    "name": "Alternative Energy",
    "desc": "Unlock a Solar Panels building, which produces <i class='fa-solid fa-bolt'></i> passively.",
    "possible": function() { return game.conditionals.get("seen_plastic") },
    "prerequisites": ["industrialization"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};
game.data.researches.perovskite_cells = {
    "name": "Perovskite Cells",
    "desc": "Solar Panels only require 10 progress to get constructed.",
    "possible": function() { return game.player.buildings.solar_panels.built },
    "prerequisites": ["alternative_energy"],
    "cost": game.data.research_tiers.tier_12.cost,
    "weight": game.data.research_tiers.tier_12.weight / 5.0
};
game.data.researches.national_energy_grid = {
    "name": "National Energy Grid",
    "desc": "All Powerplant jobs get a second slot.",
    "prerequisites": ["steam_engine"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};
// TBC...

// Oil tree
game.data.researches.oil_derrick = {
    "name": "Oil Derrick",
    "desc": "Unlock an Oil Derrick building, which provides input for the oil-consuming buildings.",
    "prerequisites": ["industrialization"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight
};
game.data.researches.oil_refinery = {
    "name": "Oil Refinery",
    "desc": "Unlock an Oil Refinery building, where <span class='class-specialist'>Specialists</span> produce <i class='fa-solid fa-sheet-plastic'></i>.",
    "prerequisites": ["industrialization", "oil_derrick"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight
};
game.data.researches.shale_oil = {
    "name": "Shale Oil",
    "desc": "Oil Derrick job gets a second slot.",
    "possible": function() { return game.player.buildings.oil_derrick.built },
    "prerequisites": ["oil_derrick"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Cloning tree
game.data.researches.genetics = {
    "name": "Genetics",
    "desc": "No effect. Prerequisite technology.",
    "prerequisites": ["industrialization"],
    "cost": game.data.research_tiers.tier_9.cost,
    "weight": game.data.research_tiers.tier_9.weight / 5.0
};
game.data.researches.cloning = {
    "name": "Cloning",
    "desc": "Unlock the Clone Vats building, where people produce copies of themselves.",
    "prerequisites": ["genetics"],
    "cost": game.data.research_tiers.tier_10.cost,
    "weight": game.data.research_tiers.tier_10.weight / 5.0
};

// Space Exploration tree
game.data.researches.space_probes = {
    "name": "Space Probes",
    "desc": "Unlock the Space Probes building, which produces <i class='fa-solid fa-flask'></i> passively.",
    "prerequisites": ["space_exploration"],
    "cost": game.data.research_tiers.tier_11.cost,
    "weight": game.data.research_tiers.tier_11.weight
};
game.data.researches.project_genesis = {
    "name": "Project Genesis",
    "desc": "Unlock the Construct Generational Ship building, which allows you to win the game.<br><span class='comment'>We cannot put all our eggs in one basket. We need to spread among the stars, so the enemy cannot wipe us in one strike.</span>",
    "prerequisites": ["space_probes"],
    "cost": game.data.research_tiers.tier_12.cost,
    "weight": game.data.research_tiers.tier_12.weight
};
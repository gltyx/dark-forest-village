game.conditionals = {};

game.conditionals.get = function(conditional) {
    if (conditional in game.conditionals) return game.conditionals[conditional]();
    if (conditional in game.player.flags && game.player.flags[conditional]) return true;
    if (conditional in game.player.temporary_flags && game.player.temporary_flags[conditional]) return true;
    return false;
}

// Conditionals

game.conditionals.building_childbirth_needs_same_class = function() { return game.player.laws.social != "egalitarianism" };

game.conditionals.building_wall_choice_not_possible = function() { return !game.data.buildings.wall.choice_possible() };
game.conditionals.building_wall_choice_possible = function() { return game.data.buildings.wall.choice_possible() };

game.conditionals.building_mint_choice_not_possible = function() { return !game.data.buildings.mint.choice_possible() };
game.conditionals.building_mint_choice_possible = function() { return game.data.buildings.mint.choice_possible() };

game.conditionals.wooden_tools_are_the_best = function () { return game.conditionals.get("research_wooden_tools") && !game.conditionals.get("research_stone_tools")};
game.conditionals.stone_tools_are_the_best = function () { return game.conditionals.get("research_stone_tools") && !game.conditionals.get("research_metal_tools")};
game.conditionals.metal_tools_are_the_best = function () { return game.conditionals.get("research_metal_tools")};

game.conditionals.agriculture_is_the_best = function () { return game.conditionals.get("research_agriculture") && !game.conditionals.get("research_irrigation")};
game.conditionals.irrigation_is_the_best = function () { return game.conditionals.get("research_irrigation") && !game.conditionals.get("research_fertilizers")};
game.conditionals.fertilizers_is_the_best = function () { return game.conditionals.get("research_fertilizers")};

game.conditionals.mechanical_saw_is_the_best = function () { return game.conditionals.get("research_mechanical_saw")};

game.conditionals.brickworks_is_the_best = function () { return game.conditionals.get("research_brickworks")};

game.conditionals.garrison_is_the_best = function () { return game.conditionals.get("research_garrison") && !game.conditionals.get("research_leadership")};
game.conditionals.leadership_is_the_best = function () { return game.conditionals.get("research_leadership")};

game.conditionals.banking_is_the_best = function () { return game.conditionals.get("research_banking") && !game.conditionals.get("research_financial_instruments")};
game.conditionals.financial_instruments_is_the_best = function () { return game.conditionals.get("research_financial_instruments") && !game.conditionals.get("research_modern_monetary_theory")};
game.conditionals.modern_monetary_theory_is_the_best = function () { return game.conditionals.get("research_modern_monetary_theory")};

game.conditionals.trade_routes_is_the_best = function () { return game.conditionals.get("research_trade_routes") && !game.conditionals.get("research_large_volume_trading")};
game.conditionals.large_volume_trading_is_the_best = function () { return game.conditionals.get("research_large_volume_trading") && !game.conditionals.get("research_massive_volume_trading")};
game.conditionals.massive_volume_trading_is_the_best = function () { return game.conditionals.get("research_massive_volume_trading")};

game.conditionals.no_behavioral_shaping = function () { return !game.conditionals.get("research_behavioral_shaping")};

game.conditionals.no_fanaticism = function () { return !game.conditionals.get("research_fanaticism")};
game.conditionals.no_anthropology = function () { return !game.conditionals.get("research_anthropology")};

game.conditionals.fanaticism_is_the_best = function () { return game.conditionals.get("research_fanaticism") && !game.conditionals.get("research_indoctrination")};
game.conditionals.indoctrination_is_the_best = function () { return game.conditionals.get("research_indoctrination") && !game.conditionals.get("research_missionary")};
game.conditionals.missionary_is_the_best = function () { return game.conditionals.get("research_missionary") && !game.conditionals.get("research_zealotry")};
game.conditionals.zealotry_is_the_best = function () { return game.conditionals.get("research_zealotry")};

game.conditionals.anthropology_is_the_best = function () { return game.conditionals.get("research_anthropology") && !game.conditionals.get("research_mythology")};
game.conditionals.mythology_is_the_best = function () { return game.conditionals.get("research_mythology") && !game.conditionals.get("research_archaeology")};
game.conditionals.archaeology_is_the_best = function () { return game.conditionals.get("research_archaeology") && !game.conditionals.get("research_merchandising")};
game.conditionals.merchandising_is_the_best = function () { return game.conditionals.get("research_merchandising")};

game.conditionals.is_not_totalitarian = function () { return game.player.laws.political != "totalitarianism"};
game.conditionals.is_totalitarian = function () { return game.player.laws.political == "totalitarianism"};

game.conditionals.is_not_serfdom = function () { return game.player.laws.social != "serfdom"};
game.conditionals.is_serfdom = function () { return game.player.laws.social == "serfdom"};

game.conditionals.has_retraining_prestige_upgrade = function() { return game.player.prestige_upgrades.retraining.level > 0 };
game.conditionals.has_religion_upgrade = function() { return game.player.prestige_upgrades.religion.level > 0 };
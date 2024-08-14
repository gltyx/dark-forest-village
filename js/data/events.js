// Inner variables:
// - possible: a function that returns whether this event can happen yet
// - percentage: a function (or a number) that returns a percentage chance that this event happens whenever the "possible" condition is met
// - name: a name of the event
// - desc: a description of the event
// - immediate: a function that is run when the event is selected, useful to set any flags. None if empty
// - options: an array of possible responses. Each option contains:
// --- possible: a function determining whether an option can be picked, true by default
// --- text: the text of the option
// --- effect: the description of what the option does
// --- result: a function that is called when the option is selected

game.data.events = {
    "weary_traveller": {
        "possible": function() { return !game.conditionals.get("seen_detection") && game.player.year >= 10},
        "percentage": 100,
        "name": "A Weary Traveller",
        "desc": "A weary traveller arrived to our village a few days ago.<br><br>They are of adventurous and independent sort, willing to see all the lands under the heavens. They told us tales about other settlements they have been visiting, and how the life in them is; it seems like many other villages are doing more poorly than ours. The adventurer stayed in our village a few days and then departed into the lands unknown.<br><br><span class='decrease'>We believe that if enough information about our settlement gets out, we might be subject to attacks from hostile parties. Check the \"Notice and Attacks\" article in Help for more information.</span>",
        "options": [
            {
                "text": "We have been noticed",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { game.player.add_resource("detection", 1); }
            }
        ]
    },
    "venture_trader": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.citizen_count() > 0 },
        "percentage": function() { return game.conditionals.get("venture_trader_happened") ? 0.2 : 2 },
        "name": "A Business Opportunity",
        "desc": "One of the village's residents decided to try their hand on a business opportunity of trading with the nearby settlements. The trade promises to be lucrative and bring monetary benefits, but it will also expose information about our village to potentially malicious parties.<br><br>The self-styled trader asked us to provide additional support in their venture, promising a greater share of profits in return.",
        "immediate": function() { game.player.temporary_flags.venture_trader_happened = true },
        "options": [
            {
                "text": "We will provide support",
                "effect": "A random citizen will get <i class='fa-solid fa-sack-dollar'></i><i class='fa-solid fa-sack-dollar'></i> and <i class='fa-solid fa-satellite-dish decrease'></i> on the current side",
                "result": function() { 
                    let random_citizen = helpers.random_key(game.player.citizens);
                    game.player.citizens[random_citizen].add_symbol("money", 2);
                    if (!game.prestige.avoid_detection_roll()) game.player.citizens[random_citizen].add_symbol("detection", 1);
                    game.player.cleanup();
                    game.player.init();
                }
            },
            {
                "text": "Maybe later",
                "effect": "A random citizen will get <i class='fa-solid fa-sack-dollar'></i> and <i class='fa-solid fa-satellite-dish decrease'></i> on random sides",
                "result": function() { 
                    let random_citizen = helpers.random_key(game.player.citizens);
                    game.player.citizens[random_citizen].add_symbol("money", 1, helpers.randint(5));
                    if (!game.prestige.avoid_detection_roll()) game.player.citizens[random_citizen].add_symbol("detection", 1, helpers.randint(5));
                    game.player.cleanup();
                    game.player.init();
                }
            }
        ]
    },
    "stealing_science": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_science") && game.player.resources.attack < 20 && game.player.resources.attack != constants.INFINITY },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.8) },
        "name": "Stealing Scientific Advancements",
        "desc": "One of our neighboring settlements seems to have discovered a new exciting scientific advancement, but refuses to share it with outsiders. Those were the news that a group of our citizens brought back after paying the narby settlements a friendly visit.<br><br>Now, we are unsure what is exactly behind the miracles they are talking about, but we can try to send more people in to try and decipher it. Or we can try to infiltrate them seriously and steal all their work, but this would certainly bring great retribution.",
        "options": [
            {
                "text": "Steal it",
                "effect": "+6 <i class='fa-solid fa-flask'></i>, <span class='decrease'>+2 <i class='fa-solid fa-hand-fist'></i></span>, <span class='decrease'>+3 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("science", 6);
                    game.player.add_resource("attack", 2);
                    game.player.add_resource("detection", 3);
                }
            },
            {
                "text": "Mingle",
                "effect": "+2 <i class='fa-solid fa-flask'></i>, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("science", 2);
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Do nothing",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "famine": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.wheat >= 2 * game.player.population_limit },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.5) },
        "name": "A Great Famine",
        "desc": "The weather was definitely not kind to us this year. The drought that lasted all summer killed our crops, and famine has enveloped the land. People are not getting enough food to survive, and food riots are surely unavoidable if nothing is done about it.<br><br>We can either open our own granaries for people to feed on, or ask our neighbors to share what they can afford to give away.",
        "options": [
            {
                "text": "Use our stocks to help the hungry",
                "effect": "Lose 50% of stored <i class='fa-solid fa-wheat-awn'></i>, rounded up",
                "result": function() { 
                    game.player.add_resource("wheat", -Math.ceil(game.player.resources.wheat / 2.0));
                }
            },
            {
                "text": "Ask neighbors for help",
                "effect": "<span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 2);
                }
            }
        ]
    },
    "taste_of_human_flesh": {
        "possible": function() { return game.player.resources.wheat <= 1 && !game.conditionals.get("taste_of_human_flesh_happened") },
        "percentage": 8,
        "name": "The Taste of Human Flesh",
        "desc": "Many people in out village are concerned that the dire times seem to be ahead. The food stockpiles are dwindling, and there is a growing uncertainty that it might not be enough to sustain the current population for much longer. People are wondering if there are solutions to this problem, perhaps unconventional ones... surely, it can't be...<br><br>Surely...",
        "immediate": function() { game.player.temporary_flags.taste_of_human_flesh_happened = true },
        "options": [
            {
                "text": "Human meat is on the menu today!",
                "effect": "Exile job is replaced by Human Sacrifice job, producing <i class='fa-solid fa-wheat-awn'></i> <span class='bold'>3</span> per assigned worker",
                "result": function() { 
                    game.player.temporary_flags.human_sacrifice_enabled = true;
                }
            },
            {
                "text": "We are above that",
                "effect": "This event will not occur again until you prestige",
                "result": function() { 

                }
            }
        ]
    },
    "culture_craze": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_production") },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.8) },
        "name": "A Foreign Culture Craze",
        "desc": "Some details of a culture from a nearby settlement are spreading across our village like wildfire. People are incorporating some foreign words in their speech and electing to wear clothing inspired by that of our culturally-dominating neighbors.<br><br>This trend does not yet seem violent or otherwise impacting job performance, so there is no harm in letting the people continue experimenting with the customs - other than the increased risk of exposure of our village's wealth, of course. We can also invest into making our local culture more popular to counteract the trend, if we have enough skilled craftsmen on hand.",
        "options": [
            {
                "text": "Work on promoting local culture",
                "possible": function() { return game.player.can_afford({"production": 4})},
                "effect": "-4 <i class='fa-solid fa-hammer'></i>",
                "result": function() { 
                    game.player.add_resource("production", -4);
                }
            },
            {
                "text": "Let them be",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "receding_forest": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.buildings.lumberjack.built },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.6) },
        "name": "The Receding Forest",
        "desc": "Our wood chopping efforts are making a mark on the landscape around our village. What was once a dense dark forest, is now a brightly-lit clearing. Some people are afraid that if we continue destroying the forest like that, it would cripple our defences and allow enemies to easily crush our village, if they so desire.<br><br>Of course, this is a minority opinion, so we are welcome to ignore them if we so desire. They might have a point, though, so perhaps we can delay logging operations for a year, enough for new saplings to take root in the land we stripped clean of trees before.",
        "options": [
            {
                "text": "Let the trees regenerate",
                "effect": "The Lumberjack job is not available this year",
                "result": function() { 
                    game.player.temporary_flags.one_turn_lumberjack_ban = true;
                }
            },
            {
                "text": "We don't care",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "windfall": {
        "possible": function() { return game.conditionals.get("seen_money") },
        "percentage": 0.5,
        "name": "An Unexpected Windfall",
        "desc": "A good weather and productive hard-working population led to out village generating more profits than what we estimated. The treasury is flush with cash, and we have a unique opportunity to re-invest the extra income into making the populace moe productive in general.<br><br>What should we do with the unexpected windfall?",
        "options": [
            {
                "text": "Invest in farming equipment",
                "possible": function() { 
                    for (let citizen_id in game.player.citizens) {
                        if (game.elements.dice.is_peasant(game.player.citizens[citizen_id])) return true;
                    }
                    return false;
                },
                "effect": "A random <span class='class-peasant'>Peasant</span> receives a <i class='fa-solid fa-wheat-awn'></i> on current side",
                "result": function() { 
                    let citizen_count = 0;
                    for (let citizen_id in game.player.citizens) {
                        if (game.elements.dice.is_peasant(game.player.citizens[citizen_id])) citizen_count += 1;
                    }
                    citizen_count = helpers.randint(citizen_count - 1);
                    for (let citizen_id in game.player.citizens) {
                        if (game.elements.dice.is_peasant(game.player.citizens[citizen_id])) {
                            citizen_count -= 1;
                            if (citizen_count < 0) {
                                game.player.citizens[citizen_id].add_symbol("wheat", 1);
                                game.player.cleanup();
                                game.player.init();
                                return;
                            }
                        }
                    }
                }
            },
            {
                "text": "Invest in production equipment",
                "possible": function() { 
                    for (let citizen_id in game.player.citizens) {
                        if (game.player.citizens[citizen_id].class == "laborer") return true;
                    }
                    return false;
                },
                "effect": "A random <span class='class-laborer'>Laborer</span> receives a <i class='fa-solid fa-hammer'></i> on current side",
                "result": function() { 
                    let citizen_count = 0;
                    for (let citizen_id in game.player.citizens) {
                        if (game.player.citizens[citizen_id].class == "laborer") citizen_count += 1;
                    }
                    citizen_count = helpers.randint(citizen_count - 1);
                    for (let citizen_id in game.player.citizens) {
                        if (game.player.citizens[citizen_id].class == "laborer") {
                            citizen_count -= 1;
                            if (citizen_count < 0) {
                                game.player.citizens[citizen_id].add_symbol("production", 1);
                                game.player.cleanup();
                                game.player.init();
                                return;
                            }
                        }
                    }
                }
            },
            {
                "text": "Put it into treasury",
                "effect": "+2 <i class='fa-solid fa-sack-dollar'></i>",
                "result": function() { 
                    game.player.add_resource("money", 2);
                }
            }
        ]
    },
    "investment_opportunity": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.money >= 10 },
        "percentage": 0.6,
        "name": "An Investment Opportunity",
        "desc": "Seems that business is booming in one of our neighboring settlements. Markets are full of goods from various parts of the world, and people are richer than ever.<br><br>We have located an opportunity: we can invest some money into their economy to profit from this prosperity. This investment seems to be relatively risk-free and provide us with some profits, but it will expose to others how much money we have. Should we proceed?",
        "options": [
            {
                "text": "Proceed with the investment",
                "effect": "Gain 5%-10% of current <i class='fa-solid fa-sack-dollar'></i>, rounded up. <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("money", Math.ceil((Math.random() * 0.05 + 0.05) * game.player.resources.money));
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Decline the opportunity",
                "effect": "No effect",
                "result": function() { 
                    
                }
            }
        ]
    },
    "vassalization": {
        "possible": function() { return game.player.resources.detection >= 0.89 * game.player.resources.detection_max && game.player.resources.attack > game.player.resources.defense && game.conditionals.get("seen_detection") && !game.conditionals.get("vassalization_proposal_happened") },
        "percentage": 4,
        "name": "A Vassalization Proposal",
        "desc": "It is definitely true that the village is struggling to defend itself this days. The invasion is all but inevitable, and we are currently projected to lose. Seeing our struggles, a foreign power came up with a once-per-lifetime proposal: submit and become their vassal, but in exchange receive a modicum of protection that being in the larger empire provides.<br><br>Naturally, if we agree to those terms, we would not be able to continue our isolationist policy we pursued up to date, so it only will be a matter of time until the dangers lurking around the world will notice our settlement and decide to strike. The decision is ultimately ours.",
        "immediate": function() { game.player.temporary_flags.vassalization_proposal_happened = true },
        "options": [
            {
                "text": "We will submit",
                "effect": "Double the <i class='fa-solid fa-satellite-dish'></i> needed to trigger an attack, but gain <span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span> every year onwards",
                "result": function() { 
                    game.player.resources.detection_max *= 2;
                    game.player.temporary_flags.vassal_of_an_empire = true;
                }
            },
            {
                "text": "We will stay independent",
                "effect": "This event will not occur again until you prestige",
                "result": function() { 

                }
            }
        ]
    },
    "death_of_great_person": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.citizen_count() > 0 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.2) },
        "name": "Death of a Great Person",
        "desc": "A great person has passed away today. They were a good friend, an excellent colleague and a loving parent. Many people in our village knew them and had a good opinion of them. Their unique skills will be sorely missed by the village as a whole. Let's take a minute to mourn the good soul that left the mortal world today.",
        "options": [
            {
                "text": "It will take time to recover",
                "effect": "A random citizen is removed from the game",
                "result": function() { 
                    let citizen_count = 0;
                    for (let citizen_id in game.player.citizens) {
                        citizen_count += 1;
                    }
                    citizen_count = helpers.randint(citizen_count - 1);
                    for (let citizen_id in game.player.citizens) {
                        citizen_count -= 1;
                        if (citizen_count < 0) {
                            game.player.remove_citizen(citizen_id);
                            return;
                        }
                    }
                }
            },
            {
                "text": "Recruit people from abroad to replace them",
                "effect": "<span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 2);
                }
            }
        ]
    },
    "hunting_grounds_contested": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack < 20 && game.player.resources.attack != constants.INFINITY },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(1) },
        "name": "Hunting Grounds Contested",
        "desc": "There is a nice lake nearby our village, in the depts of the dark forest surrounding us. It is nice and tranquil, and many animals like to visit it too. The area around it was a perfect spot fo a sustainable hunting operation we were performing.<br><br>Not anymore, as it seems we have a competitor now. Hunting parties from the nearby settlement invaded this natural land and are stripping it clean from its animal beauty. If we don't do anything about it, we will lose it to them and will be unable to hunt there anymore.",
        "options": [
            {
                "text": "Take it back",
                "effect": "+8 <i class='fa-solid fa-wheat-awn'></i>, <span class='decrease'>+1 <i class='fa-solid fa-hand-fist'></i></span>, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("wheat", 8);
                    game.player.add_resource("attack", 1);
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Let them have it",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "merchant_caravan": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_money") },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.6) },
        "name": "Visiting Merchant Caravan",
        "desc": "A trade caravan has arrived in our village a few days ago. They have established contacts in many other settlements, and can get a lot of resources for their clients if needed. If we want to, we can order some basic resources in bulk, and they will return to our village later to deliver them.",
        "options": [
            {
                "text": "Buy some food",
                "possible": function() { 
                    return game.player.resources.money >= 1;
                },
                "effect": "+5 <i class='fa-solid fa-wheat-awn'></i>, -1 <i class='fa-solid fa-sack-dollar'></i>, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("wheat", 5);
                    game.player.add_resource("money", -1);
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Buy some wood",
                "possible": function() { 
                    return game.player.resources.money >= 1 && game.conditionals.get("seen_wood");
                },
                "effect": "+5 <i class='fa-solid fa-tree'></i>, -1 <i class='fa-solid fa-sack-dollar'></i>, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("wood", 5);
                    game.player.add_resource("money", -1);
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Buy some stone",
                "possible": function() { 
                    return game.player.resources.money >= 1 && game.conditionals.get("seen_stone");
                },
                "effect": "+5 <i class='fa-solid fa-cube'></i>, -1 <i class='fa-solid fa-sack-dollar'></i>, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("stone", 5);
                    game.player.add_resource("money", -1);
                    game.player.add_resource("detection", 2);
                }
            },
            {
                "text": "Don't buy anything",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "civil_war": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 300 && game.player.resources.defense >= 10 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.3) },
        "name": "Civil War",
        "desc": "A violent insurgency has started in the deep woods around our village recently. The rebels are cutting off supply routes and demanding the change in the village governance, going as far as promising to execute the current elite.<br><br>They don't have a lot of support in their demands, but they are still a serious nuisance affecting our day-to-day operations, and must be dealt with with haste. If our own forces are inadequate to deal with the task on hand, we can ask neighbors to help, but this would definitely be recognized as a moment of weakness by any possible invaders.",
        "options": [
            {
                "text": "Eradicate them",
                "effect": "Lose 50% of stored <i class='fa-solid fa-shield-halved'></i>, rounded up",
                "result": function() { 
                    game.player.add_resource("defense", -Math.ceil(game.player.resources.defense / 2.0));
                }
            },
            {
                "text": "Ask other nations to help",
                "effect": "<span class='decrease'>+5 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 5);
                }
            }
        ]
    },
    "scientist_emigrates": {
        "possible": function() { 
            if (!game.conditionals.get("seen_detection")) return false;
            for (let citizen_id in game.player.citizens) {
                if (game.player.citizens[citizen_id].class == "scientist") return true;
            }
            return false;
        },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.2) },
        "name": "Scientist Emigrates",
        "desc": "While our village has an established scientific community, one of the other settlements has earned a reputation of being a center of research and advancement. One of our brilliant scientists has received an offer to relocate to said settlement on account of their giftedness, and accepted the offer.<br><br>If we want the scientist to stay, we will need to provide them with a sufficiently lucrative counter-offer.",
        "options": [
            {
                "text": "Let them go",
                "effect": "A random <span class='class-scientist'>Scientist</span> is removed from the game",
                "result": function() { 
                    let citizen_count = 0;
                    for (let citizen_id in game.player.citizens) {
                        if (game.player.citizens[citizen_id].class == "scientist") citizen_count += 1;
                    }
                    citizen_count = helpers.randint(citizen_count - 1);
                    for (let citizen_id in game.player.citizens) {
                        if (game.player.citizens[citizen_id].class == "scientist") {
                            citizen_count -= 1;
                            if (citizen_count < 0) {
                                game.player.remove_citizen(citizen_id);
                                return;
                            }
                        }
                    }
                }
            },
            {
                "text": "Convince them to stay",
                "possible": function() { 
                    return game.player.resources.money >= 3;
                },
                "effect": "-3 <i class='fa-solid fa-sack-dollar'></i>",
                "result": function() { 
                    game.player.add_resource("money", -3);
                }
            }
        ]
    },
    "spy_uncovered": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.citizen_count() > 0 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.2) },
        "name": "Spy Uncovered",
        "desc": "We have received an undeniable proof that one of our citizens is working as a spy for a foreign power. They don't seem to be in any position of power, so the risks are minimal, but the information leak might help some entities who would like to conquer our village.<br><br>Should we do anything specific about the spy in our ranks?",
        "options": [
            {
                "text": "Keep watch on them",
                "effect": "A random citizen will get <i class='fa-solid fa-satellite-dish decrease'></i> on the current side",
                "result": function() { 
                    let random_citizen = helpers.random_key(game.player.citizens);
                    if (!game.prestige.avoid_detection_roll()) game.player.citizens[random_citizen].add_symbol("detection", 1);
                    game.player.cleanup();
                    game.player.init();
                }
            },
            {
                "text": "Restrict information access",
                "effect": "A random citizen will lose a random positive symbol on two random sides",
                "result": function() { 
                    let random_citizen = helpers.random_key(game.player.citizens);
                    let random_side_1 = helpers.randint(5);
                    let random_side_2 = helpers.randint(4);
                    if (random_side_2 >= random_side_1) random_side_2 += 1;
                    if (game.player.citizens[random_citizen].symbol_count(true, random_side_1) > 0) game.player.citizens[random_citizen].add_symbol(game.player.citizens[random_citizen].random_symbol(true, random_side_1), -1, random_side_1);
                    if (game.player.citizens[random_citizen].symbol_count(true, random_side_2) > 0) game.player.citizens[random_citizen].add_symbol(game.player.citizens[random_citizen].random_symbol(true, random_side_2), -1, random_side_2);
                    game.player.cleanup();
                    game.player.init();
                }
            }
        ]
    },
    "leader_appreciation_day": {
        "percentage": 0.5,
        "name": "Leader Appreciation Day",
        "desc": "Celebrations are filling the streets of our village, as the people are thanking the village elites for their work of making the settlement safe and secure. With the positive emotions spreading through the population and all day-to-day problems resolved, people will be motivated to work extra hard this year.",
        "options": [
            {
                "text": "Cheers!",
                "effect": "Free citizens will produce double the amount of positive resources this year",
                "result": function() { 
                    game.player.temporary_flags.one_turn_double_production = true;
                }
            }
        ]
    },
    "new_world_plague": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack >= 150 && game.player.resources.attack < 300 && !game.conditionals.get("plague_happened") },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(3) },
        "name": "The Great Plague",
        "desc": "We have always known that there is something off about those outsiders who arrived from the Great Beyond. They look different, and they are acting like they own this entire place. Now, it seems, they called upon the spirits of death to execute their will and kill the native population, which also includes the citizenry of our village.<br><br>People are suddenly falling ill and then dying left and right, and soon the wave of the casualties will reach our settlement. Something must be done, we need to protect ourselves!",
        "immediate": function() { game.player.temporary_flags.plague_happened = true },
        "options": [
            {
                "text": "We will persevere",
                "effect": "All citizens who rolled <i class='fa-solid fa-satellite-dish decrease'></i> will be removed from the game",
                "result": function() { 
                    let naughty_citizen_list = [];
                    for (let citizen_id in game.player.citizens) {
                        if (helpers.get(game.player.citizens[citizen_id].get_side().symbols, "detection", 0) > 0) {
                            naughty_citizen_list.push(citizen_id);
                        }
                    }
                    for (let citizen_id of naughty_citizen_list) {
                        game.player.remove_citizen(citizen_id);
                    }
                }
            },
            {
                "text": "Stay in your homes!",
                "effect": "Free citizens will produce nothing this turn",
                "result": function() { 
                    game.player.temporary_flags.one_turn_no_production = true;
                }
            }
        ]
    },
    "diplomatic_settlement": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_bureaucracy") && game.player.resources.attack >= 20 },
        "percentage": 0.7,
        "name": "The Diplomatic Settlement",
        "desc": "For the past few years, two nations waged a war in our vicinity, but the hostilities seem to be over. The parties have agreed to a ceasefire for now, with the potential to discuss a lasting peace settlement.<br><br>This might present an opportunity for our village: as a neutral party in that conflict, our settlement will be a great place for any potential peace talks, if we dare to propose them. We will definitely become a juicier target for any entities who wish to exploit our success, but we can build reputation and learn something about diplomacy and governance in the meantime.",
        "options": [
            {
                "text": "Propose to host peace talks",
                "effect": "+1 <i class='fa-solid fa-landmark'></i>, <span class='decrease'>+3 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("bureaucracy", 1);
                    game.player.add_resource("detection", 3);
                }
            },
            {
                "text": "Stay silent",
                "effect": "No effect",
                "result": function() { 

                }
            }
        ]
    },
    "refugees": {
        "possible": function() { 
            if (!game.conditionals.get("seen_detection")) return false;

            let citizen_count = 0;
            for (let citizen_id in game.player.citizens) {
                citizen_count += 1;
            }
            if (citizen_count >= game.player.population_limit) return false;
            return true;
        },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.4) },
        "name": "A Wave of Refugees",
        "desc": "Whether due to a violent conflict, sudden climate shifts or otherwise, there was a huge wave of people moving to other places this year. One of such groups arrived to our village, asking for the basic stuff: water, food, shelter and a stable job.<br><br>The group seems to be hard-working and is definitely a good fit for our village, but if we are short on resources right now, we can always tell them to try their luck elsewhere.",
        "options": [
            {
                "text": "Grant them citizenship",
                "effect": "A <span class='class-peasant'>Peasant</span> is created, <span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 2);
                    game.player.add_citizen(game.elements.dice.create());
                }
            },
            {
                "text": "Send them away",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                }
            }
        ]
    },
    "world_war": {
        "possible": function() { return game.conditionals.get("seen_detection") && !game.conditionals.get("world_war_happened") && game.player.resources.attack >= 600 && game.player.resources.attack < 1000 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(2) },
        "name": "The World War is Raging On",
        "desc": "An empire with the globe-spanning ambitions emerged elsewhere on the continent we live on and started a string of brutal conquests to enforce their will on the world. An alliance of free countries has formed to counteract the invading menace, and they have formally extended an invitation for us to join them and help in their struggle. We believe this will for certain trigger the invasion from the opposing side, but the alliance promised us to help fighting it off.<br><br>If we don't intervene, the conqueror will likely go against us anyway later, but a few years of delay might be enough to prepare for the oncoming threat...",
        "immediate": function() { game.player.temporary_flags.world_war_happened = true },
        "options": [
            {
                "text": "Join ranks with the free world",
                "effect": "<i class='fa-solid fa-hand-fist'></i> will be reduced by 50%. The <i class='fa-solid fa-satellite-dish'></i> meter will be filled up",
                "result": function() { 
                    game.player.add_resource("attack", -Math.ceil(game.player.resources.attack / 2.0));
                    game.player.resources.detection = game.player.resources.detection_max;
                }
            },
            {
                "text": "Declare neutrality",
                "effect": "<i class='fa-solid fa-hand-fist'></i> will be increased by 50%",
                "result": function() { 
                    game.player.add_resource("attack", Math.floor(game.player.resources.attack / 2.0));
                }
            }
        ]
    },
    "olympics": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_money") },
        "percentage": 0.5,
        "name": "An International Sports Competition",
        "desc": "A few nations around us came up with an interesting idea to organize an international sports competition to promote peace and diversity in the world. The athletes from each state would compete in a selection of sports, with the best of the best earning medals together with a monetary prize.<br><br>The organizers still did not select the venue, so we potentially can propose our village if we know a thing about governance and can afford the budget. Alternatively, we can just send our team to the event, hoping to win prizes. Of course, both of those options expose our village to outsiders, so they might not be recommended if the invasion is on the horizon.",
        "options": [
            {
                "text": "Propose to host the games",
                "possible": function() { 
                    return game.conditionals.get("seen_bureaucracy") && game.player.resources.money >= 5;
                },
                "effect": "+1 <i class='fa-solid fa-landmark'></i>, -5 <i class='fa-solid fa-sack-dollar'></i>, <span class='decrease'>+3 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("bureaucracy", 1);
                    game.player.add_resource("money", -5);
                    game.player.add_resource("detection", 3);
                }
            },
            {
                "text": "Send athletes to participate",
                "effect": "<span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>, 33% chance to get +5 <i class='fa-solid fa-sack-dollar'></i>",
                "result": function() { 
                    game.player.add_resource("detection", 1);
                    if (helpers.percentile_roll(100 / 3.0)) game.player.add_resource("money", 5);
                }
            },
            {
                "text": "Ignore them",
                "effect": "No effect",
                "result": function() { 

                }
            }
        ]
    },
    "inflation": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.conditionals.get("seen_money") && game.player.resources.money > 0 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.3) },
        "name": "Rising Inflation",
        "desc": "The prices went up really high in the past few years, and economists mostly agree that they are projected to go even higher this year. For the treasury like ours, where most money is stored in its monetary form, it might spell a disaster, as the purchasing power of the current balance will drop significantly. There are ways out of it, but they involve relying on other economies that do not experience overheating right now, and therefore will expose our village's situation to other entities.",
        "options": [
            {
                "text": "Curses!",
                "effect": "Lose 50% of stored <i class='fa-solid fa-sack-dollar'></i>, rounded up",
                "result": function() { 
                    game.player.add_resource("money", -Math.ceil(game.player.resources.money / 2.0));
                }
            },
            {
                "text": "Diversify into foreign economies",
                "effect": "<span class='decrease'>+2 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("detection", 2);
                }
            }
        ]
    },
    "great_fire": {
        "possible": function() { 
            if (!game.conditionals.get("seen_wood")) return false;

            for (let building_id in game.data.buildings) {
                if (!("build_cost" in game.data.buildings[building_id])) continue;
                if (game.player.buildings[building_id].built) return true;
            }

            return false;
        },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.2) },
        "name": "The Great Fire",
        "desc": "Due to an unfortunate accident, a great fire was unleashed upon the village. Thick smoke and fog covered the skies, while the citizens fought desperately to stop the spread of brilliant red flames which consume everything in their path.<br><br>On the next day, the aftermath was clear.",
        "options": [
            {
                "text": "It burned down a building!",
                "effect": "A random village building is destroyed, you will need to rebuild it",
                "result": function() { 
                    let target_buildings = {};
                    for (let building_id in game.data.buildings) {
                        if (!("build_cost" in game.data.buildings[building_id])) continue;
                        if (game.player.buildings[building_id].built) target_buildings[building_id] = true;
                    }

                    let target_building = helpers.random_key(target_buildings);
                    game.player.buildings[target_building].built = false;
                }
            },
            {
                "text": "It burned down our wood supplies!",
                "effect": "Lose all stored <i class='fa-solid fa-tree'></i>",
                "result": function() { 
                    game.player.resources.wood = 0;
                }
            }
        ]
    },
    "disaster_relief": {
        "possible": function() { return game.conditionals.get("seen_detection") && game.player.resources.attack < 20 && game.player.resources.attack != constants.INFINITY },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(0.2) },
        "name": "Disaster Relief",
        "desc": "A neighbouring settlement was struck by a catastrophe this year. All their crops were destroyed due to the accidents of Nature, and their food stocks are running low. They sent a plea for help to all nearby settlements; should we answer it and help them withstand the food crisis?",
        "options": [
            {
                "text": "Help them",
                "possible": function() { 
                    return game.player.resources.wheat >= 5;
                },
                "effect": "-5 <i class='fa-solid fa-wheat-awn'></i>, <span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span>",
                "result": function() { 
                    game.player.add_resource("wheat", -5);
                    game.player.add_resource("detection", 1);
                }
            },
            {
                "text": "We cannot help",
                "effect": "<span class='decrease'>+2 <i class='fa-solid fa-hand-fist'></i></span>",
                "result": function() { 
                    game.player.add_resource("attack", 2);
                }
            }
        ]
    },
    "satellite_launch": {
        "possible": function() { return !game.conditionals.get("satellite_launch_happened") && game.player.year >= 100 },
        "percentage": function() { return game.prestige.modify_negative_event_percentage(5) },
        "name": "Satellite Launch",
        "desc": "It has come to our attention that one of the superpowers of this world has just successfully launched a satellite, which marks the first step on their road of taming the space. The satellite is currently flying overhead the planet and transmitting the pictures of the surface to said superpower constantly. The nation indicated they want to create a network of such satellites soon, and competitors are on their way to achieve the same.",
        "options": [
            {
                "text": "They can see everything from up here...",
                "effect": "Gain <span class='decrease'>+1 <i class='fa-solid fa-satellite-dish'></i></span> every year onwards",
                "result": function() { 
                    game.player.temporary_flags["seen_detection"] = true;
                    game.player.flags["help_seen_detection"] = true;
                    game.player.temporary_flags.satellite_launch_happened = true;
                }
            }
        ]
    },
};
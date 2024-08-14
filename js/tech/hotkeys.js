game.tech.keyboard_interrupt = function(event) {
    if (game.tech.actions_blocked) return;
    switch (event.key) {
        case "V":
        case "v": game.elements.tabs.select("village"); break;
        case "R":
        case "r": if (game.conditionals.get("seen_science")) game.elements.tabs.select("research"); break;
        case "L":
        case "l": if (game.conditionals.get("seen_bureaucracy")) game.elements.tabs.select("laws"); break;
        case "P":
        case "p": if (game.conditionals.get("unlocked_prestige")) game.elements.tabs.select("prestige"); break;
        case "H":
        case "h": game.elements.tabs.select("help"); break;
        case "S":
        case "s": game.elements.tabs.select("settings"); break;
        case " ": game.game.next_year(); break;
        case "Escape": game.game.abort_import(); game.game.abort_export(); break;
    }
}
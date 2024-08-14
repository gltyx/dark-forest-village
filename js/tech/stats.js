game.tech.stats = {};

game.tech.stats.player_init = function(player) {
    // Stats that we are going to track:

    player.stats.won = false; // true if won the game TODO
    player.stats.prestiged = 0; // times pressed the prestige button
    player.stats.prestiged_year_1 = 0; // times pressed the prestige button when on year 1
    player.stats.years_passed = 0; // times the Next Year happened
    player.stats.attacks_defeated = 0; // times defeated the attack
    player.stats.hope_earned = 0; // total Hope earned
};

game.tech.stats.render = function() {
    let rank_requirements = {
        "prestiged": [8, 12, 18, 25, 50],
        "years_passed": [6000, 9000, 12000, 16000, 20000]
    }

    // Display stats
    for (let element of document.getElementsByClassName("stat")) {
        if (element.dataset.stat != null) {
            element.textContent = game.player.stats[element.dataset.stat];
        }
    }

    // Display stat ranks
    for (let element of document.getElementsByClassName("stat-ranking")) {
        if (element.dataset.stat != null) {
            let stat = element.dataset.stat;
            let rank = 0;
            while (rank < 5 && rank_requirements[stat][rank] < game.player.stats[stat]) {
                rank += 1;
            }
            
            if (rank == 0 || rank == 1) element.classList.add("rank-a");
            else element.classList.remove("rank-a");

            if (rank == 2) element.classList.add("rank-b");
            else element.classList.remove("rank-b");

            if (rank == 3) element.classList.add("rank-c");
            else element.classList.remove("rank-c");

            if (rank == 4) element.classList.add("rank-d");
            else element.classList.remove("rank-d");

            if (rank == 5) element.classList.add("rank-f");
            else element.classList.remove("rank-f");

            for (let inner_element of element.getElementsByClassName("stat-rank")) {
                switch (rank) {
                    case 0: inner_element.textContent = "A+"; break;
                    case 1: inner_element.textContent = "A"; break;
                    case 2: inner_element.textContent = "B"; break;
                    case 3: inner_element.textContent = "C"; break;
                    case 4: inner_element.textContent = "D"; break;
                    case 5: inner_element.textContent = "F"; break;
                }
            }
        }
    }
};
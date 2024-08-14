game.animation_loop = function() {
    // Turn cooldown button animation
    let ts = Date.now();
    if (game.player.last_year_ts > ts) game.player.last_year_ts = ts;

    let time_passed = ts - game.player.last_year_ts;
    if (time_passed >= constants.TURN_COOLDOWN) document.getElementById("new_turn").classList.remove("newyear");
    else {
        document.getElementById("new_turn").classList.add("newyear");
        document.getElementById("new_turn").style.setProperty("--fill-ratio", time_passed * 1.0 / constants.TURN_COOLDOWN);
    }
};
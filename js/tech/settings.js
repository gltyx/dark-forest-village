game.tech.settings = {};

game.tech.settings.player_init = function(player) {
    player.settings.theme = "base";
    player.settings["auto-next-year"] = "off";
}

game.tech.settings.init = function() {
    for (let element of document.getElementsByClassName("color-theme")) {
        for (let inner_element of element.getElementsByClassName("option")) {
            inner_element.onclick = function() { game.tech.settings.select_theme(this.dataset.theme) };
        }
    }

    for (let element of document.getElementsByClassName("auto-next-year")) {
        for (let inner_element of element.getElementsByClassName("option")) {
            inner_element.onclick = function() { game.tech.settings.select_generic_setting("auto-next-year", this.dataset.option) };
        }
    }
}

game.tech.settings.load_init = function() {
    game.tech.settings.select_theme(game.player.settings.theme);
    game.tech.settings.select_generic_setting("auto-next-year", game.player.settings["auto-next-year"]);
}

game.tech.settings.set_random_colors = function() {
    for (let i = 0; i < 50; i++) {
        let hexadecimal = "0123456789ABCDEF";
        let random_color = ["#"];
        for (let j = 0; j < 6; j++) random_color.push(hexadecimal[helpers.randint(hexadecimal.length - 1)]);
        document.getElementById("app").style.setProperty("--random-color-" + i, random_color.join(""));
    }

    for (let i = 0; i < 10; i++) {
        let hexadecimal = "0123456789ABCDEF";
        let random_color = ["#"];
        for (let j = 0; j < 6; j++) random_color.push(hexadecimal[helpers.randint(hexadecimal.length - 1)]);
        document.getElementById("app").style.setProperty("--random-transparent-color-" + i, random_color.join("") + "80");
    }
}

game.tech.settings.select_theme = function(theme) {
    document.getElementById("app").classList.remove("theme-" + game.player.settings.theme);
    game.player.settings.theme = theme;
    document.getElementById("app").classList.add("theme-" + game.player.settings.theme);

    if (theme == "random") game.tech.settings.set_random_colors();

    for (let element of document.getElementsByClassName("color-theme")) {
        for (let inner_element of element.getElementsByClassName("option")) {
            if (inner_element.dataset.theme == theme) inner_element.classList.add("selected");
            else {
                inner_element.classList.remove("selected");
                document.getElementById("app").classList.remove("theme-" + inner_element.dataset.theme);
            }
        }
    }
}

game.tech.settings.select_generic_setting = function(setting, option) {
    game.player.settings[setting] = option;
    for (let element of document.getElementsByClassName(setting)) {
        for (let inner_element of element.getElementsByClassName("option")) {
            if (inner_element.dataset.option == option) inner_element.classList.add("selected");
            else inner_element.classList.remove("selected");
        }
    }
}
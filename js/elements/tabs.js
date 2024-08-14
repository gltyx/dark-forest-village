// Switch between tabs

game.elements.tabs = {};

game.elements.tabs.select = function(tab) {
    game.player.tab = tab;
    for (let element of document.getElementsByClassName("tab")) {
        if (element.dataset.tab == tab) element.classList.add("selected");
        else element.classList.remove("selected");
    }
    for (let element of document.getElementsByClassName("tab-contents")) {
        if (element.dataset.tab == tab) element.classList.add("selected");
        else element.classList.remove("selected");
    }
};

game.elements.tabs.init = function() {
    for (let element of document.getElementsByClassName("tab")) {
        element.onclick = function() { game.elements.tabs.select(element.dataset.tab) };
    }
};



game.elements.tabs.select_help = function(tab) {
    game.player.help_tab = tab;
    for (let element of document.getElementsByClassName("help-tab")) {
        if (element.dataset.tab == tab) element.classList.add("selected");
        else element.classList.remove("selected");
    }
    for (let element of document.getElementsByClassName("help-tab-contents")) {
        if (element.dataset.tab == tab) element.classList.add("selected");
        else element.classList.remove("selected");
    }
};

game.elements.tabs.init_help = function() {
    for (let element of document.getElementsByClassName("help-tab")) {
        element.onclick = function() { game.elements.tabs.select_help(element.dataset.tab) };
    }
};
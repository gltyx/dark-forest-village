game.game.loaded = false;

game.game.save = function(savename="save") {
    if (!game.game.loaded) return;
    let save_object = game.player.save();
    let save_string = btoa(JSON.stringify(save_object));
    game.saveload.set(savename, save_string);
}

game.game.load = function(save_string) {
    if (save_string == null) {
        game.game.loaded = true;
        return;
    }
    let save_object = JSON.parse(atob(save_string));
    game.player.load(save_object);
    game.game.loaded = true;
}

game.game.hard_reset = function() {
    game.player.cleanup();
    let new_player = new Player();
    // Externally-defined things, or ones that should not reset
    new_player.locations = game.player.locations;
    new_player.settings = game.player.settings;
    
    game.player = new_player;
    game.player.init();
    game.game.save();
    // Also save backup
    game.game.save("backup");
}

game.game.import = function() {
    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.remove("no-display"); 
    }
    game.tech.actions_blocked = true;

    document.getElementById("import_save").value = "";

    for (let element of document.getElementsByClassName("import-window")) { 
        element.classList.remove("no-display"); 
    }
    game.render_loop();
}

game.game.abort_import = function() {
    for (let element of document.getElementsByClassName("import-window")) { 
        if (element.classList.contains("no-display")) return;
    }

    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.add("no-display"); 
    }
    for (let element of document.getElementsByClassName("import-window")) { 
        element.classList.add("no-display"); 
    }
    game.tech.actions_blocked = false;
    game.render_loop();
}

game.game.finish_import = function() {
    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.add("no-display"); 
    }
    for (let element of document.getElementsByClassName("import-window")) { 
        element.classList.add("no-display"); 
    }

    game.game.loaded = false;
    let imported_save = document.getElementById("import_save").value;
    let imported_saves = imported_save.replaceAll("\n", "").split("#", 2);
    try { game.game.load(imported_saves[0]); }
    catch(e) { 
        game.game.loaded = true;
        game.tech.actions_blocked = false;
        game.render_loop();
        return; 
    }

    if (imported_saves[1] != "") game.saveload.set("backup", imported_saves[1]);
    game.tech.actions_blocked = false;
    game.render_loop();
}

game.game.export = function() {
    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.remove("no-display"); 
    }
    game.tech.actions_blocked = true;

    game.saveload.get("backup", game.game.finish_export);

    for (let element of document.getElementsByClassName("export-window")) { 
        element.classList.remove("no-display"); 
    }
    game.render_loop();
}

game.game.finish_export = function(backup_save) {
    if (backup_save == null) backup_save = "";
    document.getElementById("export_save").value = btoa(JSON.stringify(game.player.save())) + "#" + backup_save;

    for (let element of document.getElementsByClassName("export-window")) { 
        element.classList.remove("no-display"); 
    }
    game.render_loop();
}

game.game.abort_export = function() {
    for (let element of document.getElementsByClassName("export-window")) { 
        if (element.classList.contains("no-display")) return;
    }

    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.add("no-display"); 
    }
    for (let element of document.getElementsByClassName("export-window")) { 
        element.classList.add("no-display"); 
    }
    game.tech.actions_blocked = false;
    game.render_loop();
}

game.game.reload_backup = function() {
    game.game.loaded = false;
    game.saveload.get("backup", game.game.load);
}
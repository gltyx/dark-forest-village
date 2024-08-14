game.tech.actions_blocked = false;

game.tech.open_event = function(event_id) {
    game.player.current_event = event_id;
    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.remove("no-display"); 
    }
    game.tech.actions_blocked = true;

    for (let element of document.getElementsByClassName("event-window")) { 
        for (let inner_element of element.getElementsByClassName("name")) {
            inner_element.textContent = game.data.events[event_id].name;
        }
        for (let inner_element of element.getElementsByClassName("desc")) {
            inner_element.innerHTML = "<p>" + game.data.events[event_id].desc + "</p>";
        }
        for (let inner_element of element.getElementsByClassName("options")) {
            inner_element.innerHTML = "";
            for (let option of game.data.events[event_id].options) {
                let option_button = document.createElement("div");
                option_button.classList.add("button");

                if ("possible" in option) {
                    if (!option.possible()) option_button.classList.add("disabled");
                }

                let button_text = document.createElement("p");
                button_text.classList.add("text");
                button_text.textContent = option.text;
                option_button.appendChild(button_text);

                if ("effect" in option) {
                    let button_effect = document.createElement("p");
                    button_effect.classList.add("effect");
                    button_effect.innerHTML = option.effect;
                    option_button.appendChild(button_effect);
                }

                option_button.onclick = function(event) { if ("possible" in option && !option.possible()) return; if ("result" in option) option.result(); game.tech.close_event(); };
                inner_element.appendChild(option_button);
            }
        }

        element.classList.remove("no-display"); 
    }

    game.render_loop();
}

game.tech.close_event = function() {
    game.player.current_event = null;
    for (let element of document.getElementsByClassName("total-cover")) { 
        element.classList.add("no-display"); 
    }
    for (let element of document.getElementsByClassName("event-window")) { 
        element.classList.add("no-display"); 
    }
    game.tech.actions_blocked = false;

    game.render_loop();
}
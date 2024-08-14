game.render.resource_cost = function(cost) {
    let resource_count = 0;
    for (let resource in cost) {
        if (cost[resource] > 0) resource_count++;
    }

    if (resource_count == 0) return document.createElement("div");

    let cost_holder = document.createElement("div");
    cost_holder.classList.add("resource-cost");
    let rows = Math.ceil(Math.sqrt(resource_count));
    let columns = Math.round(Math.sqrt(resource_count));
    let squish_factor = Math.max(rows, columns * 1.8);
    cost_holder.style.setProperty("--rows", rows);
    cost_holder.style.setProperty("--columns", columns);
    cost_holder.style.setProperty("--squish-factor", squish_factor);

    for (let resource in cost) {
        if (cost[resource] > 0) {
            let single_cost = document.createElement("p");
            single_cost.classList.add("cost");

            let cost_symbol = document.createElement("i");
            cost_symbol.className = game.data.resources[resource].class;
            single_cost.appendChild(cost_symbol);

            let cost_value = document.createElement("span");
            cost_value.textContent = " " + helpers.number_format(cost[resource]);
            single_cost.appendChild(cost_value);

            cost_holder.appendChild(single_cost);
        }
    }

    return cost_holder;
}
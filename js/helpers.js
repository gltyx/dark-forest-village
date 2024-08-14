// Various helping functions

var helpers = {};

// Work with dicts

// get
helpers.get = function(dict, key, def=null) {
    if (key in dict) return dict[key];
    else return def;
}

// =====================
// =====================

// Random functions

// Generate a random integer in the [low, high] interval, inclusive; [0, low] if high is not defined
helpers.randint = function(low, high = null) {
    if (high != null) return helpers.randint(high - low) + low;
    if (low < 0) return -helpers.randint(-low);
    return Math.floor(Math.random() * (low + 1));
}

// Generate a random ID for the population storage (alphanumeric, default length of 8 symbols)
helpers.generate_id = function(length = 8) {
    let alphanum = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = [];
    for (let i = 0; i < length; i++) {
        id.push(alphanum[helpers.randint(alphanum.length - 1)]);
    }
    return id.join("");
}

// Roll a percentile chance
helpers.percentile_roll = function(chance) {
    return Math.random() * 100 < chance;
}

// Get a random key
helpers.random_key = function(dict) {
    let key_count = 0;
    for (let key in dict) key_count += 1;
    if (key_count == 0) return null;
    key_count = helpers.randint(key_count - 1);
    for (let key in dict) {
        key_count -= 1;
        if (key_count < 0) return key;
    }
}

// =====================
// =====================

// Mixed function/number inputs

helpers.resolve = function(f) {
    if (typeof f === 'function') return f();
    else return f;
}


// =====================
// =====================

// Number formatting

helpers.number_format = function(number) {
    if (number == constants.INFINITY) return "\u221E";
    if (number < 0) return "-" + helpers.number_format(-number);
    let suffixes = ["k", "M", "B", "T"];
    let current_suffix = -1;
    while (number >= 1000 && current_suffix < suffixes.length - 1) {
        number = number / 1000.0;
        current_suffix += 1;
    }
    if (current_suffix == -1) return number;
    else return parseFloat(number.toPrecision(3)) + suffixes[current_suffix];
}

// precision is number of digits *after* the dot
helpers.roundto = function(number, precision=2) {
    return Math.round(number * (10 ** precision)) / (10 ** precision);
}

// =====================
// =====================

// Sleep

helpers.sleep = function(timeout) {
    return new Promise(function(resolve) { setTimeout(resolve, timeout) });
}
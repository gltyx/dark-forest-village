// Works with the IndexedDB
// A copy is stored in localStorage in case IndexedDB is not available
// The below implements an interface for storing and retrieving string values

class SaveLoad {
    constructor(db_name="default") {
        this.db_name = db_name;

        this.db = null;
        this.resolving_db_connection = true;

        // Create request to open the DB
        this.request = window.indexedDB.open(db_name, 1);
        this.request.parent = this;

        this.request.onerror = function(event) {
            event.target.parent.resolving_db_connection = false;
            console.log("Failed to connect to IndexedDB, using LocalStorage...");
        }
        this.request.blocked = function(event) {
            event.target.parent.resolving_db_connection = false;
            console.log("Failed to connect to IndexedDB, using LocalStorage...");
        }
        this.request.onsuccess = function(event) {
            event.target.parent.db = event.target.result;
            event.target.parent.resolving_db_connection = false;
        }
        this.request.onupgradeneeded = function(event) {
            event.target.parent.db = event.target.result;

            let object_store = event.target.parent.db.createObjectStore("kv", { keyPath: "key" });
            object_store.transaction.parent = event.target.parent;
            object_store.transaction.oncomplete = function(event) {
                event.target.parent.resolving_db_connection = false;
            }
        }
    }

    async set(key, value) {
        while (this.resolving_db_connection) {
            await helpers.sleep(constants.DB_REFRESH_INTERVAL);
        }

        if (this.db !== null) { // IndexedDB is available
            let transaction = this.db.transaction(["kv"], "readwrite");
            let object_store = transaction.objectStore("kv");
            object_store.put({"key": key, "value": value});
        }

        // always add to localStorage anyway
        window.localStorage.setItem(this.db_name + "-" + key, value);
    }

    async get(key, callback) {
        while (this.resolving_db_connection) {
            await helpers.sleep(constants.DB_REFRESH_INTERVAL);
        }

        if (this.db !== null) { // IndexedDB is available
            let transaction = this.db.transaction(["kv"], "readwrite");
            let object_store = transaction.objectStore("kv");
            let request = object_store.get(key);
            request.onerror = function(event) {
                // Fallback: use localStorage
                callback(window.localStorage.getItem(this.db_name + "-" + key));
            }
            request.onsuccess = function(event) {
                if (event.target.result != null) {
                    callback(event.target.result.value);
                }
                else {
                    // Fallback: use localStorage
                    callback(window.localStorage.getItem(this.db_name + "-" + key));
                }
            }
        }
        else {
            callback(window.localStorage.getItem(this.db_name + "-" + key));
        }
    }

    async delete(key) {
        while (this.resolving_db_connection) {
            await helpers.sleep(constants.DB_REFRESH_INTERVAL);
        }

        if (this.db !== null) {
            let transaction = this.db.transaction(["kv"], "readwrite");
            let object_store = transaction.objectStore("kv");
            object_store.delete(key);
        }

        window.localStorage.removeItem(this.db_name + "-" + key);
    }
}
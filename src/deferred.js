class SetCommand {
    constructor(parent, name, value) {
        this._parent = parent;
        this.name = name;
        this.value = value;
    }

    apply() {
        this._parent[this.name] = this.value;
    }
}

class CallCommand {
    constructor(parent, name, args) {
        this._parent = parent;
        this.name = name;
        this.args = args;
    }

    apply() {
        this._parent[this.name].apply(this._parent, this.args);
    }
}

/**
 * Make a deferred copy of the object in which sets and calls are stored rather than executed immediately
 * Not a prototype since each deferred object is expected to have different properties
 * @param object The object to be deferred
 */
function deferred(object) {
    const def = {
        // queue of commands for the object to do
        queue: [],
        // execute all commands in queue
        executeAll() {
            this.queue.forEach((command) => {
                command.apply();
            });
        },
        // clear all commands in queue
        clearQueue() {
            this.queue = [];
        }
    };

    // mask properties all along its inheritance chain
    for (let property in object) {
        // eslint-disable-next-line guard-for-in
        try {
            if (typeof object[property] === "function") {
                def[property] = function () {
                    this.queue.push(new CallCommand(object, property, arguments));
                };
            } else {
                // must be a property; we'll override the setter
                Object.defineProperty(def, property, {
                    set: function (value) {
                        this.queue.push(new SetCommand(object, property, value));
                    }
                });
            }
        } catch (e) {
            console.log(`property: ${property}`, e);
        }
    }

    return def;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = deferred;
}

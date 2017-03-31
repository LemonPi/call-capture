class SetCommand {
    constructor(parent, name, value) {
        this._parent = parent;
        this.name = name;
        this.value = value;
    }

    execute() {
        return this._parent[this.name] = this.value;
    }
}

class CallCommand {
    constructor(parent, name, args) {
        this._parent = parent;
        this.name = name;
        this.args = args;
    }

    execute() {
        return this._parent[this.name].apply(this._parent, this.args);
    }
}

/**
 * Make a deferred copy of the object in which sets and calls are stored rather than executed immediately
 * Not a prototype since each deferred object is expected to have different properties
 * @param {Object} object The object to be deferred
 * @param {Object} options Deferral options
 * @param {Boolean} options.executeImmediately Whether we're in capture mode where we don't defer
 * any calls, but instead capture them for later examination.
 */
function deferred(object, options) {
    const opts = options || {executeImmediately: false};
    const def = {
        // queue of commands for the object to do
        queue: [],
        // execute all commands in queue
        executeAll() {
            this.queue.forEach((command) => {
                command.execute();
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
                    if (opts.executeImmediately) {
                        return this.queue[this.queue.length - 1].execute();
                    }
                };
            } else {
                // must be a property; we'll override the setter
                Object.defineProperty(def, property, {
                    set: function (value) {
                        this.queue.push(new SetCommand(object, property, value));
                        if (opts.executeImmediately) {
                            return this.queue[this.queue.length - 1].execute();
                        }
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

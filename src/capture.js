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
 * Make a copy of the object in which sets and calls are captured
 * Default mode does not immediately execute the calls
 * Not a prototype since each captured object is expected to have different properties
 * @param {Object} object The object to be captured
 * @param {Object} options Capture options
 * @param {Boolean} options.executeImmediately Whether we defer the calls or not
 * set true to immediately run and return (in addition to capturing the calls)
 */
function capture(object, options) {
    const def = {
        opts : {...{executeImmediately: false}, ...options},
        // when the capture is stopped, we execute immediately and don't push to queue
        _stopped: false,
        // queue of commands for the object to do
        queue: [],
        /**
         * Resume capturing (after construction we're default in capture)
         */
        resumeCapture() {
            this._stopped = false;
        },
        /**
         * Temporarily stop capturing to start executing commands immediately
         */
        pauseCapture() {
            this._stopped = true;
        },
        /**
         * Execute all commands in queue
         */
        executeAll() {
            this.queue.forEach((command) => {
                command.execute();
            });
        },
        /**
         * Clear all commands in queue
         */
        clearQueue() {
            this.queue = [];
        },
    };

    // mask properties all along its inheritance chain
    for (let property in object) {
        // eslint-disable-next-line guard-for-in
        try {
            if (typeof object[property] === 'function') {
                def[property] = function () {
                    if (this._stopped === false) {
                        this.queue.push(new CallCommand(object, property, arguments));
                    }
                    if (this.opts.executeImmediately || this._stopped) {
                        return this.queue[this.queue.length - 1].execute();
                    }
                };
            } else {
                // must be a property; we'll override the setter
                Object.defineProperty(def, property, {
                    get: function () {
                        return object[property];
                    },
                    set: function (value) {
                        if (this._stopped === false) {
                            this.queue.push(new SetCommand(object, property, value));
                        }
                        if (this.opts.executeImmediately || this._stopped) {
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = capture;
}

class EventHandler {
    async execute(event) {
        throw "must implement serialize for MyInterface types"
    }
}

module.exports = EventHandler;
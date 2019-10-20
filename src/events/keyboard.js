const activeKeys = {};

const keyboard = {
    init() {
        window.addEventListener("keydown", event => {
            let key = event.which || event.keyCode;
            activeKeys[key] = true;
        });

        window.addEventListener("keyup", event => {
            let key = event.which || event.keyCode;
            activeKeys[key] = false;
        });
    },

    isPressed(key) {
        return !!activeKeys[key];
    }
};

export default keyboard;

/**
 * Класс, реализующий набор кпонок
 */
class ButtonPanel extends HTMLElement {
    #app;
    #components;

    constructor(app, buttons) {
        super();
        this.#app = app;
        this.#components = new Map();
        buttons.forEach(button => {
            this.#components.set(button.name, new Button(app, {name: button.name, label: button.label, handler: button.handler}));
            this.append(this.#components.get(button.name));
        });        
    }

    /**
     * Получение зарегистрированного компонента по его имени
     * @param {String} componentName 
     */
    getComponent(componentName) {
        return this.#components.get(componentName);
    }

    /**
     * Получение хеша компонентов
     */
    get components() {
        return this.#components;
    }

    get app() {
        return this.#app;
    }
}

// регистрация нового html-элемента
customElements.define('button-panel', ButtonPanel);      
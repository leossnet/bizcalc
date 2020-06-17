/**
 * Класс, реализующий набор кпонок
 */
class ButtonPanel extends HTMLElement {
    #components;

    constructor(buttons) {
        super();
        this.#components = new Map();
        buttons.forEach(button => {
            this.#components.set(button.name, new Button(button.label));
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
}

// регистрация нового html-элемента
customElements.define('button-panel', ButtonPanel);      
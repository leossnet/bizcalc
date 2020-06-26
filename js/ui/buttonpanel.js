/**
 * Класс, реализующий набор кпонок
 */
class ButtonPanel extends HTMLDivElement {
    #app;
    #components;

    /**
     * Конструктор панели кнопок
     * @param {Object} app - объект приложения
     * @param {Object} buttons - объект с параметрами кнопок, размещаемых на панели
     */
    constructor(app, buttons) {
        super();
        this.#app = app;
        this.#components = new Map();
        this.classList.add("button-panel");
        this.generateButtonPanel(app, buttons);
    }

    /**
     * Генерация кнопочной панели
     * @param {Object} app - объект приложения
     * @param {Object} buttons - объект с параметрами кнопок, размещаемых на панели
     */
    generateButtonPanel(app, buttons) {
        for (let buttonTab in buttons) {
            let input = document.createElement("input");
            input.id = buttonTab;
            input.type = "radio";
            input.name = "button-panel";
            this.append(input);
            this.#components.set(input.id, input);
            if ( buttons[buttonTab].checked ) input.setAttribute("checked", true);

            let label = document.createElement("label");
            label.id = buttonTab + "Label";
            label.setAttribute("for", buttonTab);
            label.title = buttons[buttonTab].name;
            label.innerHTML = buttons[buttonTab].name;
            this.append(label);
            this.#components.set(label.id, label);
        }
        // this.querySelector("input").setAttribute("checked", true);
        for (let buttonTab in buttons) {
            let section = document.createElement("section");
            section.id = "content-" + buttonTab;
            buttons[buttonTab].buttons.forEach(buttonParams => {
                let button = new Button(app, buttonParams);
                section.append(button);
            });
            this.append(section);
            this.#components.set(section.id, section);
        }
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

    /**
     * Возвращает объект приложения
     */
    get app() {
        return this.#app;
    }
}

// регистрация нового html-элемента
customElements.define('button-panel', ButtonPanel, {extends: 'div'});    

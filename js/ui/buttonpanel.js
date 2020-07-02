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
        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
    }

    /**
     * Генерация кнопочной панели
     * @param {Object} app - объект приложения
     * @param {Object} buttons - объект с параметрами кнопок, размещаемых на панели
     */
    generateButtonPanel(app, buttons) {
        // подготовка для формирования глобальных стилей привязки элементов кнопочной панели
        let headStyle = document.head.querySelector("head style");
        if ( !headStyle ) {
            headStyle = document.createElement("style");
            document.head.append(headStyle);
        }
        for (let buttonTab in buttons) {
            let input = document.createElement("input");
            input.id = buttonTab;
            input.type = "radio";
            input.name = "button-panel";

            // привязка заголовков и содержимого кнопочной панели
            let css = "#"+buttonTab+":checked~#content-"+buttonTab+" { display: block; }\n\t";
            headStyle.innerHTML += css;

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

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
        this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     */
    static get observedAttributes() {
        return ["cursor-cell", "view-width", "view-height"];
    }    
}

// регистрация нового html-элемента
customElements.define('button-panel', ButtonPanel, {extends: 'div'});    

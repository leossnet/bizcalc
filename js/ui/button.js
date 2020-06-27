/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {
    #app;
    #obj;

    /**
     * Конструктор кнопки
     * @param {Object} app - объект приложения
     * @param {Object} params - объект с параметрами кнопок
     */
    constructor(app, params) {
        super();
        this.#app = app;
        this.id = params.name;
        if ( params.handler ) this.addEventListener("click", params.handler);
        if ( params.label ) this.dataset.description = params.label;
        if ( params.icon ) {
            this.#obj = document.createElement("object");
            this.#obj.id=params.icon;
            this.#obj.setAttribute("type", "image/svg+xml");
            this.#obj.setAttribute("data", "res/icon/"+params.icon+".svg");
            this.#obj.classList.add("button-svg");
            this.#obj.width = 12;
            this.#obj.height = 12;
            this.append( this.#obj);
        }
        if ( params.label ) {
            this.append(params.label);
        }
        this.tabIndex = -1;
        this.#app.addComponent(this.id, this);
    }

    getSVG() {
        return this.#obj;
    }

    /**
     * Возвращает объект приложения
     */
    get app() {
        return this.#app;
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
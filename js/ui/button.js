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
        if ( params && params.handler ) this.addEventListener("click", params.handler);
        if ( params && params.label ) this.dataset.description = params.label;
        if ( params && params.icon ) {
            let icon = new SvgIcon(app, params.icon, { width: 15, height: 15, color: "cornflowerblue" });
            this.append(icon);
        }
        if ( params && params.label ) {
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
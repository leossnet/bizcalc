/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {
    #app;

    /**
     * Конструктор кнопки
     * @param {Object} app - объект приложения
     * @param {Object} params - объект с параметрами кнопок
     */
    constructor(app, params) {
        super();
        this.#app = app;
        this.id = params.name;
        this.innerHTML = params.label;
        this.addEventListener("click", params.handler);
        this.dataset.description = params.label;
        this.tabIndex = -1;
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
/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {
    #app;

    constructor(app, params) {
        super();
        this.#app = app;
        this.id = params.name;
        this.innerHTML = params.label;
        this.addEventListener("click", params.handler);
        this.dataset.description = params.label;
    }

    get app() {
        return this.#app;
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
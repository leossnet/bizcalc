/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {

    constructor(params) {
        super();
        this.id = params.name;
        this.innerHTML = params.label;
        this.addEventListener("click", params.handler);
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {

    constructor(name) {
        super();
        this.innerHTML = name;
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
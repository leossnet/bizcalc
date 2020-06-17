/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {

    constructor(label) {
        super();
        this.innerHTML = label;
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
/**
 * Класс информационной панели внизу экрана приложения
 */
class Infobar extends HTMLLabelElement {
    #app;

    /**
     * Конструктор информационной панели внизу экрана приложения
     * @param {Object} app ссылка на объект приложения
     * @param {Object} params - набор опциональных атрибутов в формате ключ:значение
     */
    constructor(app, params) {
        super();
        this.#app = app;
        this.id = "info-bar";
        this.innerHTML = "Здесь выводится разная полезная информация";
        this.style.display = "flex";
    }

    set content(content) {
        this.innerHTML = content;
    }

    get content() {
        return this.innerHTML;
    }


}

// регистрация нового html-элемента
customElements.define('info-bar', Infobar, {extends: 'label'});
/**
 * Класс редактора содержимого текущей ячейки таблицы
 */
class Editor extends HTMLInputElement {
    #app;

    /**
     * Конструктор редактора содержимого текущей ячейки таблицы
     * @param {Object} app ссылка на объект приложения
     * @param {Object} params - набор опциональных атрибутов в формате ключ:значение
     */
    constructor(app, params) {
        super();
        this.#app = app;
        this.id = this.#app.id+"Editor";

        this.#app.root.append(this);
    }
}

// регистрация нового html-элемента
customElements.define('b-editor', Editor, {extends: 'input'});
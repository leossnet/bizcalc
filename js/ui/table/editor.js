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
        this.id = app.root.id+"Editor";
        this.classList.add("table-editor");
        this.tabIndex = -1;
        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
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
customElements.define('b-editor', Editor, {extends: 'input'});
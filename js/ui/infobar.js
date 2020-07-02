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
        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
    }

    set content(content) {
        this.innerHTML = content;
    }

    get content() {
        return this.innerHTML;
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
customElements.define('info-bar', Infobar, {extends: 'label'});
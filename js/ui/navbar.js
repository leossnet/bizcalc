/**
 * Класс, реализующий верхнюю полосу приложения
 */
class Navbar extends HTMLElement {
    #app;
    
    constructor(app, params)  {
        super();
        this.#app = app;
        this.id = app.root.id+"Navbar";
        this.innerHTML="BizCalc";
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
customElements.define('nav-bar', Navbar);
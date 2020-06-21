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

    }
}

// регистрация нового html-элемента
customElements.define('nav-bar', Navbar);
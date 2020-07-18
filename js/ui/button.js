/**
 * Класс, реализующий пользовательскую кнопку
 */
class Button extends HTMLButtonElement {
    #app;
    #obj;

    /**
     * Конструктор кнопки
     * @param {Object} app - объект приложения
     * @param {Object} params - объект с параметрами кнопок
     */
    constructor(app, params) {
        super();
        this.#app = app;
        if ( params && params.name ) this.id = params.name;
        this.classList.add("button");
        if ( params && params.handler ) this.addEventListener("click", params.handler);
        if ( params && params.icon ) {
            let icon = new SvgIcon(app, params.icon, { width: 15, height: 15, color: "cornflowerblue" });
            this.append(icon);
        }
        if ( params && params.img ) {
            let img = document.createElement("img");
            img.src = "res/ico/"+params.img;
            img.classList.add("button-img");
            this.append(img);
        }
        if ( params && params.label ) {
            let label = document.createElement("div");
            label.classList.add("button-label");
            label.innerHTML = params.label;
            this.append(label);
            this.dataset.description = params.label + (params.shortcut ? " ("+params.shortcut+")" : "" );
        }
        this.tabIndex = -1;
        this.#app.addComponent(this.id, this);
    }

    getSVG() {
        return this.#obj;
    }

    /**
     * Возвращает объект приложения
     */
    get app() {
        return this.#app;
    }
}        

// регистрация нового html-элемента
customElements.define('bc-button', Button, {extends: 'button'});        
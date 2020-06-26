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
        this.id = params.name;
        this.addEventListener("click", params.handler);
        this.dataset.description = params.label;
        this.#obj = document.createElement("object");
        if ( params.icon ) {
            if ( 1 ) {
                // this.#obj = document.createElement("object");
                this.#obj.id=params.icon;
                this.#obj.setAttribute("type", "image/svg+xml");
                this.#obj.setAttribute("data", "res/icon/"+params.icon+".svg");
                this.#obj.classList.add("button-svg");

                this.#obj.width = 12;
                this.#obj.height = 12;
                this.append( this.#obj);
            }
            else if ( 0 ) {
                let img = document.createElement("img");
                img.id=params.icon+"-svg";
                img.setAttribute("src", "res/icon/"+params.icon+".svg");
                img.classList.add("button-svg");
                img.width = 12;
                img.height = 12;
                this.append(img);
            }
            else if ( 1 ) {
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttributeNS(null, "data", "res/icon/"+params.icon+".svg");
                svg.setAttributeNS(null, "fill", "green");
                this.append(svg);
            }
            else {
                let div = document.createElement("div");
                div.classList.add("icon-div");
                div.width = 12;
                div.height = 12;
                this.append(div);
            }
        }
        if ( params.label ) {
            this.append(params.label);
        }
        this.tabIndex = -1;

        document.addEventListener("DOMContentLoaded", () => {
            let svg = this.app.getComponent(this.id).getSVG();
            // console.log(svg);
            // let doc = svg.attachShadow({mode: 'open'});
            // console.log(doc);
            // let path = doc.querySelector("path");
            // path.setAttribute("fill", "green");
            // console.log(path);
        });

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
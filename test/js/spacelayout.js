/**
  * Места расположения компонентов в контейнере
  */
const Space = {
    TOP: "space-header",
    BOTTOM: "space-footer",
    LEFT: "space-nav",
    RIGHT: "space-aside",
    MAIN: "space-main"
};

class SpaceLayout extends HTMLDivElement {
    #components;
    #params;

    /**
     * Конструктор компоновщика
     * @param {HTMLElement} root - корневой узел, в который добавляется компоновщик
     */
    constructor(root) {
        super();
        this.#components = new Map();
        this.classList.add("space-layout");
        this.#params = {
            headerHeight: 0,
            footerHeight: 0,
            navWidth: 0,
            asideWidth: 0
        };
        root.append(this);

        window.addEventListener("resize", () => { 
            for (let space of this.#components.keys()) {
                this.updateStyle(this.#components.get(space), space);
            }
        });
    }

    /**
     * Добавление компонента в компоновщик
     * @param {HTMLElement} elem - добавляемый компонент
     * @param {Object} space - место расположения компонента в виде атрибута объекта Space
     */
    add(elem, space) {
        elem.classList.add(space);
        this.#components.set(space, elem);
        this.append(elem);
        this.updateStyle(elem, space);
    }

 
    updateStyle(elem, space) {
        let style = getComputedStyle(elem);
        switch (space) {
            case Space.TOP:
                this.#params.headerHeight = Number.parseFloat(style.height);
                this.setAttribute("header-height", Number.parseFloat(style.height));
                break;
            case Space.BOTTOM:
                this.#params.footerHeight = Number.parseFloat(style.height);
                this.setAttribute("footer-height", Number.parseFloat(style.height));
                break;
            case Space.LEFT:
                this.#params.navWidth = Number.parseFloat(style.width);
                this.setAttribute("nav-width", Number.parseFloat(style.width));
                break;
            case Space.RIGHT:
                this.#params.asideWidth = Number.parseFloat(style.width);
                this.setAttribute("aside-width", Number.parseFloat(style.width));
                break;
        }
    }

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     * @returns {undefined}
     */
    async connectedCallback() { 
  
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     * @returns {Array} - массив наименований отслеживаемых атрибутов
     */
    static get observedAttributes() {
        return ["header-height", "footer-height", "nav-width", "aside-width"];
    }

    /**
     * Обработчик события изменения значений пользовательских атрибутов, возвращаемых observedAttributes
     * @param {String} name - имя атрибута 
     * @param {String} oldValue - предыдущее значение атрибута
     * @param {String} newValue - новое значение атрибута
     */
    async attributeChangedCallback(name, oldValue, newValue) {
        this.style = "--header-height:"+this.#params.headerHeight+"px"
                +";--footer-height:"+this.#params.footerHeight+"px"
                +";--nav-width:"+this.#params.navWidth+"px"
                +";--aside-width:"+this.#params.asideWidth+"px;";
    }


}

// регистрация нового html-элемента
customElements.define('space-layout', SpaceLayout, { extends: "div" });

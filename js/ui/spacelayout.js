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

/**
  * Класс, обеспечивающий размещение компонентов по краям экрана и в центре.
  * Для верхнего и нижнего компонента нужно установить свойство min-height,
  * а для левого и правого комопнента - min-width
  */
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
        window.addEventListener("resize", () => { 
            for (let space of this.#components.keys()) {
                this.updateStyle(this.#components.get(space), space);
            }
        });
        this.addEventListener("layout", this.handlerLayout);
        root.append(this);
    }

    /**
     * Обработчик события добавления в компоновщик нового компонента
     * @param {Event} event - событие добавления в компоновщик нового элемента
     */
    handlerLayout(event) {
        console.log(event);
        for (let elem of this.#components.values()) {
            if ( elem.updateViewSize ) elem.updateViewSize();
        }        
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
        elem.dispatchEvent(new Event("layout", {bubbles: true}));
    }

    /**
     * Удаление компонента из указанного места расположения компоновщика, сам объект не удаляется
     * @param {Object} space - место расположения компонента в виде атрибута объекта Space
     */
    remove(space) {
        let elem = this.#components.get(space);
        this.#components.delete(space);
        elem.remove();
        this.updateStyle(elem, space);
    }

 
    /**
     * Обновление внешнего вида компоновщика
     * @param {HTMLElement} elem - обновляемый компонент
     * @param {Object} space - место расположения компонента в виде атрибута объекта Space
     */
    updateStyle(elem, space) {
        let style = getComputedStyle(elem);
        switch (space) {
            case Space.TOP:
                this.setParam(elem, "headerHeight", "header-height", style.height);
                break;
            case Space.BOTTOM:
                this.setParam(elem, "footerHeight", "footer-height", style.height);
                break;
            case Space.LEFT:
                this.setParam(elem, "navWidth", "nav-width", style.width);
                break;
            case Space.RIGHT:
                this.setParam(elem, "asideWidth", "aside-width", style.width);
                break;
        }
    }

    /**
     * Уставноление параметров элемента 
     * @param {HTMLElement} elem - обновляемый компонент
     * @param {String} paramName - имя параметра компоновщика
     * @param {String} attrName - имя html-атрибута компоновщика
     * @param {any} value - значение атрибута в еденицах измерения
     */
    setParam(elem, paramName, attrName, value) {
        if (elem) {
            this.#params[paramName] = value ? Number.parseFloat(value) :  0;
            this.setAttribute(attrName, value ? Number.parseFloat(value) : 0 );        
        }
        else {
            this.#params[paramName] = 0;
            this.setAttribute(attrName, 0);        
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

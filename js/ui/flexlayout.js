/**
 * Места расположения компонентов в контейнере
 */
const Space = {
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
    CENTER: "center"
};

/**#####################################################################################
 * Класс контейнера с размещением содержимого в фиксированных местах 
 *######################################################################################*/
class FlexLayout extends HTMLDivElement {
    #parent;
    #component;

    /**
     * Конструктор контейнера
     * @param {Object} parent - родительский элемент, в который помещается табличный контейнер
     */
    constructor(parent) {
        super();
        this.#parent = parent;
        this.id = "flex-layout";
        this.#component = new Map();
        this.generateLayout();
        this.#parent.append(this);
    }

    /**
     * Генерация содержимого контейнера
     */
    generateLayout() {
        let header = document.createElement("header");
        this.#component.set(Space.TOP, header);
        this.append(header);

        let content = document.createElement("div");
        content.id = "content";

        let main = document.createElement("main");
        this.#component.set(Space.CENTER, main);
        content.append(main);
        
        let nav = document.createElement("nav");
        this.#component.set(Space.LEFT, nav);
        content.append(nav);

        let asside = document.createElement("asside");
        this.#component.set(Space.RIGHT, asside);
        content.append(asside);

        this.append(content);

        let footer = document.createElement("footer");
        this.#component.set(Space.BOTTOM, footer);
        this.append(footer);
    }

    /**
     * Размещение компонента в контейнере в указанное место
     * @param {Object} component - размещаемый компопнент
     * @param {Space} space - место размещения компонента
     */
    add(component, space) {
        this.#component.get(space).append(component);
    }

}

// регистрация нового html-элемента
customElements.define('flex-layout', FlexLayout, {extends: "div"});

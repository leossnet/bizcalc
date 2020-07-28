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

class FlexLayout extends HTMLDivElement {

    #components;

    constructor(root) {
        super();
        this.#components = new Map();
        this.classList.add("space-layout");
        root.append(this);
    }

    add(elem, space) {
        elem.classList.add(space);
        this.#components.set(space, elem);
        this.append(elem);
    }

}
// регистрация нового html-элемента
customElements.define('flex-layout', FlexLayout, { extends: "div" });

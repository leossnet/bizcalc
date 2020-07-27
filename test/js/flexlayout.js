/**
  * Места расположения компонентов в контейнере
  */
const Space = {
    TOP: "flex-header",
    BOTTOM: "flex-footer",
    LEFT: "flex-nav",
    RIGHT: "flex-aside",
    MAIN: "flex-main"
};

class FlexLayout extends HTMLDivElement {

    #components;

    constructor(root) {
        super();
        this.#components = new Map();
        this.classList.add("flex-layout");
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

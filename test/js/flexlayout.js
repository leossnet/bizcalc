/**
  * Места расположения компонентов в контейнере
  */
const Space = {
    TOP: "header",
    BOTTOM: "footer",
    LEFT: "nav",
    RIGHT: "aside",
    MAIN: "main",
    ROW: "div"
};

class FlexLayout extends HTMLDivElement {

    #components;

    constructor(root) {
        super();
        this.#components = new Map();
        this.classList.add("flex-layout");
        this.generateFlexLayout();
        root.append(this);
    }

    generateFlexLayout() {
        this.createSpace(this, Space.TOP);
        this.createSpace(this, Space.ROW, [Space.LEFT, Space.MAIN, Space.RIGHT]);
        this.createSpace(this, Space.BOTTOM);
    }

    createSpace(root, space, childNodes) {
        let elem = document.createElement(space);
        this.#components.set(Space.CENTER, elem);
        elem.classList.add("flex-" + space);
        if (childNodes) childNodes.forEach(childSpace => {
            let child = document.createElement(childSpace);
            this.#components.set(childSpace, child);
            child.classList.add("flex-" + childSpace);
            elem.append(child);
        });
        this.append(elem);
    }

    add(elem, space) {
        this.#components.get(space).append(elem);
    }

}
// регистрация нового html-элемента
customElements.define('flex-layout', FlexLayout, { extends: "div" });

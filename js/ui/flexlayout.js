/**
 * Места расположения компонентов в контейнере
 */
const Space = {
    TOP: "header",
    BOTTOM: "footer",
    LEFT: "nav",
    RIGHT: "asside",
    CENTER: "main"
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
        this.classList.add("flex-layout");
        this.#component = new Map();
        this.generateLayout();
        this.#parent.append(this);
    }

    /**
     * Генерация содержимого блочного компоновщика
     */
    generateLayout() {
        this.appendFlexItem(this, Space.TOP); 

        let content = document.createElement("div");
        content.classList.add("flex-row");
        this.appendFlexItem(content, Space.CENTER); 
        this.appendFlexItem(content, Space.LEFT); 
        this.appendFlexItem(content, Space.RIGHT); 
        this.append(content);

        this.appendFlexItem(this, Space.BOTTOM); 
    }

    /**
     * Создание контейнера и добавление его к родительскому компоненту
     * @param {Object} parent - родитель контейнера
     * @param {Space} space - тип контейнера
     */
    appendFlexItem(parent, space) {
        let flexItem = document.createElement(space);
        this.#component.set(space, flexItem);
        flexItem.classList.add("flex-item");
        parent.append(flexItem);
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

/**
 * Места расположения компонентов в контейнере
 */
const LayoutRegion = {
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
    CENTER: "center"
};

/**
 * Класс контейнера с размещением содержимого в фиксированных местах 
 */
class BorderLayout extends HTMLElement {
    #parent; 
    #region = {};

    /**
     * Конструктор контейнера
     * @param {Object} parent - родительский элемент, в который помещается табличный контейнер
     * @param {Array[LayoutRegion]} regionTypes - массив мест размещения компонентов
     */
    constructor(parent, regionTypes) {
        super();
        this.#parent = parent;
        this.classList.add("border-layout");
        this.generateLayout(regionTypes);
        this.#parent.append(this);
    }

    /**
     * Генерация содержимого контейнера
     * @param {Array[LayoutRegion} regionTypes 
     */
    generateLayout(regionTypes) {
        if ( regionTypes.includes(LayoutRegion.TOP)) {
            this.createRegion([LayoutRegion.TOP]);
        }
        if ( regionTypes.includes(LayoutRegion.TOP)) {
            let reg = [];
            if ( regionTypes.includes(LayoutRegion.LEFT)) reg.push(LayoutRegion.LEFT);
            if ( regionTypes.includes(LayoutRegion.CENTER)) reg.push(LayoutRegion.CENTER);
            if ( regionTypes.includes(LayoutRegion.RIGHT)) reg.push(LayoutRegion.RIGHT);
            this.createRegion(reg);
        }
        if ( regionTypes.includes(LayoutRegion.BOTTOM)) {
            this.createRegion([LayoutRegion.BOTTOM]);
        }
    }

    /**
     * Создание отдельного места расположения компонента
     * @param {Array[LayoutRegion]} regionTypes 
     */
    createRegion(regionTypes) {
        let row = document.createElement("div");
        row.classList.add("row-layout");
        for (let rt=0; rt<regionTypes.length; rt++) {
            let cell = document.createElement("div");
            cell.classList.add(regionTypes[rt]+"-layout");
            row.append(cell);
            this.#region[regionTypes[rt]] = cell;
        }
        this.append(row);
    }

    
    /**
     * Размещение компонента в контейнере в указанное место
     * @param {Object} component - размещаемый компопнент
     * @param {LayoutRegion} region - место размещения компонента
     */
    add(component, region) {
        if ( this.#region[region] ) this.#region[region].append(component);
        component.addEventListener("click", (e) => console.log(e.target));
    }

}

// регистрация нового html-элемента
customElements.define('border-layout', BorderLayout);
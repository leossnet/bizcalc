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

/**#####################################################################################
 * Класс контейнера с размещением содержимого в фиксированных местах 
 *######################################################################################*/
class BorderLayout extends HTMLElement {
    #parent;
    #component;

    /**
     * Конструктор контейнера
     * @param {Object} parent - родительский элемент, в который помещается табличный контейнер
     * @param {Array[LayoutRegion]} regionTypes - массив мест размещения компонентов
     */
    constructor(parent) {
        super();
        this.#parent = parent;
        this.id = "border-layout";
        this.#component = new Map();
        this.generateLayout();
        this.#parent.append(this);
    }

    /**
     * Генерация содержимого контейнера
     * @param {Array[LayoutRegion]} regionTypes 
     */
    generateLayout() {
        let header = document.createElement("header");
        this.#component.set(LayoutRegion.TOP, header);
        this.append(header);

        let content = document.createElement("div");
        content.id = "content";


        let nav = document.createElement("nav");
        this.#component.set(LayoutRegion.LEFT, nav);
        content.append(nav);
        
        let main = document.createElement("main");
        this.#component.set(LayoutRegion.CENTER, main);
        content.append(main);


        let asside = document.createElement("asside");
        this.#component.set(LayoutRegion.RIGHT, asside);
        content.append(asside);

        this.append(content);

        let footer = document.createElement("footer");
        this.#component.set(LayoutRegion.BOTTOM, footer);
        this.append(footer);
        this.#parent.append(this);
    }

    /**
     * Размещение компонента в контейнере в указанное место
     * @param {Object} component - размещаемый компопнент
     * @param {LayoutRegion} region - место размещения компонента
     */
    add(component, region) {
        this.#component.get(region).append(component);
    }

}

// регистрация нового html-элемента
customElements.define('border-layout', BorderLayout);


/**#####################################################################################
 * Класс табличного контейнера, обеспечивающий выравнивание содержащихся элементов в виде таблицы
 *######################################################################################*/
class GridLayout extends HTMLDivElement {
    #parent;
    #colCount;
    #rowCount;
    #gridItems;

    /**
     * Конструктор табличного контейнера
     * @param {Object} parent - родительский элемент, в который помещается табличный контейнер
     * @param {Number} rowCount - число строк контейнера
     * @param {Number} colCount - число колонок котнейнера 
     */
    constructor(parent, rowCount, colCount) {
        super(); 
        this.#parent = parent;
        this.#gridItems = new Map();
        this.#rowCount = rowCount || 1;
        this.#colCount = colCount || 1; 

        this.generateGridLayout(rowCount, colCount);

        this.#parent.append(this);
    }

    /**
     * Генерация табличной разметки
     * @param {*} rowCount 
     * @param {*} colCount 
     */
    generateGridLayout(rowCount, colCount) {
        this.classList.add("grid-layout");
        this.style = "--grid-rows:" + rowCount + ";--grid-cols:" + colCount + ";";
        for (let r=0; r<rowCount; r++) {
            for (let c=0; c<colCount; c++) {
                let item = new GridItem(r, c);
                this.append(item);
                this.#gridItems.set(item.id, item);
            }
        }
    }

    /**
     * Возвращает число строк контейнера
     */
    rowCount() {
        return this.#rowCount;
    }
    
    /**
     * Возвращает число колонок контейнера
     */
    colCount() {
        return this.#colCount;
    }

    /**
     * Размещает компонент в контейнере с координатами строка:колонка
     * При выходе за допустимые границы добавляет в ячейку в крайние значением строки (колонки)
     * @param {Object} component - добавляемый компонент
     * @param {Number} row - строка размещения компонента начиная с 0
     * @param {Number} col - колонка размещения комопнента начиная с 0
     */
    add(component, row, col) {
        let r = row < 0 ? 0 : ( row > this.#rowCount-1 ? this.#rowCount-1 : row ) ;
        let c = col < 0 ? 0 : ( col > this.#colCount-1 ? this.#colCount-1 : col ) ;
        this.#gridItems.get(GridItem.getId(row, col)).append(component);
    }

}

// регистрация нового html-элемента
customElements.define('grid-layout', GridLayout, {extends: 'div'});



/**#####################################################################################
 * Класс единичного блока для размещения объектов в табличном контейнере
 *######################################################################################*/
class GridItem extends HTMLDivElement {
    #rowNum;
    #colNum;

    /**
     * Конструктор единичного блока табличного контейнера
     * @param {Number} rowNum - номер строки блока контейнера
     * @param {Number} colNum - номер колонки блока контейнера
     */
    constructor(rowNum, colNum) {
        super();
        this.#rowNum = rowNum;
        this.#colNum = colNum;
        this.id = GridItem.getId(rowNum, colNum);
        this.classList.add("grid-item");
    }

    /**
     * Статический класс для генерации id единичного блока по номерам строки и колонки
     * @param {Number} rowNum 
     * @param {Number} colNum 
     */
    static getId(rowNum, colNum) {
        return "R"+rowNum+"C"+colNum;
    }
}

// регистрация нового html-элемента
customElements.define('grid-item', GridItem, {extends: 'div'});

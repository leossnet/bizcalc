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
        row.classList.add("row-border-layout");
        for (let rt=0; rt<regionTypes.length; rt++) {
            let cell = document.createElement("div");
            cell.classList.add(regionTypes[rt]+"-border-layout");
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
        // component.addEventListener("click", (e) => console.log(e.target));
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

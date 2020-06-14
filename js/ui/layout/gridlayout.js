/**
 * Класс табличного контейнера, обеспечивающий выравнивание содержащихся элементов в виде таблицы
 */
class GridLayout extends HTMLDivElement {
    #parent;
    #colCount;
    #rowCount;
    #cells = [];

    /**
     * Конструктор табличного контейнера
     * @param {Object} parent - родительский элемент, в который помещается табличный контейнер
     * @param {Number} rowCount - число строк контейнера
     * @param {Number} colCount - число колонок котнейнера 
     */
    constructor(parent, rowCount, colCount) {
        super(); 
        this.#parent = parent;
        this.#rowCount = rowCount || 1;
        this.#colCount = colCount || 1; 
        this.classList.add("grid-layout");
        this.generateLayout();
        this.#parent.append(this);
    }

    /**
     * Генерация содержимого контейнера
     */
    generateLayout() {
        for ( let r=0; r < this.#rowCount; r++ ) {
            let row = document.createElement("div");
            this.#cells.push(new Array());
            row.classList.add("row-layout");
            for (let c=0; c<this.#colCount; c++) {
                let cell = document.createElement("div");
                cell.classList.add("cell-layout");
                this.#cells[r].push(cell);
                row.append(cell);
            }
            this.append(row);
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
        this.#cells[r][c].append(component);
    }

}

// регистрация нового html-элемента
customElements.define('grid-layout', GridLayout, {extends: 'div'});
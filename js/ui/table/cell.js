/**
 * Класс, реализующий функционал ячейки таблицы
 */
class Cell extends HTMLTableCellElement { 
    #table;
    #tableData;
    #cellData;
    #cell = {};

    /**
     * Конструктор ячейки таблицы
     * @param {Object} table объект таблицы, к которому добавляется текущая ячейка
     * @param {String|Number} rowName имя строки ячейки
     * @param {String} colName имя колонки ячейки
     */
    constructor(table, cellData) {
        super();
        this.#table = table;
        this.#tableData = this.#table.tableData;
        this.#cellData = cellData;
        this.addEventListener("click", this.handlerClick );
    }

    generateCell(colName, rowName) {
        this.classList.add("cell-data");
        this.setAttribute("cell", this.data.name);
        this.setAttribute("row", this.data.rowName);
        this.setAttribute("col", this.data.colName);
        this.setAttribute("type", this.data.type);
    }

    get data() {
        return this.#cellData;
    } 

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.generateCell(this.#cell.colName, this.#cell.rowName);
    }    

    refreshValue() {
        if ( this.data.type == ValueTypes.Formula ) {
            this.data.value = this.#tableData.getTokens(this.data.name);
        }
        this.refresh();
    }

    refresh() {
        // this.innerHTML = this.data.value;
        this.textContent = this.data.value;
    }

    /**
     * Обработка нажатия мыши
     * @param {MouseEvent} event событие мыши
     */
    handlerClick(event) {
        this.#table.setCursor(this.data.name);
    }
}

// регистрация нового html-элемента
customElements.define('cell-data', Cell, {extends:"td"});

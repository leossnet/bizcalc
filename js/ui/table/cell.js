/**
 * Класс, реализующий функционал ячейки таблицы
 */
class Cell extends HTMLTableCellElement { 
    #table;
    #tableData;
    #cellData;
    #cell = {};
    #buffer = "";

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

    /**
     * Установка внешнего вида и атрибутов ячейки
     * @param {String} colName - имя колоноки
     * @param {Strig} rowName - имя строки
     */
    generateCell(colName, rowName) {
        this.classList.add("cell-data");
        this.setAttribute("cell", this.data.name);
        this.setAttribute("row", this.data.rowName);
        this.setAttribute("col", this.data.colName);
        this.setAttribute("type", this.data.type);
    }

    /**
     * Получение данных ячейки
     */
    get data() {
        return this.#cellData;
    }

    /**
     * Получение имени ячейки
     */
    get name() {
        return this.#cellData.name;
    }

    get editor() {
        return this.#table.editor;
    }

    /**
     * Получение вводимого значния ячейки
     */
    get buffer() {
        return this.#buffer;
    }

    /**
     * Установление вводимого значения ячейки
     */
    set buffer(value) {
        this.#buffer = value;
    }

    /**
     * Установка нового значения ячейки
     */    
    set value(value) {
        this.setValue(value, true);
    }

    /**
     * Установка нового значения ячейки таблицы
     * @param {any} value - новое значение ячейки таблицы
     * @param {Boolean} isCalcAllCells - нужно ли пересчитывать все ячейки таблицы после обновления текущей ячейки
     */
    setValue (value, isCalcAllCells) {
        this.#cellData.setValue(value, isCalcAllCells);
        this.setAttribute("type", this.#cellData.type);
        this.refresh();        
    }

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.generateCell(this.#cell.colName, this.#cell.rowName);
    }    

    /**
     * Обновление значения ячейки
     */
    refreshValue() {
        if ( this.data.type == ValueTypes.Formula ) {
            this.value = this.#tableData.getTokens(this.data.name);
        }
        this.refresh();
    }
    
    /**
     * Обновление содержимого ячейки
     */
    refresh() {
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

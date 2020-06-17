/**
 * Объект с типами значений ячейки
 */
const ValueTypes = {
    Number: "number" ,
    Formula: "formula",
    String: "string",
    None: "none"
};

/**
 * Класс, реализующий функционал ячейки таблицы
 */
class Cell extends HTMLElement { 
    #table;
    #tdata;
    #data;
    #cell = {};
    #deltaA = "A".charCodeAt(0)-1;

    /**
     * Конструктор ячейки таблицы
     * @param {Object} table объект таблицы, к которому добавляется текущая ячейка
     * @param {String|Number} rowName имя строки ячейки
     * @param {String} colName имя колонки ячейки
     */
    constructor(table, rowName, colName) {
        super();
        this.#table = table;
        this.#tdata = this.#table.tableData;

        this.#cell = {
            name: colName+String(rowName),
            rowName: String(rowName),
            colName: colName,
            rowNumber: Number.parseInt(rowName),
            colNumber: colName.charCodeAt(0) - this.#deltaA,
        };

        this.#data = {
            value: null,
            type: ValueTypes.None,
            number: 0,
            formula : "",
            string: ""
        };
        this.setAttribute("type", this.#data.type);
        this.addEventListener("click", this.handlerClick );
    }

    /**
     * Получение имени ячейки в формате А1
     */
    get name() {
        return this.#cell.name;
    }


    getCellName(colNumber, rowNumber) {
        return String.fromCharCode(colNumber+this.#deltaA)+String(rowNumber);
    }
    
    /**
     * Получение имени строки ячейки в текстовом виде 
     */
    get rowName() {
        return this.#cell.rowName;
    }

    /**
     * Получение имени колонки в текстовом виде
     */
    get colName() {
        return this.#cell.colName;
    }

    /**
     * Получение номера строки в числовом виде
     */
    get rowNumber() {
        return this.#cell.rowNumber;
    }

    /**
     * Получение номера полонки в числовом виде
     */
    get colNumber() {
        return this.#cell.colNumber;
    }

    /**
     * Получение значения ячейки в числовом формате для числа и текстовом для строки
     */
    get value() {
        return this.#data.value;
    }

    get type() {
        return this.#data.type;
    }
    
    get number() {
        return this.#data.number;
    }

    /**
     * Получение формулы ячейки, для первичного взначения возврат этого значения в текстовом виде
     */
    get formula() {
        return this.#data.formula;
    }

    get string() {
        return this.#data.string;
    }

    /**
     * Установка нового значения ячейки
     */
    set value(value){
        let cellName = this.#cell.name;
        if ( value === undefined || Number(value) === 0 ) {
            this.#data.type = ValueTypes.Number;
            this.#data.number = 0;
            this.#tdata.setValue(cellName, this.#data.number);
            this.#data.value = ( value === undefined ) ? "" : 0;
            this.#tdata.calcAllCells();
            this.setAttribute("type", this.#data.type);
        }
        else if ( Number(value) ) {
            this.#data.type = ValueTypes.Number;
            this.#data.number = Number(value);
            this.#tdata.setValue(cellName, this.#data.number);
            this.#data.value = value;
            this.#tdata.calcAllCells();
            this.setAttribute("type", this.#data.type);
        }
        else if ( value.toString().charAt(0) === '=' ) {
            this.#data.type = ValueTypes.Formula;
            this.#data.formula = value;
            this.#tdata.setTokens(cellName, this.#data.formula);
            this.#data.value = this.#tdata.calcCell(cellName);
            this.setAttribute("type", this.#data.type);
        }
        else {
            this.#data.type = ValueTypes.String;
            this.#data.string = value;
            this.#data.value = value;
            this.setAttribute("type", this.#data.type);
        }
        this.refresh();
    }

    refreshValue() {
        if ( this.type == ValueTypes.Formula ) {
            this.#data.value = this.#tdata.calcCell(this.name);
        }
        this.refresh();
    }

    refresh() {
        this.innerHTML = this.#data.value;
    }

    /**
     * Обработка нажатия мыши
     * @param {MouseEvent} event событие мыши
     */
    handlerClick(event) {
        this.#table.setCursor(this.#cell.name);
    }
}

// регистрация нового html-элемента
customElements.define('b-cell', Cell);
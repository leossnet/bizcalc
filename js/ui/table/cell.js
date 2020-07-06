/**
 * Объект с типами значений ячейки
 */
const ValueTypes = {
    Number: "number" ,
    Formula: "formula",
    String: "string",
    None: "none"
};

const MAX_COLUMN_COUNT = 676; // 26*26, где 26 - число букв в латинском алфавите

/**
 * Класс, реализующий функционал ячейки таблицы
 */
class Cell extends HTMLElement { 
    #table;
    #tdata;
    #data;
    #cell = {};

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
            colNumber: Cell.getColNumber(colName),
        };
        this.initCell();

        // this.id = colName+rowName;
        this.classList.add("cell-data");
        this.setAttribute("cell", colName+rowName);
        this.setAttribute("type", this.#data.type);
        this.addEventListener("click", this.handlerClick );
    }

    /**
     * Получение имени ячейки в формате А1
     */
    get name() {
        return this.#cell.name;
    }


    /**
     * Получение имени ячейки по номеру строки и колонки
     * @param {Number} rowNumber - номер строки
     * @param {Number} colNumber - номер колонки
     */
    getCellName(rowNumber, colNumber) {
        return Cell.getColName(colNumber)+rowNumber;
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
        else if ( Array.isArray(value) ) {
            this.#data.type = ValueTypes.Formula;
            this.#data.formula = "="+value.map( (item, index, array) => item.value ).join("");
            this.#tdata.setTokens(cellName, value);
            this.#data.value = this.#tdata.calcCell(cellName);
            this.setAttribute("type", this.#data.type);
        }
        else {
            this.#data.type = ValueTypes.String;
            this.#data.string = value;
            this.#data.value = value;
            this.#tdata.setString(cellName, value);
            this.setAttribute("type", this.#data.type);
        }
        this.refresh();
    }

    /**
     * Возвращает символ колонки по ее номеру начиная с 1
     * @param {Number} colNumber - номер колонки начиная с 1 
     */
    static getColName(colNumber) {
        if ( colNumber > 26 ) {
            let num1 = Math.trunc( ( colNumber -1  ) / 26) ;
            let num2 = colNumber - ( num1 * 26 )    ;
            let str1 = String.fromCharCode(num1 + "A".charCodeAt(0) - 1);
            let str2 = String.fromCharCode(num2 + "A".charCodeAt(0) - 1);
            return str1+str2; 
        } 
        else return String.fromCharCode(colNumber + "A".charCodeAt(0) - 1);
    }

    /**
     * Возвращает номер колонки по ее символу
     * @param {String} colName - символ колонки из одной или двух латинских букв от A до ZZ
     */
    static getColNumber(colName) {
        let num1 = colName.charCodeAt(0) - "A".charCodeAt(0) + 1;
        let num2 = colName.charCodeAt(1) - "A".charCodeAt(0) + 1;
        if ( num2 ) return num1 * 26 + num2;
        else return num1;
    }

    /**
     * Возвращает код ячейки по номерку строки и номеру колонки
     * @param {Number} colNumber - номер колонки начиная с 1 
     * @param {Number} colNumber - номер строки начиная с 1
     */
    static getCellName(rowNumber, colNumber) {
        return Cell.getColName(colNumber)+rowNumber;
    }

    /**
     * Установление первоначальных значений ячейки
     */
    initCell() {
        this.#data = {
            value: null,
            type: ValueTypes.None,
            number: 0,
            formula : "",
            string: ""
        };        
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
customElements.define('cell-data', Cell);

// console.log("Cell.getColName(26): "+Cell.getColName(26)); // Z
// console.log("Cell.getColName(27): "+Cell.getColName(27)); // AA
// console.log("Cell.getColName(51): "+Cell.getColName(51)); // AY
// console.log("Cell.getColName(52): "+Cell.getColName(52)); // AZ
// console.log("Cell.getColName(53): "+Cell.getColName(53)); // BA
// console.log("Cell.getColName(2): "+Cell.getColName(2));   // B

// console.log("Cell.getColNumber('AA'): "+Cell.getColNumber('AA')); // 27
// console.log("Cell.getColNumber('AY'): "+Cell.getColNumber('AY')); // 51
// console.log("Cell.getColNumber('AZ'): "+Cell.getColNumber('AZ')); // 52
// console.log("Cell.getColNumber('BA'): "+Cell.getColNumber('BA')); // 53
// console.log("Cell.getColNumber('B'): "+Cell.getColNumber('B'));   // 2
// console.log("Cell.getColNumber('Z'): "+Cell.getColNumber('Z'));   // 26
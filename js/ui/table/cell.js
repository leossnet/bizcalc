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
    constructor(table, rowName, colName) {
        super();
        this.#table = table;
        this.#tableData = this.#table.tableData;

        this.#cell = {
            name: colName+String(rowName),
            rowName: String(rowName),
            colName: colName,
            rowNumber: Number.parseInt(rowName),
            colNumber: Cell.getColNumber(colName),
        };
        this.initCell();
        // this.generateCell(this.#cell.colName, this.#cell.rowName);
        this.addEventListener("click", this.handlerClick );
    }


    generateCell(colName, rowName) {
        this.classList.add("cell-data");
        this.setAttribute("cell", colName + rowName);
        this.setAttribute("row", rowName);
        this.setAttribute("col", colName);
        this.setAttribute("type", this.#cellData.type);
    }

    /**
     * Установление первоначальных значений ячейки
     */
    initCell() {
        this.#cellData = {
            value: null,
            type: ValueTypes.None,
            number: 0,
            formula : "",
            string: ""
        };        
    }

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.generateCell(this.#cell.colName, this.#cell.rowName);
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
    // getCellName(rowNumber, colNumber) {
    //     return Cell.getColName(colNumber)+rowNumber;
    // }
    
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
        return this.#cellData.value;
    }

    get type() {
        return this.#cellData.type;
    }
    
    get number() {
        return this.#cellData.number;
    }

    /**
     * Получение формулы ячейки, для первичного взначения возврат этого значения в текстовом виде
     */
    get formula() {
        return this.#cellData.formula;
    }

    get string() {
        return this.#cellData.string;
    }

    /**
     * Установка нового значения ячейки
     */
    set value(value){
        let cellName = this.#cell.name;
        if ( value === undefined || Number(value) === 0 ) {
            this.#cellData.type = ValueTypes.Number;
            this.#cellData.number = 0;
            this.#tableData.setValue(cellName, this.#cellData.number);
            this.#cellData.value = ( value === undefined ) ? "" : 0;
            this.#tableData.calcAllCells();
            this.setAttribute("type", this.#cellData.type);
        }
        else if ( Number(value) ) {
            this.#cellData.type = ValueTypes.Number;
            this.#cellData.number = Number(value);
            this.#tableData.setValue(cellName, this.#cellData.number);
            this.#cellData.value = value;
            this.#tableData.calcAllCells();
            this.setAttribute("type", this.#cellData.type);
        }
        else if ( value.toString().charAt(0) === '=' ) {
            this.#cellData.type = ValueTypes.Formula;
            this.#cellData.formula = value;
            this.#tableData.setTokens(cellName, this.#cellData.formula);
            this.#cellData.value = this.#tableData.calcCell(cellName);
            this.setAttribute("type", this.#cellData.type);
        }
        else if ( Array.isArray(value) ) {
            this.#cellData.type = ValueTypes.Formula;
            this.#cellData.formula = "="+value.map( (item, index, array) => item.value ).join("");
            this.#tableData.setTokens(cellName, value);
            this.#cellData.value = this.#tableData.calcCell(cellName);
            this.setAttribute("type", this.#cellData.type);
        }
        else {
            this.#cellData.type = ValueTypes.String;
            this.#cellData.string = value;
            this.#cellData.value = value;
            this.#tableData.setString(cellName, value);
            this.setAttribute("type", this.#cellData.type);
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


    refreshValue() {
        if ( this.type == ValueTypes.Formula ) {
            this.#cellData.value = this.#tableData.calcCell(this.name);
        }
        this.refresh();
    }

    refresh() {
        this.innerHTML = this.#cellData.value;
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
customElements.define('cell-data', Cell, {extends:"td"});

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
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
class CellData { 
    #table;
    #tableData;
    #value = {};
    #param = {};

    /**
     * Конструктор ячейки таблицы
     * @param {Object} table объект таблицы, к которому добавляется текущая ячейка
     * @param {String|Number} rowName имя строки ячейки
     * @param {String} colName имя колонки ячейки
     */
    constructor(table, rowName, colName) {
        this.#table = table;
        this.#tableData = this.#table.tableData;

        this.#param = {
            name: colName+String(rowName),
            rowName: String(rowName),
            colName: colName,
            rowNumber: Number.parseInt(rowName),
            colNumber: CellData.getColNumber(colName),
        };
        this.initCell();        
    }
    
    /**
     * Установление начальный значений ячейки
     */
    initCell() {
        this.#value = {
            html: null,
            type: ValueTypes.None,
            number: 0,
            formula: "",
            string: ""
        };
    }

    /**
     * Получение ссылки на объект ячейки из объекта TableData
     */
    get cell() {
        return this.#tableData.getCell(this.#param.name);
    }

    /**
     * Получение имени ячейки в формате А1
     */
    get name() {
        return this.#param.name;
    }
    
    /**
     * Получение имени строки ячейки в текстовом виде 
     */
    get rowName() {
        return this.#param.rowName;
    }

    /**
     * Получение имени колонки в текстовом виде
     */
    get colName() {
        return this.#param.colName;
    }

    /**
     * Получение номера строки в числовом виде
     */
    get rowNumber() {
        return this.#param.rowNumber;
    }

    /**
     * Получение номера полонки в числовом виде
     */
    get colNumber() {
        return this.#param.colNumber;
    }

    /**
     * Получение значения ячейки в числовом формате для числа и текстовом для строки
     */
    get value() {
        return this.#value.html;
    }

    get type() {
        return this.#value.type;
    }
    
    get number() {
        return this.#value.number;
    }

    /**
     * Получение формулы ячейки, для первичного взначения возврат этого значения в текстовом виде
     */
    get formula() {
        return this.#value.formula;
    }

    get string() {
        return this.#value.string;
    }

    /**
     * Установка нового значения ячейки
     */
    set value(value){
        let cellName = this.#param.name;
        if ( value === undefined || Number(value) === 0 ) {
            this.#value.type = ValueTypes.Number;
            this.#value.number = 0;
            this.#tableData.setValue(cellName, this.#value.number);
            this.#value.html = ( value === undefined ) ? "" : 0;
            this.#tableData.calcAllCells();
        }
        else if ( Number(value) ) {
            this.#value.type = ValueTypes.Number;
            this.#value.number = Number(value);
            this.#tableData.setValue(cellName, this.#value.number);
            this.#value.html = value;
            this.#tableData.calcAllCells();
        }
        else if ( value.toString().charAt(0) === '=' ) {
            this.#value.type = ValueTypes.Formula;
            this.#value.formula = value;
            this.#tableData.setTokens(cellName, this.#value.formula);
            this.#value.html = this.#tableData.calcCell(cellName);
        }
        else if ( Array.isArray(value) ) {
            this.#value.type = ValueTypes.Formula;
            this.#value.formula = "="+value.map( (item, index, array) => item.value ).join("");
            this.#tableData.setTokens(cellName, value);
            this.#value.html = this.#tableData.calcCell(cellName);
        }
        else {
            this.#value.type = ValueTypes.String;
            this.#value.string = value;
            this.#value.html = value;
            this.#tableData.setString(cellName, value);
        }
        this.cell.setAttribute("type", this.#value.type);
        this.cell.refresh();
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
        return CellData.getColName(colNumber)+rowNumber;
    }
}


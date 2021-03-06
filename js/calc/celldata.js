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
class CellData { 
    #calcData;
    #value = {};
    #param = {};

    /**
     * Конструктор ячейки таблицы
     * @param {Object} table объект таблицы, к которому добавляется текущая ячейка
     * @param {String|Number} rowName имя строки ячейки
     * @param {String} colName имя колонки ячейки
     */
    constructor(calcData, rowName, colName) {
        this.#calcData = calcData;

        this.#param = {
            name: colName+String(rowName),
            rowName: String(rowName),
            colName: colName,
            rowNumber: Number.parseInt(rowName),
            colNumber: CellData.getColNumber(colName),
        };
        this.id = this.#param.name;
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
        return this.#calcData.getCell(this.#param.name);
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
     * Установка нового значения ячейки таблицы
     * @param {any} value - новое значение ячейки таблицы
     * @param {Boolean} isCalcAllCells - нужно ли пересчитывать все ячейки таблицы после обновления текущей ячейки
     */
    setValue(value, isCalcAllCells) {
        let cellName = this.#param.name;
        if ( value === undefined ) {
            this.initCell();
            this.#calcData.asyncDeleteCellValue(cellName);
            if( isCalcAllCells ) this.#calcData.calcAllCells();
        }
        else if ( Number(value) === 0 ) {
            this.#value.type = ValueTypes.Number;
            this.#value.number = 0;
            this.#calcData.setValue(cellName, this.#value.number);
            this.#value.html = 0;
            if( isCalcAllCells ) this.#calcData.calcAllCells();
        }
        else if ( Number(value) ) {
            this.#value.type = ValueTypes.Number;
            this.#value.number = Number(value);
            this.#calcData.setValue(cellName, this.#value.number);
            this.#value.html = value;
            if( isCalcAllCells ) this.#calcData.calcAllCells();
        }
        else if ( String(value).charAt(0) === '=' ) {
            this.#value.type = ValueTypes.Formula;
            this.#value.formula = value;
            this.#calcData.setTokens(cellName, this.#value.formula);
            if( isCalcAllCells ) this.#calcData.calcAllCells();
        }
        else if ( Array.isArray(value) ) {
            this.#value.type = ValueTypes.Formula;
            this.#value.formula = "="+value.map( item => item.value ).join("");
            this.#calcData.setTokens(cellName, value);
            this.#value.html = this.#calcData.calcCell(cellName);
        }
        else {
            this.#value.type = ValueTypes.String;
            this.#value.string = value;
            this.#value.html = value;
            this.#calcData.setString(cellName, value);
        }
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


/**
 * Класс, расширяющий функциональность базового класса таблицы
 */
class Table extends HTMLTableElement{
    #cursor; 

    /**
     * Конструктор таблицы 
     * @param {String} rootClass родительский элемент c class='rootClass', в котором размещается таблица
     * @param {Объект} params набор параметров инициализации таблицы
     */
    constructor (rootClass, params) {
        super();
        this.tableName = rootClass;
        this.id = "b-table";
        this.colCount = params.colCount;
        this.rowCount = params.rowCount;
        this.cells = new Map();
        this.headers = [];
        this.calculator = new Calculator(this.cells);
        this.#cursor = new Cursor(this);
        this.tabIndex = -1;
        this.focus();
        this.generateTable(params);

        this.addEventListener("keydown", this.handlerKeyMoving);
        this.addEventListener("keydown", this.handlerKeyEditing);
        this.setCursor("A1");
    }

    /**
     * Герерация html-таблицы по заданным в конструкторе Table параметрам
     * @param {Object} params - набор параметром, упакованных в объект
     */
    generateTable(params) {
        // генерация шапки таблицы
        let tHead = document.createElement("tHead");
        let hRow = tHead.insertRow(-1);
        this.headers.push("");
        let th = document.createElement("th");
        th.innerHTML = "";
        hRow.append(th);
        for (let i = 0; i < params.colCount; i++) {
            let letter = String.fromCharCode("A".charCodeAt(0) + i);
            this.headers.push(letter);
            let th = document.createElement("th");
            th.innerHTML = letter;
            hRow.append(th);
        }
        this.append(tHead);
        
        // генерация содержимого таблицы
        let tBody = document.createElement("tBody");
        for (let i = 1; i < params.rowCount + 1; i++) {
            let row = tBody.insertRow(-1);
            let th = document.createElement("th");
            th.innerHTML = i;
            row.append(th);
            for (let j = 1; j <= params.colCount; j++) {
                let letter = this.headers[j];
                let cell = new Cell(this, i, letter, this.calculator);
                this.cells.set(letter + i, cell);
                row.insertCell(-1).append(cell);
            }
        }
        this.append(tBody);
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    getCell(cellName) {
        return this.cells.get(cellName);
    }

    get cursor() {
        return this.#cursor;
    }

    /**
     * Установление курсора в позицию ячейки с именем cellName
     * @param {String} cellName 
     */
    setCursor(cellName) {
        if  ( this.#cursor.cell ) {
            let oldCell = this.#cursor.cell;
            oldCell.value = this.#cursor.value;
        }
        this.#cursor.cell = this.getCell(cellName);
    }

    /**
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {*} deltaRow 
     * @param {*} deltaCol 
     */
    moveCursor(deltaRow, deltaCol, cellName) {
        let currentCell = cellName ? this.getCell(cellName) : this.#cursor.cell;
        let newCol = currentCell.colNumber;
        let newRow = currentCell.rowNumber;

        if ( deltaRow > 0 ) newRow += Math.min(deltaRow, this.rowCount-newRow);
        else newRow += Math.max(deltaRow, 1-newRow);
        if ( deltaCol > 0 ) newCol += Math.min(deltaCol, this.colCount-newCol);
        else newCol += Math.max(deltaCol, 1-newCol);

        this.setCursor(currentCell.getCellName(newCol, newRow));
    }

   /**
     * Обработка нажатий на клавиши стрелок
     * @param {KeyEvent} event 
     */
    handlerKeyMoving(event) {
        let deltaRow=0, deltaCol=0;
        let currentCell = this.#cursor.cell;
        switch(event.key) {
            case "ArrowUp" : 
                if ( this.#cursor.edit ) this.#cursor.endEditing();
            // переход на первую строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = 1 - currentCell.rowNumber;
                else deltaRow -= 1;
                break;
            case "ArrowDown" :
                if ( this.#cursor.edit ) this.#cursor.endEditing();
                // переход на последнюю строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = this.rowCount - currentCell.rowNumber;
                else deltaRow += 1;
                break;
            case "ArrowLeft" :
                // переход на первую колонку при нажатой клавише Ctrl
                if ( this.#cursor.edit ) this.#cursor.endEditing();
                if ( event.ctrlKey )
                    deltaCol = 1 - currentCell.colNumber;
                // переход в конец верхней строки при нахождении курсора в первой ачейке строки
                else if ( currentCell.colNumber == 1 ) {
                    deltaCol += this.colCount;
                    deltaRow -= 1;
                }
                else deltaCol -= 1;
                break;
            case "Tab" :
                this.focus();
            case "ArrowRight" :
                    if ( this.#cursor.edit ) this.#cursor.endEditing();
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    deltaCol = this.colCount - currentCell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( currentCell.colNumber == this.colCount ) {
                    deltaCol -= this.colCount;
                    deltaRow += 1;
                }
                else deltaCol += 1;
                break;
            case "Home" :
                if ( this.#cursor.edit ) this.#cursor.endEditing();
                // переход на первую колонку 
                deltaCol = 1 - currentCell.colNumber;
                if ( event.ctrlKey ) deltaRow = 1 - currentCell.rowNumber;
                break;
            case "End" :
                if ( this.#cursor.edit ) this.#cursor.endEditing();
                // переход на последнюю колонку
                deltaCol = this.colCount - currentCell.colNumber;
                if ( event.ctrlKey ) deltaRow = this.rowCount - currentCell.rowNumber;
                break;

            }
        this.moveCursor(deltaRow, deltaCol);
    }

    /**
     * Обработка событий нажатия клавиш включения/отключения режима редактирования ячейки
     * @param {KeyEvent} event 
     */
    handlerKeyEditing(keyEvent) {
        let currentCellName = this.#cursor.cell.name;
        switch(event.key) {
            case "F2" : 
                this.#cursor.beginEditing();
                break;
            case "Escape" : 
                this.#cursor.escapeEditing();
                this.setCursor(currentCellName);
                break;
            case "Enter" : 
                if ( this.#cursor.edit ) {
                    this.#cursor.endEditing();
                    this.moveCursor(1, 0, currentCellName);
                }
                break;
            case "Delete" :
                this.#cursor.value = "";
                break;
            case "Backspace" :
                if ( this.#cursor.edit ) {
                    this.#cursor.removeLastKey();
                    // this.#cursor.focus();
                }
                break;
            default: 
                if ( this.#cursor.isPrintKey(event.keyCode) && !this.#cursor.edit ) {
                    this.#cursor.beginEditing();
                    this.#cursor.addKey(keyEvent);
                }
                else if ( this.#cursor.edit ) {
                    this.#cursor.addKey(keyEvent);
                    // this.#cursor.focus();
                }
                break;
        }
    }

}

// регистрация нового html-элемента
customElements.define('b-table', Table, {extends: 'table'});
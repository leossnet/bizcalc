/**
 * Класс, расширяющий функциональность базового класса таблицы
 */
class Table extends HTMLTableElement{
    #app;
    #table = {};
    #cursor;
    #tdata;
    #editor;
    #tableStyle;

    /**
     * Конструктор таблицы 
     * @param {String} rootElement родительский элемент c class='rootElement', в котором размещается таблица
     * @param {Объект} params набор параметров инициализации таблицы
     */
    constructor (app, params) {
        super();
        this.#app = app;
            // this.id = app.root.id+"Table";
        this.#table = {
            colCount: params.colCount,
            rowCount: params.rowCount
        };
        this.headers = [];
        this.#tdata = new TableData(app);
        this.#editor = params.editor;
        this.#cursor = new Cursor(app, this);
        this.tabIndex = -1;

        // генерация внешнего вида таблицы
        this.generateTable(params);
        this.viewCells("B2", "F10");
        this.setCursor("B2");
        if ( params.isFocus ) this.focus();

        // обработчики событий
        this.addEventListener("keydown", this.handlerKeyMoving);
        this.addEventListener("keydown", this.handlerKeyEditing);
    }

    /**
     * Герерация html-таблицы по заданным в конструкторе Table параметрам
     * @param {Object} params - набор параметром, упакованных в объект
     */
    generateTable(params) {
        // подготовка для формирования глобальных стилей привязки элементов кнопочной панели
        this.#tableStyle = this.querySelector("table style");
        if ( !this.#tableStyle ) {
            this.#tableStyle = document.createElement("style");
            this.append(this.#tableStyle);
        }
        
        // генерация шапки таблицы
        let tHead = document.createElement("tHead");
        let hRow = tHead.insertRow(-1);
        this.headers.push("");
        let th = document.createElement("th");
        th.innerHTML = "";
        hRow.append(th);
        for (let i = 0; i < this.#table.colCount; i++) {
            let letter = String.fromCharCode("A".charCodeAt(0) + i);
            this.headers.push(letter);
            let th = document.createElement("th");
            th.setAttribute("col", letter);
            th.innerHTML = letter;
            hRow.append(th);
        }
        this.append(tHead);

        // генерация содержимого таблицы
        let tBody = document.createElement("tBody");
        for (let i = 1; i < this.#table.rowCount + 1; i++) {
            let row = tBody.insertRow(-1);
            row.setAttribute("row", i);
            let th = document.createElement("th");
            th.setAttribute("row", i);
            th.innerHTML = i;
            row.append(th);
            for (let j = 1; j <= this.#table.colCount; j++) {
                let letter = this.headers[j];
                let cell = new Cell(this, i, letter);
                // cell.id = letter + i;
                this.#tdata.setCell(letter + i, cell);
                let th = row.insertCell(-1);
                th.setAttribute("col", letter);
                th.append(cell);
                // row.insertCell(-1).append(cell);
            }
        }

        this.append(tBody);
    }

    /**
     * Возвращает параметры таблицы
     */
    get tableParam() {
        return this.#table;
    }

    /**
     * Получение объекта данных таблицы
     */
    get tableData() {
        return this.#tdata;
    }

    get editor() {
        return this.#editor;
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    getCell(cellName) {
        return this.#tdata.getCell(cellName);
    }

    /**
     * Установление курсора в позицию ячейки с именем cellName
     * @param {String} cellName 
     */
    setCursor(cellName) {
        let oldCell;
        if  ( this.#cursor.cell ) oldCell = this.#cursor.cell;
        let newCell = this.getCell(cellName);
        this.#cursor.cell = newCell;
        if ( oldCell && oldCell !== newCell) oldCell.refresh();
        // this.#cursor.setInput();
    }

    /**
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {Number} deltaRow - количество строк смещения 
     * @param {Number} deltaCol - количество колонок смещения
     * @param {String} cellName - имя ячейки, относительно которой производится перемещение курсора
     */
    moveCursor(deltaRow, deltaCol, cellName) {
        let currentCell = cellName ? this.getCell(cellName) : this.#cursor.cell;
        let newCol = currentCell.colNumber;
        let newRow = currentCell.rowNumber;

        if ( deltaRow > 0 ) newRow += Math.min(deltaRow, this.#table.rowCount-newRow);
        else newRow += Math.max(deltaRow, 1-newRow);
        if ( deltaCol > 0 ) newCol += Math.min(deltaCol, this.#table.colCount-newCol);
        else newCol += Math.max(deltaCol, 1-newCol);

        this.setCursor(currentCell.getCellName(newRow, newCol));
    }

    
    /**
     * Установка видимой части таблицы
     * @param {String} beginCellName - левая верхняя видимая ячейка таблицы
     * @param {Strinhg} endCellName - правая нижняя видимая ячейка таблицы
     */
    viewCells(beginCellName, endCellName) {
        let beginCell = this.getCell(beginCellName);
        let endCell = this.getCell(endCellName);
        let beginRow = beginCell.rowNumber-1;
        let beginCol = beginCell.colNumber;
        let endRow = endCell.rowNumber+1;
        let endCol = endCell.colNumber+2;
        let cssText = ""
            +"tr[row]:nth-child(-n+"+beginRow+"),tr[row]:nth-child(n+"+endRow+")"
            +"{display: none;}"
            +"th[col]:nth-child(-n+"+beginCol+"), td[col]:nth-child(-n+"+beginCol+"),"
            +"th[col]:nth-child(n+"+endCol+"), td[col]:nth-child(n+"+endCol+")"+
            "{display: none;}";
        this.#tableStyle.innerHTML = cssText;
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
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
            // переход на первую строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = 1 - currentCell.rowNumber;
                else deltaRow -= 1;
                this.moveCursor(deltaRow, deltaCol);
                break;
            case "ArrowDown" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = this.#table.rowCount - currentCell.rowNumber;
                else deltaRow += 1;
                this.moveCursor(deltaRow, deltaCol);
                break;
            case "ArrowLeft" :
                // переход на первую колонку при нажатой клавише Ctrl
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                if ( event.ctrlKey )
                    deltaCol = 1 - currentCell.colNumber;
                // переход в конец верхней строки при нахождении курсора в первой ачейке строки
                else if ( currentCell.colNumber == 1 ) {
                    deltaCol += this.#table.colCount;
                    deltaRow -= 1;
                }
                else deltaCol -= 1;
                this.moveCursor(deltaRow, deltaCol);
                break;
            case "Tab" :
                this.focus();
            case "ArrowRight" :
                    if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    deltaCol = this.#table.colCount - currentCell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( currentCell.colNumber == this.#table.colCount ) {
                    deltaCol -= this.#table.colCount;
                    deltaRow += 1;
                }
                else deltaCol += 1;
                this.moveCursor(deltaRow, deltaCol);
                break;
            case "Home" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на первую колонку 
                deltaCol = 1 - currentCell.colNumber;
                if ( event.ctrlKey ) deltaRow = 1 - currentCell.rowNumber;
                this.moveCursor(deltaRow, deltaCol);
                break;
            case "End" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю колонку
                deltaCol = this.#table.colCount - currentCell.colNumber;
                if ( event.ctrlKey ) deltaRow = this.#table.rowCount - currentCell.rowNumber;
                this.moveCursor(deltaRow, deltaCol);
                break;

            }
    }

    /**
     * Обработка событий нажатия клавиш включения/отключения режима редактирования ячейки
     * @param {KeyEvent} event 
     */
    handlerKeyEditing(keyEvent) {
        let currentCellName = this.#cursor.cell.name;
        switch(keyEvent.key) {
            case "F2" : 
                this.#cursor.beginEditing();
                break;
            case "Escape" : 
                this.#cursor.escapeEditing();
                this.setCursor(currentCellName);
                break;
            case "Enter" : 
                if ( this.#cursor.isEdit ) {
                    this.#cursor.endEditing();
                    this.moveCursor(1, 0, currentCellName);
                }
                break;
            case "Delete" :
                this.#cursor.clearValue();
                this.setCursor(currentCellName);
                break;
            case "Backspace" :
                if ( this.#cursor.isEdit ) {
                    this.#cursor.removeLastKey();
                }
                break;
            default: 
                if ( this.#cursor.isPrintKey(keyEvent.keyCode) ) {
                    if ( !this.#cursor.isEdit ) this.#cursor.beginInput();
                    this.#cursor.addKey(keyEvent);
                }
                break;
        }
    }
}

// регистрация нового html-элемента
customElements.define('b-table', Table, {extends: 'table'});
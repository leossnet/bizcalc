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
    #view = {};
    #colWidths;
    #cols;

    /**
     * Конструктор таблицы 
     * @param {String} rootElement родительский элемент c class='rootElement', в котором размещается таблица
     * @param {Объект} params набор параметров инициализации таблицы
     */
    constructor (app, params) {
        super();
        this.#app = app;
        this.#table = {
            colCount: params.colCount,
            rowCount: params.rowCount
        };
        this.headers = [];
        this.#colWidths = params.colWidths;
        this.#cols = new Map();
        this.#tdata = new TableData(app);
        this.#editor = params.editor;
        this.#cursor = new Cursor(app, this);
        this.classList.add("table");
        this.tabIndex = -1;

        // генерация внешнего вида таблицы
        this.generateTable(params);
        this.#tableStyle = document.createElement("style");
        this.append(this.#tableStyle);
        // this.viewCells("B2", 2, 2);
        this.setCursor("A1");
        if ( params.isFocus ) this.focus();

        // обработчики событий
        this.addEventListener("keydown", this.handlerKeyMoving);
        this.addEventListener("keydown", this.handlerKeyEditing);
        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
    }

    /**
     * Герерация html-таблицы по заданным в конструкторе Table параметрам
     * @param {Object} params - набор параметром, упакованных в объект
     */
    generateTable(params) {
        // генерация параметров колонок
        let cgHeader = document.createElement("colgroup");
        cgHeader.classList.add("col-header");
        cgHeader.span = 1;
        this.append(cgHeader);
        let cgData = document.createElement("colgroup");
        cgData.classList.add("col-data");
        cgData.span = params.colCount;
        // console.log(this.#colWidths);
        for (let c=0; c<params.colCount; c++) {
            let col = document.createElement("col");
            col.id = String.fromCharCode("A".charCodeAt(0) + c);
            if ( params && params.colWidths ) col.setAttribute("width", params.colWidths[c]);
            else col.setAttribute("width", 80);
            col.setAttribute("index", c);
            this.#cols.set(col.id, col);
            cgData.append(col);
        }
        this.append(cgData);        

        // генерация шапки таблицы
        let tHead = document.createElement("tHead");
        let hRow = tHead.insertRow(-1);
        hRow.classList.add("row-header");
        this.headers.push("");
        let th = document.createElement("th");
        th.classList.add("cell-header");
        th.innerHTML = "";
        hRow.append(th);
        for (let i = 0; i < this.#table.colCount; i++) {
            let letter = String.fromCharCode("A".charCodeAt(0) + i);
            this.headers.push(letter);
            let th = document.createElement("th");
            th.classList.add("cell-header");
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
            row.classList.add("row-data");
            let th = document.createElement("th");
            th.classList.add("cell-header");
            th.setAttribute("row", i);
            th.innerHTML = i;
            row.append(th);
            for (let j = 1; j <= this.#table.colCount; j++) {
                let letter = this.headers[j];
                let cell = new Cell(this, i, letter);
                cell.setAttribute("row", i);
                cell.setAttribute("col", letter);
                this.#tdata.setCell(letter + i, cell);
                let th = row.insertCell(-1);
                th.classList.add("cell-case");
                th.setAttribute("col", letter);
                th.append(cell);
            }
        }

        this.append(tBody);
    }

    setColWidth(colName, width) {
        this.#cols.get(colName).setAttribute("width", width);
    }

    getColWidth(colName) {
        this.#cols.get(colName).getAttribute("width");
    }

    /**
     * Возвращает пар   аметры таблицы
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
        this.setAttribute("cursor-cell", this.#cursor.cell.name);
        if ( oldCell && oldCell !== newCell) oldCell.refresh();
        // this.#cursor.setInput();
    }

    /**
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {Number} rowCount - количество строк смещения 
     * @param {Number} colCount - количество колонок смещения
     * @param {String} cellName - имя ячейки, относительно которой производится перемещение курсора
     */
    moveCursor(rowCount, colCount, cellName) {
        let currentCell = cellName ? this.getCell(cellName) : this.#cursor.cell;
        let newCol = currentCell.colNumber;
        let newRow = currentCell.rowNumber;

        if ( rowCount > 0 ) newRow += Math.min(rowCount, this.#table.rowCount-newRow);
        else newRow += Math.max(rowCount, 1-newRow);
        if ( colCount > 0 ) newCol += Math.min(colCount, this.#table.colCount-newCol);
        else newCol += Math.max(colCount, 1-newCol);

        this.setCursor(currentCell.getCellName(newRow, newCol));
    }

    
    /**
     * Установка видимой части таблицы
     * @param {String} beginCellName - левая верхняя видимая ячейка таблицы
     * @param {Strinhg} endCellName - правая нижняя видимая ячейка таблицы
     */
    viewCells(beginCellName, rowCount, colCount) {
        let beginCell = this.getCell(beginCellName);
        let beginRow = beginCell.rowNumber-1;
        let beginCol = beginCell.colNumber;
        let endRow = beginRow+rowCount+1;
        let endCol = beginCol+colCount+1;
        let cssText = ""
            +".row-data[row]:nth-child(-n+"+beginRow+"),"       // строки до начальной строки
            +".row-data[row]:nth-child(n+"+endRow+")"           // строки после конечной строки
                +"{display: none;}"
            +".cell-header[col]:nth-child(-n+"+beginCol+"),"    // колонки заголовков до начальной колонки
            +".cell-case[col]:nth-child(-n+"+beginCol+"),"      // колонки данных до начальной колонки
            +".cell-header[col]:nth-child(n+"+endCol+"),"       // колонки заголовков после конечной колонки
            +".cell-case[col]:nth-child(n+"+endCol+")"+         // колонки данных после конечной колонки
                "{display: none;}";
        this.#tableStyle.innerHTML = cssText;
    }

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
        this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     */
    static get observedAttributes() {
        return ["cursor-cell", "view-width", "view-height"];
    }

    /**
     * Обработчик события изменения значений пользовательских атрибутов, возвращаемых observedAttributes
     * @param {String} name - имя атрибута 
     * @param {String} oldValue - предыдущее значение атрибута
     * @param {String} newValue - новое значение атрибута
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "view-width" || name == "view-height" ) {
            let maxCol = this.setVisibleCols();
            let maxRow = this.setVisibleRows();
            this.viewCells("A1", maxRow, maxCol);
        }
    }

    setVisibleRows() {
        let visibleRows = this.#table.rowCount;
        let vh = parseInt(this.getAttribute("view-height"));
        let hHeader = parseInt(getComputedStyle(document.querySelector("header.flex-item")).height);
        let hFooter = parseInt(getComputedStyle(document.querySelector("footer.flex-item")).height);
        let hDocument = parseInt(getComputedStyle(document.querySelector("div#bizcalc")).height);
        vh = hDocument - hHeader - hFooter;
        visibleRows = Math.floor(vh / 22);

        return visibleRows;
    }

    setVisibleCols() {
        let visibleCols = this.#table.colCount;
        let headerWidth = 40;
        let visibleWidth = parseInt(this.getAttribute("view-width")) - headerWidth;
        this.setDefaultColWidth();
        let fullVisibleCols = this.getFullVisibleCols("A1", visibleWidth);
        let rightColWidth = visibleWidth - fullVisibleCols.width;

        if (rightColWidth > 0) {
            visibleCols = fullVisibleCols.count + 1;
            let rightColIndex = visibleCols - 1;
            let rightCol = String.fromCharCode("A".charCodeAt(0) + rightColIndex);
            if (this.#cols.get(rightCol))
                this.#cols.get(rightCol).setAttribute("width", rightColWidth);
        }
        else {
            visibleCols = fullVisibleCols.count;
        }
        return visibleCols;
    }

    getFullVisibleCols(beginCellName, parentWidth) {
        let cell = this.#tdata.getCell(beginCellName);
        let beginCol = Number(this.#cols.get(cell.getAttribute("col")).getAttribute("index"));
        let colWidths = 0;
        let colIndex;
        for (colIndex = beginCol; colIndex<this.#table.colCount; colIndex++) {
            let col = this.#cols.get(String.fromCharCode("A".charCodeAt(0)+colIndex)).id;
            if ( (colWidths + Number(this.#cols.get(col).getAttribute("width")) ) > parentWidth ) break;
            colWidths += Number(this.#cols.get(col).getAttribute("width"));
        }
        return {
            count: colIndex, 
            width: colWidths 
        };
    }

    setDefaultColWidth() {
        let cols = document.querySelector(".col-data").childNodes;
        cols.forEach(col => {
            col.setAttribute("width", 80);
        });
    }

   /**
     * Обработка нажатий на клавиши стрелок
     * @param {KeyEvent} event 
     */
    handlerKeyMoving(event) {
        let rowCount=0, colCount=0;
        let currentCell = this.#cursor.cell;
        switch(event.key) {
            case "ArrowUp" : 
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
            // переход на первую строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    rowCount = 1 - currentCell.rowNumber;
                else rowCount -= 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "ArrowDown" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    rowCount = this.#table.rowCount - currentCell.rowNumber;
                else rowCount += 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "ArrowLeft" :
                // переход на первую колонку при нажатой клавише Ctrl
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                if ( event.ctrlKey )
                    colCount = 1 - currentCell.colNumber;
                // переход в конец верхней строки при нахождении курсора в первой ачейке строки
                else if ( currentCell.colNumber == 1 ) {
                    colCount += this.#table.colCount;
                    rowCount -= 1;
                }
                else colCount -= 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "Tab" :
                this.focus();
            case "ArrowRight" :
                    if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    colCount = this.#table.colCount - currentCell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( currentCell.colNumber == this.#table.colCount ) {
                    colCount -= this.#table.colCount;
                    rowCount += 1;
                }
                else colCount += 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "Home" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на первую колонку 
                colCount = 1 - currentCell.colNumber;
                if ( event.ctrlKey ) rowCount = 1 - currentCell.rowNumber;
                this.moveCursor(rowCount, colCount);
                break;
            case "End" :
                if ( this.#cursor.isEdit ) this.#cursor.endEditing();
                // переход на последнюю колонку
                colCount = this.#table.colCount - currentCell.colNumber;
                if ( event.ctrlKey ) rowCount = this.#table.rowCount - currentCell.rowNumber;
                this.moveCursor(rowCount, colCount);
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
                if ( this.#cursor.isPrintKey(keyEvent.keyCode) && !keyEvent.ctrlKey ) {
                    if ( !this.#cursor.isEdit ) this.#cursor.beginInput();
                    this.#cursor.addKey(keyEvent);
                }
                break;
        }
    }
}

// регистрация нового html-элемента
customElements.define('b-table', Table, {extends: 'table'});
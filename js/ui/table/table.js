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
        this.viewCells("B2", 2, 2);
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
        console.log(this.#colWidths);
        for (let c=0; c<params.colCount; c++) {
            let col = document.createElement("col");
            col.id = String.fromCharCode("A".charCodeAt(0) + c);
            if ( params && params.colWidths ) col.setAttribute("width", params.colWidths[c]);
            else col.setAttribute("width", 80);
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
                // cell.id = letter + i;
                this.#tdata.setCell(letter + i, cell);
                let th = row.insertCell(-1);
                th.classList.add("cell-case");
                th.setAttribute("col", letter);
                th.append(cell);
                // row.insertCell(-1).append(cell);
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
    viewCells(beginCellName, deltaRow, deltaCol) {
        let beginCell = this.getCell(beginCellName);
        let beginRow = beginCell.rowNumber-1;
        let beginCol = beginCell.colNumber;
        let endRow = beginRow+deltaRow;
        let endCol = beginCol+deltaCol+1;
        let cssText = ""
            +".row-data[row]:nth-child(-n+"+beginRow+"),.row-data[row]:nth-child(n+"+endRow+")"
            +"{display: none;}"
            +"th[col]:nth-child(-n+"+beginCol+"), td[col]:nth-child(-n+"+beginCol+"),"
            +"th[col]:nth-child(n+"+endCol+"), td[col]:nth-child(n+"+endCol+")"+
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
        if (name =="cursor-cell") {
            console.log("cursor: "+oldValue+" -> "+newValue);
        }
        if (name == "view-width" || name == "view-height" ) {
            // let vh = parseInt(this.getAttribute("view-height"));
            let vw = parseInt(this.getAttribute("view-width"));

            let hHeader = parseInt(getComputedStyle(document.querySelector("header.flex-item")).height);
            let hFooter = parseInt(getComputedStyle(document.querySelector("footer.flex-item")).height);
            let hDocument = parseInt(getComputedStyle(document.querySelector("div#bizcalc")).height);
            let vh = hDocument-hHeader-hFooter;
            console.log(hDocument+" - "+hHeader+" - "+hFooter+" = "+(hDocument-hHeader-hFooter));

            // console.log(vh);
            // console.log(vw);
            let maxRow = Math.floor(vh/22);
            let maxCol = Math.floor((vw-40)/80);
            // console.log(maxRow+":"+maxCol);
            // console.log(getComputedStyle(this.parentElement).height);
            this.viewCells("A1", maxRow, maxCol);
        }
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
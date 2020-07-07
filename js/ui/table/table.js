const Course = {
    LFFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    DEFAULT: "default"
};

/**
 * Класс, расширяющий функциональность базового класса таблицы
 */
class Table extends HTMLTableElement{
    #app;
    #tableParams = {};
    #cursor;
    #tableData;
    #cellData;
    #editor;
    #tableStyle;
    #colWidthArray = [];
    #colMap;

    /**
     * Конструктор таблицы 
     * @param {String} rootElement родительский элемент c class='rootElement', в котором размещается таблица
     * @param {Объект} params набор параметров инициализации таблицы
     */
    constructor (app, params) {
        super();
        this.#app = app;
        this.#tableParams = {
            colCount: Math.min(params.colCount, MAX_COLUMN_COUNT),
            rowCount: params.rowCount
        };
        this.headers = [];
        if ( params && params.colWidths ) this.#colWidthArray = params.colWidths;
        else for (let c=0; c<params.colCount; c++) this.#colWidthArray[c] = 80;
        this.#colMap = new Map();
        this.#tableData = new TableData(app);
        this.#editor = params.editor;
        this.#cursor = new Cursor(app, this);
        this.classList.add("table");
        this.tabIndex = -1;

        // генерация внешнего вида таблицы
        this.generateTable(params);
        this.setStartCell("A1");
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
        this.#tableStyle = document.createElement("style");
        this.append(this.#tableStyle);

        // генерация параметров колонки с номерами строк
        let cgHeader = document.createElement("colgroup");
        cgHeader.classList.add("col-header");
        cgHeader.span = 1;
        let col = document.createElement("col");
        col.setAttribute("width", 40);
        cgHeader.append(col);
        this.append(cgHeader);

        // генерация параметров колонок с ячейками данных
        let cgData = document.createElement("colgroup");
        cgData.classList.add("col-data");
        cgData.span = params.colCount;
        for (let c=0; c<params.colCount; c++) {
            let col = document.createElement("col");
            col.id = CellData.getColName(c+1);

            if ( params && params.colWidths ) col.setAttribute("width", params.colWidths[c]);
            else col.setAttribute("width", 80);
            col.setAttribute("index", c);
            this.#colMap.set(col.id, col);
            cgData.append(col);
        }
        this.append(cgData);        

        // генерация шапки таблицы
        let tHead = document.createElement("tHead");
        let hRow = tHead.insertRow(-1);
        hRow.classList.add("row-header");
        
        this.createHeader(hRow, ["cell-header"], {}, "");
        this.headers.push("");

        for (let i = 0; i < this.#tableParams.colCount; i++) {
            let letter = CellData.getColName(i+1);
            this.headers.push(letter);
            this.createHeader(hRow, ["cell-header"], {col:letter}, letter);
        }
        this.append(tHead);

        // генерация данных ячеек
        for (let i = 1; i < this.#tableParams.rowCount + 1; i++) {
            for (let j = 1; j <= this.#tableParams.colCount; j++) {
                let letter = this.headers[j];
                let cellData = new CellData(this, i, letter);
                this.#tableData.setCellData(letter + i, cellData);
            }
        }

        // генерация содержимого таблицы
        let tBody = document.createElement("tBody");
        for (let i = 1; i < this.#tableParams.rowCount + 1; i++) {
            // создание новой строки
            let row = tBody.insertRow(-1);
            row.classList.add("row-data");
            row.setAttribute("row", i);
            this.createHeader(row, ["cell-header"], {row:i}, i);

            // добавление ячеек с данными
            for (let j = 1; j <= this.#tableParams.colCount; j++) {
                let letter = this.headers[j];
                let cell = new Cell(this, this.#tableData.getCellData(letter+i));
                this.#tableData.setCell(letter + i, cell);
                row.append(cell);
            }
        }
        this.append(tBody);
    }

    createHeader(root, classes, attrs, text) {
        let th = document.createElement("th");
        classes.forEach( item => th.classList.add(item) );
        for (let key in attrs) { th.setAttribute(key, attrs[key]); }
        th.innerHTML = text;
        root.append(th);
    }

    setColWidth(colName, width) {
        this.#colMap.get(colName).setAttribute("width", width);
    }

    getColWidth(colName) {
        return Number(this.#colMap.get(colName).getAttribute("width"));
    }

    getDefaultColWidth(colName) {
        let colIndex = this.#colMap.get(colName).getAttribute("index");
        return this.#colWidthArray[colIndex];
    }

    /**
     * Возвращает параметры таблицы
     */
    get tableParams() {
        return this.#tableParams;
    }
    
    /**
     * Получение объекта данных таблицы
     */
    get tableData() {
        return this.#tableData;
    }

    get editor() {
        return this.#editor;
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    getCell(cellName) {
        return this.#tableData.getCell(cellName);
    }

    getCellData(cellName) {
        return this.#tableData.getCellData(cellName);
    }

    /**
     * Установка крайней левой верхней видимой ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    setStartCell(cellName) {
        this.setAttribute("start-cell", cellName);
    }

    /**
     * Получение объекта крайней левой верхней видимой ячейки таблицы
     */
    getStartCell() {
        return this.#tableData.getCell(this.getAttribute("start-cell"));
    }

    /**
     * Установление курсора в позицию ячейки с именем cellName
     * @param {String} cellName имя ячейки в формате А1
     */
    setCursor(cellName) {
        // запомнить текущее положение курсора
        let oldCell;
        if  ( this.#cursor.cell ) oldCell = this.#cursor.cell;

        // установить новое положение курсора
        let newCell = this.getCell(cellName);
        this.#cursor.cell = newCell;
        this.setAttribute("cursor-cell", this.#cursor.cell.data.name);

        // обновить ячейку со старым положением курсора
        if ( oldCell && ( oldCell !== newCell) ) oldCell.refresh();

        this.updateVisibleCells(oldCell, newCell);
    }

    /**
     * Получение объекта курсора 
     */
    getCursor() {
        return this.#cursor;
    }

    /**
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {Number} rowCount - количество строк смещения 
     * @param {Number} colCount - количество колонок смещения
     * @param {String} cellName - имя ячейки, относительно которой производится перемещение курсора
     */
    moveCursor(rowCount, colCount, initCellName) {
        let currentCell = initCellName ? this.getCell(initCellName) : this.#cursor.cell;
        let newColNum = currentCell.data.colNumber;
        let newRow = currentCell.data.rowNumber;

        if ( rowCount > 0 ) newRow += Math.min(rowCount, this.#tableParams.rowCount-newRow);
        else newRow += Math.max(rowCount, 1-newRow);
        if ( colCount > 0 ) newColNum += Math.min(colCount, this.#tableParams.colCount-newColNum);
        else newColNum += Math.max(colCount, 1-newColNum);

        this.setCursor(CellData.getCellName(newRow, newColNum));
    }
    
    /**
     * Установка видимой части таблицы
     * @param {String} initCellName - левая верхняя видимая ячейка таблицы
     * @param {Strinhg} endCellName - правая нижняя видимая ячейка таблицы
     */
    viewFromCell(initCellName, rowCount, colCount) {
        let beginCell = this.getCellData(initCellName);
        let beginRow = beginCell.rowNumber-1;
        let beginCol = beginCell.colNumber;
        let endRow = beginRow+rowCount+1;
        let endCol = beginCol+colCount+1;
        this.setCssText(beginRow, beginCol, endRow, endCol);
    }
    
    /**
     * Установка видимой части таблицы
     * @param {String} initCellName - правая нижняя видимая ячейка таблицы
     * @param {Strinhg} endCellName - левая верхняя видимая ячейка таблицы
     */
    // viewToCell(endCellName, rowCount, colCount) {
    //     let endCell = this.getCellData(endCellName);
    //     let endRow = endCell.rowNumber;
    //     let endCol = endCell.rowNumber;
    //     let beginRow = endRow-rowCount+1;
    //     let beginCol = endCol-colCount+1;
    //     this.setCssText(beginRow, beginCol, endRow, endCol);
    // }


    /**
     * Установка видимости колонок
     * @param {Number} beginRow - номер начальной видимой строки
     * @param {Number} initCol - номер начальнок видимой колонки
     * @param {Number} endRow - номер конечной видимой строки
     * @param {Number} endCol - номер конечной видимой колонки
     */
    setCssText(beginRow, beginCol, endRow, endCol) {
        let cssText = ""
            + ".row-data[row]:nth-child(-n+" + beginRow + ")," // строки до начальной строки
            + ".row-data[row]:nth-child(n+" + endRow + ")" // строки после конечной строки
            + "{display: none;}"
            + ".cell-header[col]:nth-child(-n+" + beginCol + ")," // колонки заголовков до начальной колонки
            + ".cell-data[col]:nth-child(-n+" + beginCol + ")," // колонки данных до начальной колонки
            + ".cell-header[col]:nth-child(n+" + endCol + ")," // колонки заголовков после конечной колонки
            + ".cell-data[col]:nth-child(n+" + endCol + ")" + // колонки данных после конечной колонки
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
        return ["cursor-cell", "view-width", "view-height", "start-cell"];
    }

    /**
     * Обработчик события изменения значений пользовательских атрибутов, возвращаемых observedAttributes
     * @param {String} name - имя атрибута 
     * @param {String} oldValue - предыдущее значение атрибута
     * @param {String} newValue - новое значение атрибута
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "view-width" || name == "view-height" || name == "start-cell") {
            let startCellName = this.getStartCell().data.name;
            let visibleCols = this.setVisibleCols(startCellName, Course.RIGHT);
            let visibleRows = this.setVisibleRows(startCellName, Course.BOTTOM);
            this.viewFromCell(startCellName, visibleRows, visibleCols);
        }
    }



    /**
     * Обновление видимых на экране колонок при перемещении курсора
     * @param {Object} oldCell - объект ячейки, в которой расположен курсор
     * @param {Object} newCell - новая ячейка, в которую перемещается курсор
     */
    updateVisibleCells(oldCell, newCell) {
        let oldColNum = oldCell ? oldCell.data.colNumber : this.getStartCell().data.colNumber;
        let oldRowNum = oldCell ? oldCell.data.rowNumber : this.getStartCell().data.rowNumber;
        let newColNum = newCell.data.colNumber ;
        let newRowNum = newCell.data.rowNumber ;

        let startCell = this.getStartCell().data;
        let startColNum = startCell.colNumber;
        let startRowNum = startCell.rowNumber;

        // разобраться, в какой момент возникает course == undefined ?
        let colCourse = (newColNum > oldColNum) ? Course.RIGHT : ( (newColNum < oldColNum) ? Course.LEFT : Course.DEFAULT );
        let rowCourse = (newRowNum > oldRowNum) ? Course.BOTTOM : ( (newRowNum < oldRowNum) ? Course.TOP : Course.DEFAULT );

        // console.log("updateVisibleCells: set course - "+course);
        let offsetX = this.getOffsetX(startCell.name, this.getVisibleWidth(), colCourse);
        let endColNum = startCell.colNumber + offsetX.cols - 1;

        let fullVisibleRows = this.getFullVisibleRows(startCell.name, this.getVisibleHeight(), rowCourse);
        let endRowNum = startCell.rowNumber + fullVisibleRows.count - 2;
        // console.log("startCell.rowNumber: "+startCell.rowNumber+",  fullVisibleRows.count: "+fullVisibleRows.count);

        let newStartCol = startColNum;
        let newStartRow = startRowNum;

        console.log("startColNum: "+startColNum+" -> newStartCol: "+newStartCol);
        console.log("startRowNum: "+startRowNum+" -> newStartRow: "+newStartRow);

        if ( colCourse == Course.RIGHT && newColNum > endColNum ) {
            let delta = ( newColNum == this.#tableParams.colCount ) ? 1 : 0;
            newStartCol = startColNum + newColNum - endColNum - delta;
        }
        else if ( colCourse == Course.LEFT && newColNum < endColNum ) {
            newStartCol = newColNum;
        }
        if ( rowCourse == Course.BOTTOM && newRowNum > endRowNum ) {
            newStartRow = startRowNum + newRowNum - endRowNum;
        }
        else if ( rowCourse == Course.TOP && newRowNum < endRowNum ) {
            newStartRow = newRowNum;
        }        
        this.setStartCell(CellData.getCellName(newStartRow, newStartCol));
    }    

    setVisibleRows(startCellName, course) {
        let startCell = this.getStartCell().data;
        let fullVisibleRows = this.getFullVisibleRows(startCell.name, this.getVisibleHeight(), Course.BOTTOM);
        return fullVisibleRows.count;

        // let startCellData = this.#tableData.getCellData(startCellName);
        // let visibleRows = 0;
        // let visibleHeight = this.getVisibleHeight();
        // let headerRows = this.querySelectorAll(".row-header");

        // let dataRows = this.querySelectorAll(".row-data");
        // // console.log(dataRows);

        // let visibleRowsHeight = 0;
        // headerRows.forEach( row => {
        //     visibleRowsHeight += Number.parseFloat(getComputedStyle(row).height); 
        //     visibleRows++;
        // } );
        // for (let row of dataRows) {
        //     if ( Number.parseInt(row.getAttribute("row")) < startCellData.rowNumber ) continue;
        //     visibleRowsHeight += Number.parseFloat(getComputedStyle(row).height);
        //     if ( visibleRowsHeight > visibleHeight ) break;
        //     visibleRows++;
        // }
        // return visibleRows;

    }

    getFullVisibleRows(startCellName, visibleHeight, course) {
        let startCellData = this.#tableData.getCellData(startCellName);
        let visibleRows = 0;
        let headerRows = this.querySelectorAll(".row-header");
        let dataRows = this.querySelectorAll(".row-data");

        let visibleRowsHeight = 0;
        headerRows.forEach( row => {
            visibleRowsHeight += Number.parseFloat(getComputedStyle(row).height); 
            visibleRows++;
        } );
        for (let row of dataRows) {
            let rowHeight = Number.parseFloat(getComputedStyle(row).height); 
            let rowNum = Number.parseInt(row.getAttribute("row"));
            if ( (rowNum>startCellData.rowNumber) && ( (Number(visibleRowsHeight)+rowHeight)<Number.parseFloat(visibleHeight))  ) {
                visibleRowsHeight += rowHeight;
                visibleRows++;
            }
        }
        return {
            count: visibleRows, 
            height: visibleRowsHeight
        };            
    }

    /**
     * Определение видимых на экране колонок таблицы
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {Object} course - направление отчета видимых колонок: Course.LEFT или Course.RIGHT
     */
    setVisibleCols(startCellName, course) {
        let visibleCols = this.#tableParams.colCount;
        let visibleWidth = this.getVisibleWidth();
        this.setDefaultColWidth();
        let offsetX = this.getOffsetX(startCellName, visibleWidth, course);
        let rightColWidth = visibleWidth - offsetX.width;

        if (rightColWidth > 0) {
            visibleCols = offsetX.cols + 1;
            let rightColIndex = visibleCols - 1;
            let startCell = this.#tableData.getCellData(startCellName);
            let rightColName = CellData.getColName(startCell.rowNumber + rightColIndex);
            let rightCol = this.#colMap.get(rightColName);
            if ( rightCol ) rightCol.setAttribute("width", rightColWidth);
        }
        else {
            visibleCols = offsetX.cols;
        }
        return visibleCols;
    }

    getVisibleHeight() {
        return getComputedStyle(document.querySelector("div.flex-row")).height; 
    }


    getVisibleWidth() {
        let headerWidth = 40;
        return parseInt(this.getAttribute("view-width")) - headerWidth;
    }


    /**
     * Получение объекта полностью видимых колонок в виде:
     * {
     *    count: [число полностью видимых колонок]
     *    width: [общая ширина полностью видимых колонок]
     * }
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {Number} parentWidth - ширина родительского компонента
     * @param {Object} course - направление отчета видимых колонок: Course.LEFT или Course.RIGHT
     */
    getOffsetX(startCellName, parentWidth, course) {
        let startCell = this.#tableData.getCellData(startCellName);
        let startColNum = startCell.colNumber;
        let startColName = startCell.colName;
        let colWidths = 0;
        let deltaColCount = 0;

        if ( course == Course.RIGHT ) {
            let rightColCount = this.#tableParams.colCount - startColNum;
            for (deltaColCount = 0; deltaColCount < rightColCount; deltaColCount++) {
                let newColName = this.getColName(startColName, deltaColCount);
                let newColWidth = this.getDefaultColWidth(newColName);
                if ( (colWidths + newColWidth ) > parentWidth ) break;
                colWidths += newColWidth;
            }
        }
        else if ( course == Course.LEFT ) {
            for (deltaColCount = startColNum; deltaColCount>0; deltaColCount--) {
                let newColName = this.getColName(startColName, 1-deltaColCount);
                let newColWidth = this.getDefaultColWidth(newColName);
                if ( ( colWidths + newColWidth ) > parentWidth ) break;
                colWidths += newColWidth;
            }
        }
        return {
            cols: deltaColCount, 
            width: colWidths 
        };
    }

    /**
     * Получение имени колонки, расположенной на deltaColCount строк правее или левее колонки initColName
     * @param {String} initColName - имя колонки, от которой ведется поиск
     * @param {Number} deltaColCount - смещение от начальнок колонки
     */
    getColName(initColName, deltaColCount) {
        let colName = CellData.getColName(CellData.getColNumber(initColName)+deltaColCount);
        return this.#colMap.get(colName).id;
    }


    /**
     * Установка ширины колонок по умолчанию, определенных в атрибуте widht элемента col
     */
    setDefaultColWidth() {
        let colData = document.querySelector(".col-data");
        if ( colData )  {
            let colArray = colData.childNodes;
            colArray.forEach(col => {
                col.setAttribute("width", this.#colWidthArray[col.getAttribute("index")]);
            });
        }
    }

   /**
     * Обработка нажатий на клавиши стрелок
     * @param {KeyEvent} event 
     */
    handlerKeyMoving(event) {
        let rowCount=0, colCount=0;
        let currentCell = this.#cursor.cell.data;
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
                    rowCount = this.#tableParams.rowCount - currentCell.rowNumber;
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
                    colCount += this.#tableParams.colCount;
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
                    colCount = this.#tableParams.colCount - currentCell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( currentCell.colNumber == this.#tableParams.colCount ) {
                    colCount -= this.#tableParams.colCount;
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
                colCount = this.#tableParams.colCount - currentCell.colNumber;
                if ( event.ctrlKey ) rowCount = this.#tableParams.rowCount - currentCell.rowNumber;
                this.moveCursor(rowCount, colCount);
                break;

            }
    }

    /**
     * Обработка событий нажатия клавиш включения/отключения режима редактирования ячейки
     * @param {KeyEvent} event 
     */
    handlerKeyEditing(keyEvent) {
        let currentCellName = this.#cursor.cell.data.name;
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
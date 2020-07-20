const Course = {
    LFFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    DEFAULT: "default"
};

const DEFAULT_COL_WIDTH = 80;   // ширина колонки по умолчанию в пикселях
const MAX_COLUMN_COUNT = 676;   // 26*26, где 26 - число букв в латинском алфавите

/**
 * Класс, расширяющий функциональность базового класса таблицы
 */
class Table extends HTMLTableElement{
    #app;
    #params = {};
    #cursor;
    #tableData;
    #editor;
    #tableStyle;
    #colWidthArray = [];
    #colMap;

    /**
     * Конструктор таблицы 
     * @param {String} app - родительский элемент, в котором размещается таблица
     * @param {Объект} params набор параметров инициализации таблицы
     */
    constructor (app, params) {
        super();
        this.#app = app;
        this.#params = {
            colCount: params.colCount ? Math.min(params.colCount, MAX_COLUMN_COUNT) : 26*2,
            rowCount: params.rowCount ? params.rowCount : 100,
            isFocus: params.isFocus ? params.isFocus : true,
            colWidths: params.colWidths ? params.colWidths : []
        };
        if ( params && params.colWidths ) {
            this.#colWidthArray = this.getColWidthArray(params.colWidths, this.#params.colCount);
        }
        this.headers = [];

        this.#colMap = new Map();
        this.#tableData = new TableData(app, this);
        this.#editor = params.editor ? params.editor : new Editor(this.#app);
        this.#cursor = new Cursor(app, this);
        this.classList.add("table");
        this.tabIndex = -1;

        // генерация данных ячеек
        this.generateTableData();

        // обработчики событий
        this.addEventListener("keydown", this.handlerKeyMoving);
        this.addEventListener("keydown", this.handlerKeyEditing);
        this.addEventListener("keydown", this.handlerKeyEvent);
        this.addEventListener("click", this.handlerClickCell);
        
        window.addEventListener("load", () => this.#tableData.asyncRefreshData() );
        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
    }

    /**
     * Возврат объекта приложения 
     * @returns {Object} - объект приложения
     */
    get app() {
        return this.#app;
    }

    /**
     * Возврат массива со значениями ширины колонок таблицы
     * @param {Array} colWidths - массив со значениями ширин первых колонок таблицы
     * @param {Number} colCount - общее количество колонок в таблице
     * @returns {Array} - массив со значениями ширин всех колонок таблицы
     */
    getColWidthArray(colWidths, colCount) {
        let res = [];
        for (let i=0; i<colWidths.length; i++) {
            res.push(colWidths[i]);
        }
        for (let i=colWidths.length; i<colCount; i++) {
            res.push(DEFAULT_COL_WIDTH);
        }
        return res;
    }
    
    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     * @returns {undefined}
     */
    async connectedCallback() { 
        this.generateTable(this.#params);

        this.setStartCell("A1", false);
        this.setCursor("A1", false);
        // await this.#tableData.asyncRefreshCursorCell();

        if ( this.#params.isFocus ) this.focus();
        this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
        this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     * @returns {Array} - массив наименований отслеживаемых атрибутов
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
            let visibleCols = this.getVisibleCols(startCellName, Course.RIGHT);
            let visibleRows = this.getVisibleRows(startCellName, Course.BOTTOM);
            this.viewFromCell(startCellName, visibleRows, visibleCols);
        }
        else if ( name == "cursor-cell" ) {
            // console.log(this.getCursorCell().data.name);
        } 
    }


    /**
     * Герерация html-таблицы по заданным в конструкторе Table параметрам
     * @param {Object} params - набор параметром, упакованных в объект
     */
    generateTable(params) {
        this.#tableStyle = document.createElement("style");
        this.append(this.#tableStyle);

        // генерация параметров колонки с номерами строк
        let cgHeader = this.createColGroup(this, ["col-header"], 1);
        let col = document.createElement("col");
        col.setAttribute("width", 40);
        cgHeader.append(col);

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
        tHead.classList.add("table-head");
        // let hRow = this.createRow(tHead, ["row-header"], {});
        let hRow = tHead.insertRow(-1);
        hRow.classList.add("row-header");
        
        this.createHeader(hRow, ["cell-header"], {}, "");
        this.headers.push("");

        for (let i = 0; i < this.#params.colCount; i++) {
            let letter = CellData.getColName(i+1);
            this.headers.push(letter);
            this.createHeader(hRow, ["cell-header"], {col:letter}, letter);
        }
        this.append(tHead);


        // генерация содержимого таблицы
        let tBody = document.createElement("tBody");
        for (let i = 1; i < this.#params.rowCount + 1; i++) {
            // создание новой строки
            let row = tBody.insertRow(-1);
            row.classList.add("row-data");
            row.setAttribute("row", i);
            this.createHeader(row, ["cell-header"], {row:i}, i);

            // добавление ячеек с данными
            for (let j = 1; j <= this.#params.colCount; j++) {
                let letter = this.headers[j];
                let cell = new Cell(this, this.#tableData.getCellData(letter+i));
                this.#tableData.setCell(letter + i, cell);
                row.append(cell);
            }
        }
        this.append(tBody);
    }

    /**
     * Генерация данных таблицы
     */
    generateTableData() {
        for (let i = 1; i < this.#params.rowCount + 1; i++) {
            for (let j = 1; j <= this.#params.colCount; j++) {
                let letter = CellData.getColName(j);
                let cellData = new CellData(this, i, letter);
                this.#tableData.setCellData(letter + i, cellData);
            }
        }
    }

    // createRow(root, classes, attrs) {
    //     let row = document.createElement("tr");
    //     classes.forEach( item => row.classList.add(item) );
    //     for (let key in attrs) { row.setAttribute(key, attrs[key]); }
    //     root.append(row);
    // }
    
    /**
     * Процедура создания заголовка th
     * @param {Object} root - корневой элемент заголовка
     * @param {Array} classes - набор стилевых классов CSS
     * @param {Object} attrs - объект атрибутов заголовка
     * @param {String} text - наименование заголовка, выводимое на экран
     */
    createHeader(root, classes, attrs, text) {
        let th = document.createElement("th");
        classes.forEach( item => th.classList.add(item) );
        for (let key in attrs) { th.setAttribute(key, attrs[key]); }
        th.innerHTML = text;
        root.append(th);
    }

    /**
     * Процедура создания группы колонок
     * @param {Object} root - корневой элемент заголовка
     * @param {Array} classes - набор стилевых классов CSS
     * @param {Number} colCount - число колонок в группе 
     */
    createColGroup(root, classes, colCount ) {
        let colGroup = document.createElement("colgroup");
        classes.forEach( item => colGroup.classList.add(item) );
        colGroup.span = colCount;
        root.append(colGroup);
        return colGroup;
    }

    /**
     * Установка ширины колонки таблицы
     * @param {String} colName - имя колонки
     * @param {Number} width - значение ширины колонки таблицы
     */
    setColWidth(colName, width) {
        this.#colMap.get(colName).setAttribute("width", width);
    }

    /**
     * Получшение ширины колонки таблицы
     * @param {String} colName - имя колонки таблицы
     */
    getColWidth(colName) {
        return Number(this.#colMap.get(colName).getAttribute("width"));
    }

    /**
     * Получение ширины колонки по умолчанию
     * @param {String} colName - имя колонки
     */
    getDefaultColWidth(colName) {
        let colIndex = this.#colMap.get(colName).getAttribute("index");
        return this.#colWidthArray[colIndex];
    }

    /**
     * Получение высовый строки по умолчанию
     * @param {String} rowName - имя строки
     */
    getDefaultRowHeight(rowName) {
        let row = document.querySelector("tr.row-data[row='"+rowName+"']");
        return row ? Number.parseFloat(getComputedStyle(row).height) : 20;
    }    

    /**
     * Возвращает параметры таблицы
     */
    get tableParams() {
        return this.#params;
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
     * Получение объекта курсора 
     */
    get cursor() {
        return this.#cursor;
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    getCell(cellName) {
        return this.#tableData.getCell(cellName);
    }

    /**
     * Получение данных ячейки
     * @param {String} cellName - имя ячейки
     */
    getCellData(cellName) {
        return this.#tableData.getCellData(cellName);
    }

    /**
     * Установка крайней левой верхней видимой ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    setStartCell(cellName, isSaveIDB=true) {
        this.setAttribute("start-cell", cellName);
        // if (isSaveIDB) this.#tableData.startCellName = cellName;
    }

    /**
     * Получение объекта крайней левой верхней видимой ячейки таблицы
     */
    getStartCell() {
        return this.#tableData.getCell(this.getAttribute("start-cell"));
    }

    /**
     * Установка крайней левой верхней видимой ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    setCursorCell(cellName, isSaveIDB=true) {
        this.setAttribute("cursor-cell", cellName);
        // if (isSaveIDB) this.#tableData.startCellName = cellName;
    }

    /**
     * Получение объекта крайней левой верхней видимой ячейки таблицы
     */
    getCursorCell() {
        return this.#tableData.getCell(this.getAttribute("cursor-cell"));
    }

    /**
     * Установление курсора в позицию ячейки с именем cellName
     * @param {String} cellName имя ячейки в формате А1
     */
    setCursor(cellName, isSaveIDB=true) {
        // запомнить текущее положение курсора
        let oldCell;
        if  ( this.cursor.cell ) oldCell = this.cursor.cell;

        // установить новое положение курсора
        let newCell = this.getCell(cellName);
        this.cursor.cell = newCell;
        // if (isSaveIDB) this.#tableData.cursorCellName = cellName;

        // установка классов для выделения курсора на заголовках строк и колонок
        this.selectCursor(oldCell, newCell);
        this.setCursorCell(cellName);
        // this.setAttribute("cursor-cell", this.cursor.cell.data.name);

        // обновить ячейку со старым положением курсора
        if ( oldCell && ( oldCell !== newCell) ) oldCell.refresh();
        this.updateStartCell(oldCell, newCell);
        this.cursor.focus();
    }

    /**
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {Number} rowCount - количество строк смещения 
     * @param {Number} colCount - количество колонок смещения
     * @param {String} cellName - имя ячейки, относительно которой производится перемещение курсора
     */
    moveCursor(rowCount, colCount, initCellName) {
        let currentCell = initCellName ? this.getCell(initCellName) : this.cursor.cell;
        let newColNum = currentCell.data.colNumber;
        let newRow = currentCell.data.rowNumber;

        if ( rowCount > 0 ) newRow += Math.min(rowCount, this.#params.rowCount-newRow);
        else newRow += Math.max(rowCount, 1-newRow);
        if ( colCount > 0 ) newColNum += Math.min(colCount, this.#params.colCount-newColNum);
        else newColNum += Math.max(colCount, 1-newColNum);

        this.setCursor(CellData.getCellName(newRow, newColNum));
    }

    /**
     * Выделение положения курсора на панели заголовков строк и колонок
     * @param {Object} oldCell - объект ячейки, где находился курсор
     * @param {Object} newCell - объект ячейки, куда перемещается курсор
     */
    selectCursor(oldCell, newCell) {
        if (oldCell) {
            let oldRowName = oldCell.data.rowName;
            let oldColName = oldCell.data.colName;
            let oldHeaderRow = document.querySelector("th.cell-header[row='"+oldRowName+"']");
            let oldHeaderCol = document.querySelector("th.cell-header[col='"+oldColName+"']");
            oldHeaderCol.classList.remove("cursor-col");
            oldHeaderRow.classList.remove("cursor-row");
        }
        let newRowName = newCell.data.rowName;
        let newColName = newCell.data.colName;
        let newHeaderRow = document.querySelector("th.cell-header[row='"+newRowName+"']");
        let newHeaderCol = document.querySelector("th.cell-header[col='"+newColName+"']");
        newHeaderCol.classList.add("cursor-col");    
        newHeaderRow.classList.add("cursor-row");    
    }

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
     * Обновление видимых на экране колонок при перемещении курсора
     * @param {Object} oldCell - объект ячейки, в которой расположен курсор
     * @param {Object} newCell - новая ячейка, в которую перемещается курсор
     */
    updateStartCell(oldCell, newCell) {
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

        // console.log("updateStartCell: set course - "+course);
        let offsetX = this.getOffsetX(startCell.name, this.getVisibleCellsWidth(), colCourse);
        let endColNum = startCell.colNumber + offsetX.cols - 1;

        let offsetY = this.getOffsetY(startCell.name, this.getVisibleCellsHeight(), rowCourse);
        let endRowNum = startCell.rowNumber + offsetY.rows - 2;
        // console.log("startCell.rowNumber: "+startCell.rowNumber+",  fullVisibleRows.count: "+fullVisibleRows.count);

        let newStartCol = startColNum;
        let newStartRow = startRowNum;
        
        if ( colCourse == Course.RIGHT && newColNum > endColNum ) {
            let delta = ( newColNum == this.#params.colCount ) ? 1 : 0;
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

        console.log("R"+startRowNum+":C"+startColNum+" -> R"+newStartRow+":C"+newStartCol);
        this.setStartCell(CellData.getCellName(newStartRow, newStartCol));
    }    

    /**
     * Определение видимых на экране строк таблицы
     * @param {String} startCellName 
     * @param {String} course - одной из значений атрибута объекта Course - BOTTOM или TOP
     */
    getVisibleRows(startCellName, course) {
        let visibleRows = this.#params.rowCount;
        let visibleHeight = this.getVisibleCellsHeight();
        // this.setDefaultRowHeight();
        let offsetY = this.getOffsetY(startCellName, visibleHeight, course);
        let bottomRowHeight = visibleHeight - offsetY.height;

        if (bottomRowHeight > 0) {
            visibleRows = offsetY.rows + 1;
            // this.setBottomRowHeight(visibleCols, startCellName, bottomRowHeight);
        }
        else {
            visibleRows = offsetY.rows;
        }
        return visibleRows;
    }

    /**
     * Определение видимых на экране колонок таблицы
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {String} course - одной из значений атрибута объекта Course - LEFT или RIGHT
     */
    getVisibleCols(startCellName, course) {
        let visibleCols = this.#params.colCount;
        let visibleWidth = this.getVisibleCellsWidth();
        this.setDefaultColWidth();
        let offsetX = this.getOffsetX(startCellName, visibleWidth, course);
        let rightColWidth = visibleWidth - offsetX.width;

        if (rightColWidth > 0) {
            visibleCols = offsetX.cols + 1;
            this.setRightColWidth(visibleCols, startCellName, rightColWidth);
        }
        else {
            visibleCols = offsetX.cols;
        }
        return visibleCols;
    }

    /**
     * Установка ширины крайней правой видимой колонки
     * @param {Number} visibleCols - имя крайней правой видимой колонк
     * @param {String} startCellName - имя крайней верхней видимой ячейки
     * @param {Number} rightColWidth - новая ширина крайней правой колонки
     */
    setRightColWidth(visibleCols, startCellName, rightColWidth) {
        let rightColIndex = visibleCols - 1;
        let startCell = this.#tableData.getCellData(startCellName);
        let rightColName = CellData.getColName(startCell.rowNumber + rightColIndex);
        let rightCol = this.#colMap.get(rightColName);
        if (rightCol) rightCol.setAttribute("width", rightColWidth);
    }

    /**
     * Получение видимой высоты ячеек данных таблицы
     */
    getVisibleCellsHeight() {
        let headHeight = parseFloat(getComputedStyle(document.querySelector(".table-head")).height);
        return parseInt(this.getAttribute("view-height")) - headHeight;
        // return parseFloat(getComputedStyle(document.querySelector("div.flex-row")).height); 
    }

    /**
     * Получение видимой ширины ячеек данных таблицы
     */
    getVisibleCellsWidth() {
        let headerWidth = parseFloat(document.querySelector(".col-header>col").getAttribute("width"));
        return parseInt(this.getAttribute("view-width")) - headerWidth;
    }

    /**
     * Получение объекта смещения для определения высоты видимой области и пикселях и количесте строк
     * @param {String} startCellName стартовая ячейка (самая верхняя или самая нижняя в видимой области ячеек)
     * @param {Number} visibleCellsHeight - видимая вытота ячеек данных таблицы
     * @param {String} course - одной из значений атрибута объекта Course
     */
    getOffsetY(startCellName, visibleCellsHeight, course) {
        let startCell = this.#tableData.getCellData(startCellName);
        let startRowNum = startCell.rowNumber;
        let startRowName = startCell.rowName;
        let rowHeight = 0;
        let rowCount = 0;

        if ( course == Course.BOTTOM ) {
            let bottomRowCount = this.#params.rowCount - startRowNum;
            for (rowCount = 0; rowCount < bottomRowCount; rowCount++) {
                let newRowName = this.getRowName(startRowName, rowCount);
                let newRowHeight = this.getDefaultRowHeight(newRowName);
                if ( (rowHeight + newRowHeight ) > visibleCellsHeight ) break;
                rowHeight += newRowHeight;
            }
        }
        else if ( course == Course.TOP ) {
            for (rowCount = startRowNum; rowCount>0; rowCount--) {
                let newRowName = this.getRowName(startRowNum, 1-rowCount);
                let newRowHeight = this.getDefaultRowHeight(newRowName);
                if ( ( rowHeight + newRowHeight ) > visibleCellsHeight ) break;
                rowHeight += newRowHeight;
            }
        }
        return {
            rows: rowCount, 
            height: rowHeight 
        };
    }

    /**
     * Получение объекта полностью видимых колонок в виде:
     * {
     *    count: [число полностью видимых колонок]
     *    width: [общая ширина полностью видимых колонок]
     * }
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {Number} visibleWidth - ширина видимых ячеее данных таблицы
     * @param {Object} course - направление отчета видимых колонок: Course.LEFT или Course.RIGHT
     */
    getOffsetX(startCellName, visibleWidth, course) {
        let startCell = this.#tableData.getCellData(startCellName);
        let startColNum = startCell.colNumber;
        let startColName = startCell.colName;
        let colWidth = 0;
        let colCount = 0;

        if ( course == Course.RIGHT ) {
            let rightColCount = this.#params.colCount - startColNum;
            for (colCount = 0; colCount < rightColCount; colCount++) {
                let newColName = this.getColName(startColName, colCount);
                let newColWidth = this.getDefaultColWidth(newColName);
                if ( (colWidth + newColWidth ) > visibleWidth ) break;
                colWidth += newColWidth;
            }
        }
        else if ( course == Course.LEFT ) {
            for (colCount = startColNum; colCount>0; colCount--) {
                let newColName = this.getColName(startColName, 1-colCount);
                let newColWidth = this.getDefaultColWidth(newColName);
                if ( ( colWidth + newColWidth ) > visibleWidth ) break;
                colWidth += newColWidth;
            }
        }
        return {
            cols: colCount, 
            width: colWidth 
        };
    }

    
    /**
     * Получение имени строки, расположенной на deltaRowCount строк ниже или выше строки initRowName
     * @param {String} initRowName - имя строки, от которой ведется поиск
     * @param {Number} deltaRowCount - смещение от начальнок строки, может быть со знаком "+" или "-"
     */
    getRowName(initRowName, deltaRowCount) {
        return Number(initRowName)+deltaRowCount;
    }

    /**
     * Получение имени колонки, расположенной на deltaColCount строк правее или левее колонки initColName
     * @param {String} initColName - имя колонки, от которой ведется поиск
     * @param {Number} deltaColCount - смещение от начальнок колонки, может быть со знаком "+" или "-"
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
        let currentCell = this.cursor.cell.data;
        switch(event.key) {
            case "ArrowUp" : 
                if ( this.cursor.isEdit ) this.cursor.endEditing();
            // переход на первую строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    rowCount = 1 - currentCell.rowNumber;
                else rowCount -= 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "ArrowDown" :
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                // переход на последнюю строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    rowCount = this.#params.rowCount - currentCell.rowNumber;
                else rowCount += 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "ArrowLeft" :
                // переход на первую колонку при нажатой клавише Ctrl
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                if ( event.ctrlKey )
                    colCount = 1 - currentCell.colNumber;
                // переход в конец верхней строки при нахождении курсора в первой ачейке строки
                else if ( currentCell.colNumber == 1 ) {
                    colCount += this.#params.colCount;
                    rowCount -= 1;
                }
                else colCount -= 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "ArrowRight" :
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    colCount = this.#params.colCount - currentCell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( currentCell.colNumber == this.#params.colCount ) {
                    colCount -= this.#params.colCount;
                    rowCount += 1;
                }
                else colCount += 1;
                this.moveCursor(rowCount, colCount);
                break;
            case "Home" :
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                // переход на первую колонку 
                colCount = 1 - currentCell.colNumber;
                if ( event.ctrlKey ) rowCount = 1 - currentCell.rowNumber;
                this.moveCursor(rowCount, colCount);
                break;
            case "End" :
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                // переход на последнюю колонку
                colCount = this.#params.colCount - currentCell.colNumber;
                if ( event.ctrlKey ) rowCount = this.#params.rowCount - currentCell.rowNumber;
                this.moveCursor(rowCount, colCount);
                break;
            case "Tab" :
                if ( this.cursor.isEdit ) this.cursor.endEditing();
                colCount += 1;
                this.moveCursor(rowCount, colCount);                
                event.preventDefault();
                break;
            }
        }

    /**
     * Обработка событий нажатия клавиш включения/отключения режима редактирования ячейки
     * @param {KeyEvent} event 
     */
    handlerKeyEditing(keyEvent) {
        let currentCellName = this.cursor.cell.data.name;
        switch(keyEvent.key) {
            case "F2" : 
                this.cursor.beginEditing();
                break;
            case "F4" : 
                // console.log(this.#editor);
                this.#editor.focus();
                break;
            case "Escape" : 
                this.cursor.escapeEditing();
                this.setCursor(currentCellName);
                break;
            case "Enter" : 
                if ( this.cursor.isEdit ) {
                    this.cursor.endEditing();
                    this.moveCursor(1, 0, currentCellName);
                }
                break;
            case "Delete" :
                this.cursor.clearValue();
                this.setCursor(currentCellName);
                break;
            case "Backspace" :
                if ( this.cursor.isEdit ) {
                    this.cursor.removeLastKey();
                }
                break;
            default: 
                if ( this.cursor.isPrintKey(keyEvent.keyCode) && !keyEvent.ctrlKey ) {
                    if ( !this.cursor.isEdit ) this.cursor.beginInput();
                    this.cursor.addKey(keyEvent);
                }
                break;
        }
    }

    /**
     * Обработка сочетаний клавиш
     * @param {KeyEvent} keyEvent - событие нажатия клавиш
     */
    handlerKeyEvent(keyEvent) {
        switch(keyEvent.keyCode) {
            case 90 : // Z
                if ( event.ctrlKey ) {
                    if (this.#tableData.hasBuffer()) {
                        let oldCell = this.#tableData.popBuffer();
                        let oldCellName = Object.keys(oldCell)[0];
                        let oldCellValue = Object.values(oldCell)[0];
                        this.#tableData.getCell(oldCellName).data.value = oldCellValue;
                        this.setCursor(oldCellName);
                    } 
                }
                break;
        }
    }

    /**
     * Снятие редактирования при щелчке мыши по таблице
     * @param {MouseEvent} event 
     */
    handlerClickCell(event) {
        if ( this.cursor.isEdit ) {
            this.cursor.endEditing();
        }
    }

}

// регистрация нового html-элемента
customElements.define('calc-table', Table, {extends: 'table'});
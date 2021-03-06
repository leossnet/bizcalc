const Course = {
    LFFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    STOP: "stop"
};

const DEFAULT_COL_WIDTH = 80;   // ширина колонки по умолчанию в пикселях
const MAX_COLUMN_COUNT = 676;   // 26*26, где 26 - число букв в латинском алфавите

const PRINT_KEY_CODES = new Set ([
    48,49,50,51,52,53,54,55,56,57, // цифры основной клавиатуры
    65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,  // латинские буквы
    96,97,98,99,100,101,102,103,104,105, // цифры цифрового блока
    106,107,109,110,111, // прочие символы цифрового блока
    186,187,188,189,190,191,192, // прочие символы и русские буквы
    219,220,221,222, // прочие символы и русские буквы
    32 // пробел
]);

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
    #isCacheCursor;
    #isCacheStart;

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

        // генерация данных ячеек
        this.generateTableData();
        this.#cursor = new Cursor(app, this);
        this.classList.add("table");
        this.tabIndex = -1;

        // обработчики событий
        this.addEventListener("keydown", this.handlerKeyMoving);
        this.addEventListener("keydown", this.handlerKeyEditing);
        this.addEventListener("keydown", this.handlerKeyEvent);
        this.addEventListener("click", this.handlerClickCell);
        
        window.addEventListener("load", () => this.#tableData.asyncRefreshData() );
        window.addEventListener("resize", () => { 
            this.updateViewSize();
        });
    }

    /**
     * Функция обновления размера компонента, вызываемая компоновщиком при добавлении нового компонента
     */
    updateViewSize() {
        this.setAttribute("view-width", getComputedStyle(this.parentElement).width);
        let headerHeight = this.parentElement.getAttribute("header-height");
        let footerHeight = this.parentElement.getAttribute("footer-height");
        this.setAttribute("view-height", document.documentElement.clientHeight - headerHeight - footerHeight); 
        console.log( document.documentElement.clientHeight+", "+headerHeight+", "+footerHeight);

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

        this.#isCacheCursor = false;
        this.#isCacheStart = false;
        this.setStartCell("A1", false);
        this.setCursor("A1", false);

        if ( this.#params.isFocus ) this.focus();
        this.updateViewSize();
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
    async attributeChangedCallback(name, oldValue, newValue) {
        if ( ( name == "view-width" || name == "view-height" ) && oldValue != newValue ) {
            this.updateVisibleCells();
        }
        else if ( name == "start-cell" && oldValue != newValue ) {
            this.updateVisibleCells();
        }
        else if ( name == "cursor-cell" ) {
            if ( !this.#isCacheCursor ) {
                await this.#tableData.asyncRefreshCursorCell();
                this.#isCacheCursor = true;
            }
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
            col.classList.add("col-param");

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
        let row = tBody.insertRow(-1);
        row.classList.add("row-empty");

        this.append(tBody);
    }

    /**
     * Генерация данных таблицы
     */
    generateTableData() {
        for (let i = 1; i < this.#params.rowCount + 1; i++) {
            for (let j = 1; j <= this.#params.colCount; j++) {
                let letter = CellData.getColName(j);
                let cellData = new CellData(this.#tableData, i, letter);
                this.#tableData.setCellData(letter + i, cellData);
            }
        }
    }
    
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
     * Получить левую ячейку относительно текущей
     * @param {Cell} currentCell - текущая ячейка 
     */
    getLeftCell(currentCell) {
        let rowNum = currentCell.data.rowNumber;
        let colNum = currentCell.data.colNumber;
        let cellName = CellData.getCellName(rowNum, Math.max(1, colNum-1));
        // console.log("getLeftCell: "+cellName+", rowNum: "+rowNum+", colNum: "+colNum);
        let cell = this.#tableData.getCell(cellName);
        return cell;
    }

    /**
     * Получить верхнюю ячейку относительно текущей
     * @param {Cell} currentCell - текущая ячейка
     */
    getTopCell(currentCell) {
        let rowNum = currentCell.data.rowNumber;
        let colNum = currentCell.data.colNumber;
        let cellName = CellData.getCellName(Math.max(1, rowNum-1), colNum);
        // console.log("getTopCell: "+cellName+", rowNum: "+rowNum+", colNum: "+colNum);
        let cell = this.#tableData.getCell(cellName);
        return cell;
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
    async setStartCell(cellName) {
        this.setAttribute("start-cell", cellName);
    }

    /**
     * Получение объекта крайней левой верхней видимой ячейки таблицы
     */
    getStartCell() {
        return this.#tableData.getCell(this.getAttribute("start-cell"));
    }

    /**
     * Установка ячейки расположения курсора
     * @param {String} cellName имя ячейки в формате А1
     */
    async setCursorCell(cellName) {
        this.setAttribute("cursor-cell", cellName);
        this.#cursor.setAttribute("cell", cellName);
        if ( this.#isCacheCursor ) {
            await this.#tableData.asyncSetCursorCellName(cellName);
            // this.#isCacheCursor = true;
        } 
    }

    /**
     * Получение объекта ячейки расположения курсора
     */
    getCursorCell() {
        return this.#tableData.getCell(this.getAttribute("cursor-cell"));
    }


    /**
     * Выделение положения курсора на панели заголовков строк и колонок
     * @param {Object} oldCell - объект ячейки, где находился курсор
     * @param {Object} endCell - объект ячейки, куда перемещается курсор
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
     * Перемещение курсора со сдвигом на количество строк и колонок относительно текущей позиции
     * @param {Number} rowCount - количество строк смещения 
     * @param {Number} colCount - количество колонок смещения
     * @param {String} cellName - имя ячейки, относительно которой производится перемещение курсора
     */
    moveCursor(rowCount, colCount, initCellName) {
        let currentCell = initCellName ? this.getCell(initCellName) : this.cursor.cell;
        let newColNum = currentCell.data.colNumber;
        let newRowNum = currentCell.data.rowNumber;

        if ( colCount > 0 ) newColNum += Math.min(colCount, this.#params.colCount-newColNum);
        else newColNum += Math.max(colCount, 1-newColNum);

        if ( rowCount > 0 ) newRowNum += Math.min(rowCount, this.#params.rowCount-newRowNum);
        else newRowNum += Math.max(rowCount, 1-newRowNum);

        this.setCursor(CellData.getCellName(newRowNum, newColNum));
    }

    /**
     * Установление курсора в позицию ячейки с именем cellName
     * @param {String} cellName имя ячейки в формате А1
     */
    setCursor(cellName) {
        // запомнить текущее положение курсора
        let beginCell;
        if  ( this.cursor.cell ) beginCell = this.cursor.cell;

        // установить новое положение курсора
        let endCell = this.getCell(cellName);
        this.cursor.cell = endCell;

        // установка классов для выделения курсора на заголовках строк и колонок
        this.selectCursor(beginCell, endCell);
        this.setCursorCell(cellName);

        // обновить ячейку со старым положением курсора
        if ( beginCell && ( beginCell.name !== endCell.name ) ) {
            beginCell.refresh();
        }
        this.updateStartCell(beginCell, endCell);
        this.cursor.cell.focus();
    }


    /**
     * Обновление видимых на экране ячеек при перемещении курсора
     * @param {Object} beginCell - объект ячейки, в которой расположен курсор
     * @param {Object} endCell - новая ячейка, в которую перемещается курсор
     */
    updateStartCell(beginCell, endCell) {
        let startCell = this.getStartCell().data;
        // console.log(startCell);

        // определение стартовой, исходной и конечной колонок
        let oldColNum = beginCell ? beginCell.data.colNumber : startCell.colNumber;
        let newColNum = endCell.data.colNumber;
        let startColNum = startCell.colNumber;

        // направление перемещения курсора по горизонтали
        let colCourse = (newColNum > oldColNum) ? Course.RIGHT : ( (newColNum < oldColNum) ? Course.LEFT : Course.STOP );
        
        // число, ширина и код последней полностью видимой колонки
        let fullVisibleCols = this.getFullVisibleCols(startCell.name, this.getDataWidth(), colCourse);

        // конечная колонка курсора
        let endColNum = startCell.colNumber + fullVisibleCols.cols - 1;

        // начальная видимая колонка
        let newStartCol = startColNum;
        
        // console.log("newColNum: "+newColNum+", startColNum: "+startColNum+", newStartCol: "+newStartCol+", endColNum: "+endColNum);

        // если при движении курсора вправо новая колонка выходит за крайнюю правую видимую колонку, 
        // то стартовая колонока увеличивается на разницу между новой колонкой и видимой крайней правой
        if ( colCourse == Course.RIGHT && newColNum > endColNum+1 ) {
            newStartCol = startColNum + newColNum - endColNum;
        }
        // если при движении курсора влево новая колонка выходит за крайнюю левую видимую колонку,
        // то новая колонка становится новой стартовой колонкой
        else if ( colCourse == Course.LEFT && newColNum < startColNum ) {
            newStartCol = newColNum;
        }
        // console.log("newColNum: "+newColNum+", startColNum: "+startColNum+", newStartCol: "+newStartCol+", endColNum: "+endColNum);

        // определение новой стартовой строки
        let oldRowNum = beginCell ? beginCell.data.rowNumber : startCell.rowNumber;
        let newRowNum = endCell.data.rowNumber ;
        let startRowNum = startCell.rowNumber;
        
        // определние направления движения курсора
        let rowCourse = (newRowNum > oldRowNum) ? Course.BOTTOM : ( (newRowNum < oldRowNum) ? Course.TOP : Course.STOP );
        
        // определение количества полностью видимых строк
        let fullVisibleRows = this.getFullVisibleRows(startCell.name, this.getDataHeight(), rowCourse);
        
        // конечная строка курсора
        let endRowNum = startCell.rowNumber + fullVisibleRows.rows - 1; 
        
        // начальная видимая строка
        let newStartRow = startRowNum;

        // console.log("newStartRow: "+newStartRow+", startRowNum: "+startRowNum+", newRowNum: "+newRowNum+", endRowNum: "+endRowNum);

        // если курсор двигается вниз и новое положение курсора больше номера строки,
        // то стартовая строка увеличивается на разницу между новой строкой и видимой крайней нижней
        if ( rowCourse == Course.BOTTOM && newRowNum > endRowNum ) {
            newStartRow = startRowNum + newRowNum - endRowNum;
        }
        // при движении курсора ввех и при если новая строка становится меньше самой вехней видимой,
        // то новая строка становится новой стартовой строкой
        else if ( rowCourse == Course.TOP && newRowNum < startRowNum ) {
            newStartRow = newRowNum;
        }
        // console.log("newStartRow: "+newStartRow+", startRowNum: "+startRowNum+", newRowNum: "+newRowNum+", endRowNum: "+endRowNum);

        // установить новую стартовую ячейку, при изменени которой срабатывает attributeChangedCallback,
        // вызывающий updateVisibleCells
        this.setStartCell(CellData.getCellName(newStartRow, newStartCol));
    }    

    /**
     * Обновление ячеек видимой части таблицы при обновлении атрибута таблицы start-cell
     * @see attributeChangedCallback - обработчик изменения значений наблюдаемых атрибутов таблицы 
     */
    updateVisibleCells() {
        let startCell = this.getStartCell().data;

        // обновление числа видимых строк и колонок
        let colCount = this.updateVisibleCols(startCell.name, Course.RIGHT);
        let rowCount = this.updateVisibleRows(startCell.name, Course.BOTTOM);

        let beginRow = startCell.rowNumber-1;   // номер начальной видимой строки
        let beginCol = startCell.colNumber;     // номер начальной видимой колонки
        let endRow = beginRow+rowCount+1;         // номер конечной видимой строки
        let endCol = beginCol+colCount+1;         // номер конечной видимой колонки

        let cssText = ""
            + ".row-data[row]:nth-child(-n+" + beginRow + ")," // строки до начальной строки
            + ".row-data[row]:nth-child(n+" + endRow + ")" // строки после конечной строки
            + "{display: none;}"
            + ".cell-header[col]:nth-child(-n+" + beginCol + ")," // колонки заголовков до начальной колонки
            + ".cell-data[col]:nth-child(-n+" + beginCol + ")," // колонки данных до начальной колонки
            + ".col-param[width]:nth-child(-n+" + (beginCol-1) + ")," // колонки данных до начальной колонки
            + ".cell-header[col]:nth-child(n+" + endCol + ")," // колонки заголовков после конечной колонки
            + ".cell-data[col]:nth-child(n+" + endCol + ")" + // колонки данных после конечной колонки
            "{display: none;}";
        this.#tableStyle.innerHTML = cssText;
    }


    /**
     * Определение видимых на экране колонок таблицы
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {String} course - одной из значений атрибута объекта Course - LEFT или RIGHT
     */
    updateVisibleCols(startCellName, course) {
        // установка ширины колонок значениями по умолчанию из массива colWidthArray
        this.setDefaultColWidth();

        let visibleCols = this.#params.colCount;
        let visibleWidth = this.getDataWidth();

        // определение числа и общей ширины полностью видимых колонок начиная со стартовой ячейки
        let fullVisibleCols = this.getFullVisibleCols(startCellName, visibleWidth, course);

        // определение ширины крайней правой колонки
        let rightColName = CellData.getColName(fullVisibleCols.lastNum + 1);
        let rightColWidth = Math.min( visibleWidth - fullVisibleCols.width, this.getColWidth(rightColName));

        // если ширина крайней правой колонки больше 0
        if (rightColWidth > 0) {
            visibleCols = fullVisibleCols.cols + 1;
            this.setRightColWidth(rightColName, rightColWidth);
        }
        else {
            visibleCols = fullVisibleCols.cols;
        }
        return visibleCols;
    }


    /**
     * Определение видимых на экране строк таблицы
     * @param {String} startCellName 
     * @param {String} course - одной из значений атрибута объекта Course - BOTTOM или TOP
     */
    updateVisibleRows(startCellName, course) {
        let visibleRows = this.#params.rowCount;
        let visibleHeight = this.getDataHeight();

        let fullVisibleRows = this.getFullVisibleRows(startCellName, visibleHeight, course);

        // console.log(fullVisibleRows);
        let bottomRowHeight = visibleHeight - fullVisibleRows.height;

        if (bottomRowHeight > 0) {
            visibleRows = fullVisibleRows.rows + 1;
        }
        else {
            visibleRows = fullVisibleRows.rows;
        }
        return visibleRows;
    }

    /**
     * Установка ширины колонок по умолчанию, определенных в атрибуте widht элемента col
     */
    setDefaultColWidth() {
        for (let colName of this.#colMap.keys() ) {
            let col = this.#colMap.get(colName);
            let width = this.#colWidthArray[col.getAttribute("index")];
            col.setAttribute("width", width);
        }
    }


    /**
     * Получение видимой ширины ячеек данных таблицы
     */
    getDataWidth() {
        // ширина колонки с номерами строк
        let headerWidth = parseFloat(document.querySelector(".col-header>col").getAttribute("width"));
        // разница между видимой шириной экрана и шириной колонки с номерами строк
        let dataWidth = parseInt(this.getAttribute("view-width")) - headerWidth;
        return dataWidth;
    }

    /**
     * Получение видимой высоты ячеек данных таблицы
     */
    getDataHeight() {
        let headHeight = parseFloat(getComputedStyle(document.querySelector(".table-head")).height);
        return parseInt(this.getAttribute("view-height")) - headHeight;
        // return parseFloat(getComputedStyle(document.querySelector("div.flex-row")).height); 
    }

    /**
     * Получение объекта полностью видимых колонок в виде:
     * {
     *    count: [число полностью видимых колонок]
     *    width: [общая ширина полностью видимых колонок]
     * }
     * @param {String} startCellName - колонка, от которой ведется отчет видимости
     * @param {Number} visibleWidth - ширина видимых ячееек таблицы
     * @param {Object} course - направление отчета видимых колонок: Course.LEFT или Course.RIGHT
     */
    getFullVisibleCols(startCellName, visibleWidth, course) {
        let startCell = this.#tableData.getCellData(startCellName);
        let startColNum = startCell.colNumber; // номер колонки начиная с 1
        let startColName = startCell.colName;
        let totalColWidth = 0;
        let totalColCount = 0;

        if ( course == Course.RIGHT ) {
            // количестов колонок справа от стартовой
            let rightColCount = this.#params.colCount - startColNum ;

            for (let deltaCol = 0; deltaCol < rightColCount; deltaCol++) {
                let colName = this.getColName(startColName, deltaCol);
                let colWidth = this.getDefaultColWidth(colName);

                if ( (totalColWidth + colWidth ) > visibleWidth ) break;
                totalColWidth += colWidth;
                totalColCount++;
            }
        }
        else if ( course == Course.LEFT ) {
            for (let deltaCol = startColNum; deltaCol>0; deltaCol--) {
                let colName = this.getColName(startColName, 1-deltaCol);
                let colWidth = this.getDefaultColWidth(colName);
                if ( ( totalColWidth + colWidth ) > visibleWidth ) break;
                totalColWidth += colWidth;
                totalColCount++;
            }
        }
        return {
            cols: totalColCount, 
            width: totalColWidth,
            lastNum: startColNum + totalColCount-1
        };
    }

    /**
     * Получение объекта смещения для определения высоты видимой области и пикселях и количесте строк
     * @param {String} startCellName стартовая ячейка (самая верхняя или самая нижняя в видимой области ячеек)
     * @param {Number} visibleHeight - видимая вытота ячеек данных таблицы
     * @param {String} course - одной из значений атрибута объекта Course
     */
    getFullVisibleRows(startCellName, visibleHeight, course) {
        let startCell = this.#tableData.getCellData(startCellName);
        let startRowNum = startCell.rowNumber;
        let startRowName = startCell.rowName;
        let totalRowHeight = 0;
        let totalRowCount = 0;

        if ( course == Course.BOTTOM ) {
            let bottomRowCount = this.#params.rowCount - startRowNum;

            for (let deltaRow = 0; deltaRow < bottomRowCount; deltaRow++) {
                let rowName = this.getRowName(startRowName, deltaRow);
                let rowHeight = this.getDefaultRowHeight(rowName);

                if ( (totalRowHeight + rowHeight ) > visibleHeight ) break;
                totalRowHeight += rowHeight;
                totalRowCount++;
            }
        }
        else if ( course == Course.TOP ) {
            for (let deltaRow = startRowNum; deltaRow>0; deltaRow--) {
                let rowName = this.getRowName(startRowNum, 1-deltaRow);
                let rowHeight = this.getDefaultRowHeight(rowName);

                if ( ( totalRowHeight + rowHeight ) > visibleHeight ) break;
                totalRowHeight += rowHeight;
                totalRowCount++;
            }
        }
        return {
            rows: totalRowCount, 
            height: totalRowHeight,
            lastNum: startRowNum + totalRowCount-1
        };
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
     * Установка ширины крайней правой видимой колонки
     * @param {Number} visibleCols - имя крайней правой видимой колонк
     * @param {String} startCellName - имя крайней верхней видимой ячейки
     * @param {Number} rightColWidth - новая ширина крайней правой колонки
     */
    setRightColWidth(rightColName, rightColWidth) {
        let rightCol = this.#colMap.get(rightColName);
        if (rightCol) rightCol.setAttribute("width", rightColWidth);
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
     * Получение имени строки, расположенной на deltaRowCount строк ниже или выше строки initRowName
     * @param {String} initRowName - имя строки, от которой ведется поиск
     * @param {Number} deltaRowCount - смещение от начальнок строки, может быть со знаком "+" или "-"
     */
    getRowName(initRowName, deltaRowCount) {
        return Number(initRowName)+deltaRowCount;
    }

    /**
     * Проверка на вхождение кода символа в перечень печатаемых символов
     * @param {Number} keyCode 
     */
    static isPrintKey(keyCode) {
        return PRINT_KEY_CODES.has(keyCode);
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
                if ( event.ctrlKey )
                    colCount = 1 - currentCell.colNumber;
                else colCount -= 1;
                if ( !this.cursor.isEdit) this.moveCursor(rowCount, colCount);
                break;
            case "ArrowRight" :
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    colCount = this.#params.colCount - currentCell.colNumber;
                else colCount += 1;
                if ( !this.cursor.isEdit) this.moveCursor(rowCount, colCount);
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
                if ( !this.cursor.isEdit ) {
                    this.cursor.clearValue();
                    this.setCursor(currentCellName);
                }
                break;
            default: 
                if ( Table.isPrintKey(keyEvent.keyCode) && !keyEvent.ctrlKey ) {
                    if ( !this.cursor.isEdit ) {
                        this.cursor.beginInput();
                    }
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
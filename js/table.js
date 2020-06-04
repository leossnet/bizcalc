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
        this.calculator = new Calculator(this.cells);
        this.#cursor = new Cursor(this);
        this.tabIndex = 1;
        this.focus();
    
        // генерация html-таблицы
        for (let i=0; i<params.rowCount+1; i++) {
            let row = this.insertRow(-1);
            for (let j=0; j<params.colCount+1; j++) {
                let letter = String.fromCharCode("A".charCodeAt(0)+j-1);
                if ( i&&j ) {
                    let cell = new Cell( this, i, letter, this.editor, this.calculator );
                    cell.value = 0;
                    this.cells.set(letter+i, cell);
                    row.insertCell(-1).append(this.cells.get(letter+i));
                }
                else row.insertCell(-1).innerHTML = i||letter;
            }
        }

        this.addEventListener("keydown", this.handlerKey);
        this.addEventListener("keydown", this.handlerKeyF2);
        this.addEventListener("focus", this.handlerFocus);
        this.setCursor("A1");
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName имя ячейки в формате А1
     */
    getCell(cellName) {
        return this.cells.get(cellName);
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
    moveCursor(deltaRow, deltaCol) {
        let currentCell = this.#cursor.cell;
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
    handlerKey(event) {
        let deltaRow=0, deltaCol=0;
        switch(event.key) {
            case "ArrowUp" : 
                // переход на первую строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = 1 - this.#cursor.cell.rowNumber;
                else deltaRow -= 1;
                break;
            case "ArrowDown" :
                // переход на последнюю строку при нажатой клавише Ctrl
                if ( event.ctrlKey ) 
                    deltaRow = this.rowCount - this.#cursor.cell.rowNumber;
                else deltaRow += 1;
                break;
            case "ArrowLeft" :
                // переход на первую колонку при нажатой клавише Ctrl
                if ( event.ctrlKey )
                    deltaCol = 1 - this.#cursor.cell.colNumber;
                // переход в конец верхней строки при нахождении курсора в первой ачейке строки
                else if ( this.#cursor.cell.colNumber == 1 ) {
                    deltaCol += this.colCount;
                    deltaRow -= 1;
                }
                else deltaCol -= 1;
                break;
            case "ArrowRight" :
                // переход на последнюю колонку при нажатой клавише Ctrl
                if ( event.ctrlKey)
                    deltaCol = this.colCount - this.#cursor.cell.colNumber;
                // переход в начало нижней строки при нахождении курсора в последней ачейке строки
                else if ( this.#cursor.cell.colNumber == this.colCount ) {
                    deltaCol -= this.colCount;
                    deltaRow += 1;
                }
                else deltaCol += 1;
                break;
            case "Home" :
                // переход на первую колонку 
                deltaCol = 1 - this.#cursor.cell.colNumber;
                if ( event.ctrlKey ) deltaRow = 1 - this.#cursor.cell.rowNumber;
                break;
            case "End" :
                // переход на последнюю колонку
                deltaCol = this.colCount - this.#cursor.cell.colNumber;
                if ( event.ctrlKey ) deltaRow = this.rowCount - this.#cursor.cell.rowNumber;
                break;

            }
        this.moveCursor(deltaRow, deltaCol);
    }

    /**
     * Обработка событий нажатия клавиш включения/отключения режима редактирования ячейки
     * @param {KeyEvent} event 
     */
    handlerKeyF2(event) {
        let cellName = this.#cursor.cell.name;
        switch(event.key) {
            case "F2" : 
                this.#cursor.editor.beginEditing();
                break;
            case "Escape" : 
                this.#cursor.editor.escapeEditing();
                this.setCursor(cellName);
                break;
            case "Enter" : 
                if ( this.#cursor.editor.isEditing ) {
                    this.#cursor.editor.endEditing();
                    this.setCursor(cellName);
                }
                break;
        }
    }

    /**
     * Обработка события получения фокуса таблицей
     * @param {FocusEvent} event 
     */
    handlerFocus(event) {
        console.log(event);
    }

}

// регистрация нового html-элемента
customElements.define('b-table', Table, {extends: 'table'});
/**
 * Основной класс клиентского приложения
 */
class App {
    #table;
    /**
     * Конструктор клиентского приложения
     * @param {String} tableName наименование css-класса таблицы
     * @param {Number} rowCount число строк таблицы
     * @param {Number} colCount число колонок таблицы
     */
    constructor (tableName, rowCount, colCount){
        this.#table = new Table (tableName, {rowCount: rowCount, colCount: colCount});
        document.querySelector("."+tableName).append(this.#table);
        this.#table.focus();
    }
    
 
}


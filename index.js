/**
 * Основной класс клиентского приложения
 */
class App {

    /**
     * Конструктор клиентского приложения
     * @param {String} tableName наименование css-класса таблицы
     * @param {Number} rowCount число строк таблицы
     * @param {Number} colCount число колонок таблицы
     */
    constructor (tableName, rowCount, colCount){
        let table = new Table (tableName, {rowCount: rowCount, colCount: colCount});
        document.querySelector("."+tableName).append(table);
    }
    
}


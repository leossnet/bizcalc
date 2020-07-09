/**
 * Класс для локального постоянного хранения данных таблицы
 */
class LocalDB {
    #app;
    #db;

    constructor(app) {
        this.#app = app
        let db;

        let openRequest = indexedDB.open(app.root.id+"DB", 1);
        console.log(openRequest);

        openRequest.onsuccess = function() {
            db = openRequest.result;
            console.log(db);
        };
    }


}
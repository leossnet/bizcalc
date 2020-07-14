/**
 * Класс для локального хранения данных таблицы
 */
class LocalDB {
    #app;

    /**
     * Конструктор локальной базы данных
     * @param {Object} app - ссылка на объект приложения
     */
    constructor(app) {
        this.#app = app;
    }

    /**
     * Соединение с локальной базой данных
     * @param {Function} call - фукнция обратного вызова для работы с полученным соединением с локальной БД
     */
    connectDB(call) {
        let openRequest = indexedDB.open(this.#app.root.id+"DB", 1);

        openRequest.onsuccess = (event) => {
            call(event.target.result);
        };

        openRequest.onupgradeneeded = (event) => {
            let db = event.target.result;
            db.createObjectStore('strings'); 
            db.createObjectStore('values'); 
            db.createObjectStore('tokens'); 
            this.connectDB(call);
        };            

        openRequest.onerror = (event) => {
            console.error("Error", event.target.errorCode);
        };
    }

    /**
     * Установка нового значения ячейки в локальном хранилище
     * @param {String} storeName - имя хранилища
     * @param {Object} obj - значение ячейки
     * @param {String} key - имя ячейки
     */
    put(storeName, obj, key ) {
        this.connectDB((db) => {
            let transaction = db.transaction([storeName], "readwrite"); 
            let store = transaction.objectStore(storeName);
            let request = store.put(obj, key);
              
            request.onerror = function() {
                console.log("Ошибка", request.error);
            };        
        }); 
    }

    /**
     * Получение данных из хранилица
     * @param {String} storeName - имя хранилища
     * @param {Function} call - функция обратного вызова для обработки результатов запроса
     */
    get(storeName, call) {
        this.connectDB((db) => {
            let transaction = db.transaction([storeName], "readonly"); 
            let store = transaction.objectStore(storeName);
            let request = store.openCursor();

            request.onsuccess = function(event) {
                let cursor = request.result;
                let stringMap = new Map();
                if (cursor) {
                    let key = cursor.key;
                    let value = cursor.value;
                    stringMap.set(key, value);
                    cursor.continue();
                }
                call(stringMap);
            };
              
            request.onerror = function() {
                console.log("Ошибка", request.error);
            };        
        });         
    }

    /**
     * Очистка хранилища от данных
     * @param {String} storeName - имя хранилища
     */
    clear(storeName) {
        this.connectDB(db => {
            let transaction = db.transaction([storeName], "readwrite"); 
            let store = transaction.objectStore(storeName);      
            store.clear();
        });
    }



    /**
     * Преобразование имени файла в строку и обратно (заготовка на будущее)
     * @param {File} file 
     */
    static testBase64(file) {
        console.log(file.lastModified);
        
        let bt = btoa(encodeURIComponent(file.name+file.lastModified));
        console.log(bt);
        
        let at = decodeURIComponent(atob(bt));
        console.log(at);
        
        let ex = ".json";
        console.log("length "+ex+" = "+ex.length);
        
        let liof = at.lastIndexOf(ex);
        console.log(liof);

        let fileName = at.substring(0, liof+ex.length);
        console.log(fileName);

        let lastModified = at.substring(liof+ex.length);
        console.log(lastModified);
    }

}
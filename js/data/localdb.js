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
     * Обектка над connectDВ, возвращающая Promise
     * @returns {Promise} - промис, передающий созданный объект базы данных
     */
    connect() {
        return new Promise( (resolve, reject) => {
            this.connectDB( (error, result) => {
                if ( error ) reject(error);
                else resolve(result);
            });
        });
    }
    
    /**
     * Соединение с локальной базой данных
     * @param {Function} call - фукнция обратного вызова для работы с полученным соединением с локальной БД
     */
    connectDB(callback) {
        let openRequest = indexedDB.open(this.#app.root.id+"DB", 1);

        openRequest.onsuccess = (event) => {
            let db = event.target.result;
            callback(null, db);
        };

        openRequest.onupgradeneeded = (event) => {
            let db = event.target.result;
            db.createObjectStore('strings'); 
            db.createObjectStore('values'); 
            db.createObjectStore('tokens'); 
            this.connectDB(callback);
        };            

        openRequest.onerror = (event) => {
            callback(new Error(`"Ошибка подключения к базе данных ${event.target.errorCode}`));
        };
    }

    /**
     * Обертка над getData, возвращающая Promise
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @returns {Promise} - промис
     */
    get(db, storeName) {
        return new Promise( (resolve, reject) => {
            this.getData(db, storeName, (error, data) => {
                if ( error ) reject(error);
                else resolve (data);
            });
        }); 
    }
    
    /**
     * Получение данных хранилища
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @param {Function} callback - функция обратного вызова вида function (resolve, reject)
     */
    getData(db, storeName, callback) {
        let transaction = db.transaction([storeName], "readonly"); 
        let store = transaction.objectStore(storeName);
        let request = store.openCursor();
        let dataMap = new Map();

        request.onsuccess = (event) => {
            let cursor = request.result;
            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;
                dataMap.set(key, value);
                cursor.continue();
            } 
            else {
                callback(null, dataMap);
            }
        };
          
        request.onerror = (event) => {
            callback(new Error(`"Ошибка выборки из базы данных ${request.error}`));
        };        
    }

    /**
     * Обертка над putData, возвращающая Promise, устанавливающая новое значение ячейки в хранилище
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @param {String} key - имя ячейки
     * @param {any} value - значение ячейки
     * @returns {Promise} - промис
     */
    put (db, storeName, key, value) {
        return new Promise( (resolve, reject) => {
            this.putData(db, storeName, key, value, (error, result) => {
                if ( error ) reject(error);
                else resolve (result);
            });
        }); 
    }
    
    /**
     * Установка нового значения ячейки
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @param {String} key - имя ячейки
     * @param {any} value - значение ячейки
     * @param {Function} callback - функция обратного вызова вида function (resolve, reject)
     */
    putData(db, storeName, key, value, callback) {
        let transaction = db.transaction([storeName], "readwrite"); 
        let store = transaction.objectStore(storeName);
        let request = store.put(value, key);

        request.onsuccess = (event) => {
            callback(null, request.result);
        };
          
        request.onerror = (event) => {
            callback(new Error(`Ошибка вставки данных в хранилище ${storeName}: ${request.error}`));
        };
    }

    /**
     * Обертка над deleteData, возвращающая Promise, удаляющая ячейку из хранилища
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @param {String} key - имя ячейки
     * @returns {Promise} - промис
     */
    delete(db, storeName, key) {
        return new Promise( (resolve, reject) => {
            this.deleteData(db, storeName, key, (error, result) => {
                if ( error ) reject(error);
                else resolve (result);
            });
        });         
    }
    
    /**
     * Удаление значения ячейки
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилиза
     * @param {String} key - имя ячейки
     * @param {Function} callback - функция обратного вызова вида function (resolve, reject)
     */
    deleteData(db, storeName, key, callback) {
        let transaction = db.transaction([storeName], "readwrite"); 
        let store = transaction.objectStore(storeName);
        let request = store.delete(key);

        request.onsuccess = (event) => {
            callback(null, request.result);
        };
          
        request.onerror = (event) => {
            callback(new Error(`Ошибка удаления данных в хранилище ${storeName}: ${request.error}`));
        };
    }

    /**
     * Обектка над clearData, возвращающая Promise, очищающая указанное хранилище
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилища
     * @returns {Promise} - промис
     */
    clear(db, storeName) {
        return new Promise( (resolve, reject) => {
            this.clearData(db, storeName, (error, result) => {
                if ( error ) reject(error);
                else resolve (result);
            });
        }); 
    }
    
    /**
     * Очистка указанного хранилища
     * @param {Object} db - объект открытой базы данных
     * @param {String} storeName - имя хранилища
     * @param {Function} callback - функция обратного вызова вида function (resolve, reject)
     */
    clearData(db, storeName, callback) {
        let transaction = db.transaction([storeName], "readwrite"); 
        let store = transaction.objectStore(storeName);      
        let request = store.clear();    

        request.onsuccess = (event) => {
            callback(null, request.result);
        };
          
        request.onerror = (event) => {
            callback(new Error(`Ошибка очистки хранилища ${storeName}: ${request.error}`));
        };
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
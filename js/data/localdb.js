/**
 * Класс для локального постоянного хранения данных таблицы
 */
class LocalDB {
    #app;

    constructor(app) {
        this.#app = app;
    }

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

    put(storeName, obj, key ) {
        this.connectDB((db) => {
            let transaction = db.transaction([storeName], "readwrite"); 
            let store = transaction.objectStore(storeName);

            let request = store.put(obj, key);
            // console.log(request);

            request.onsuccess = function() {
                console.log("Ok", request);
            };
              
            request.onerror = function() {
                console.log("Ошибка", request.error);
            };        
        }); 
    }




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
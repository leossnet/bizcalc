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
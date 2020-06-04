/**
 * Класс для хранения и обработки данных электронной таблицы
 */
class TableData {
    #name;
    #formulas = new Map();
    
    constructor(tableName, colCount, rowCount) {
        this.#name = tableName;
        
        for (let i=1; i<rowCount+1; i++) {
            for (let j=1; j<colCount+1; j++) {
                let letter = String.fromCharCode("A".charCodeAt(0)+j-1);
                this.#formulas.set(letter+i, "");
                this[letter+i]=0;

                Object.defineProperty(this, this[letter+i], { get:this.getter });
            }
        }
        this.#formulas.set("A1", "10");
        this.#formulas.set("A2", "=A1*20");
    }
}
class Table extends HTMLTableElement {
    #app;
    #params;

    constructor(app, params) {
        super();
        this.#app = app;
        this.#params = params;
        this.generateTable();
    }

    generateTable() {
        this.classList.add("table");
        let tBody = document.createElement("tBody");
        for (let i = 1; i <= this.#params.rowCount; i++) {
            let row = tBody.insertRow(-1);
            for (let j = 1; j <= this.#params.colCount; j++) {
                let cell = document.createElement("td");
                cell.onclick = (event) => {console.log(event)};
                cell.contentEditable=true;
                cell.innerHTML = i+":"+j;
                row.append(cell);
            }
        }
        this.append(tBody);       
    }
}

customElements.define('grid-table', Table, { extends: "table" });


/**
 * Класс для хранения значений токенов формулы
 * Вводимая формула разбивается на токены и уже в расчетчике используется в виде массива токенов. 
 */
class Token {
    // типы токенов
    static Types = {
        Cell: "cell" ,
        Number: "number" ,
        Operator: "operator" ,
        Function: "function",
        LeftBracket: "left bracket" , 
        RightBracket: "right bracket",
        Semicolon: "semicolon",
        Text: "text"
    };
    // строка разделителей вида "+-*/^();"" :
    static separators = Object.keys(Operators).join("")+"();"; 
    // шаблон разделитетей вида "[\+\-\*\/\^\(\)]" :
    static sepPattern =  new RegExp(`[${Token.escape(Token.separators)}]`, "g"); 

    static funcPattern = new RegExp(`${Object.keys(Functions).join("|").toLowerCase()}`, "g");

    #type;
    #value;
    #calc;
    #priority;

    /**
     * Конструктор токена, в котором обязательным параметром задается тип токена, 
     * а прочие параметры устанавливаются в зависимости от типа
     * @param {Types} type 
     * @param {Array} params 
     */
    constructor(type, value){
        this.#type = type;
        this.#value = value;
        if ( type === Token.Types.Operator ) {
            this.#calc = Operators[value].calc;
            this.#priority = Operators[value].priority;
        }
        else if ( type === Token.Types.Function ) {
            this.#calc = Functions[value].calc;
            this.#priority = Functions[value].priority;
        }
    }

    /**
     * Получение типа токена
     */
    get type() {
        return this.#type;
    }

    /**
     * Получение значения токена
     * Применимо для токенов со всеми типами, кроме Token.Types.Operator
     */
    get value() {
        return this.#value;
    }

    /**
     * Получение функции, соответствующей оператору токена
     * Применимо только для токена с типом Token.Types.Operator
     */
    get calc() {
        return this.#calc;
    }

    /**
     * Получение приоритета оператора токена
     * Применимо только для токена с типом Token.Types.Operator
     */
    get priority() {
        return this.#priority;
    }

    /**
     * Преобразование формульной строки на массив текстовых токенов
     * @param {String} formula - разбиение формулы на токены
     * @returns {Array<String>} - массив текстовых токенов
     */
    static splitFormula(formula) {
        let strTokens = formula.replace(/\s+/g, "")              // очистка от пробельных символов
            .replace(/(?<=\d+),(?=\d+)/g, ".")  // замена запятой на точку (для чисел)
            .replace(/^\-/g, "0\-")             // подстановка отсутствующего 0 для знака "-" в начале строки
            .replace(/\(\-/g, "\(0\-")          // подстановка отсутствующего 0 для знака "-" в середине строки
            .replace(/\;\-/g, "\;0\-")          // подстановка отсутствующего 0 для знака "-" в выражении функции
            .replace(Token.sepPattern, "&$&&")  // вставка знака & перед разделителями
            .split("&")                         // разбиение на токены по знаку &
            .filter(item => item != "")         // удаление из массива пустых элементов
        ;
        return strTokens;
    }

    /**
     * Разбирает формулу на токены 
     * @param {Sring} formula строка с формулой
     */
    static getTokens(formula){
        let tokens = [];
        let strTokens = Token.splitFormula(formula);
        strTokens.forEach(tokenCode => {
            if ( tokenCode in Operators ) 
                tokens.push( new Token ( Token.Types.Operator, tokenCode ));
            else if ( tokenCode === "(" )  
                tokens.push ( new Token ( Token.Types.LeftBracket, tokenCode ));
            else if ( tokenCode === ")" ) 
                tokens.push ( new Token ( Token.Types.RightBracket, tokenCode ));
            else if ( tokenCode === ";" ) 
                tokens.push ( new Token ( Token.Types.Semicolon, tokenCode ));
            else if ( tokenCode.toLowerCase().match( Token.funcPattern ) !== null  )
                tokens.push ( new Token ( Token.Types.Function, tokenCode.toLowerCase() ));
            else if ( tokenCode.match(/^\d+[.]?\d*/g) !== null ) 
                tokens.push ( new Token ( Token.Types.Number, Number(tokenCode) )); 
            else if ( tokenCode.match(/^[A-Z]+[1-9][0-9]*/g) !== null )
                tokens.push ( new Token ( Token.Types.Cell, tokenCode ));
        });
        return tokens;
    }

    /**
     * Экранирование обратным слешем специальных символов
     * @param {String} str 
     */    
    static escape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{};]/g, '\\$&');
	}    
	
    /**
     * Переопределение сериализации объекта в JSON
     */
    toJSON() {
        return {
            type: this.#type,
            value: this.#value
        };
    }
}


// let formula = "if( 1; round(10,2); 2*10)";
// let formula = "round2(15.542 + 0.5)";
// let formula1 = "max(2*15; 10; 20)";
// let formula2 = "min(2; 10; 20)";
// let formula3 = "random()";
// let formula4 = "if ( max(0;10) ; 10*5 ; 15 ) ";
// let formula5 = "sum(2*15; 10; 20)";
// let formula6 = "round(125.126;-1)";

// let calculator = new Calculator(null);
// console.log(formula+" = "+calculator.calc(formula));
// console.log(formula1+" = "+calculator.calc(formula1));
// console.log(formula2+" = "+calculator.calc(formula2));
// console.log(formula3+" = "+calculator.calc(formula3));
// console.log(formula4+" = "+calculator.calc(formula4));
// console.log(formula5+" = "+calculator.calc(formula5));
// console.log(formula6+" = "+calculator.calc(formula6));
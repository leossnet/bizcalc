/**
 * Объект с типами операндов
 */
const Types = {
    Cell: "cell" ,
    Number: "number" ,
    Operator: "operator" ,
    Function: "function",
    LeftBracket: "left bracket" , 
    RightBracket: "right bracket",
    Semicolon: "semicolon",
    Text: "text"
};

/**
 * Объект, содержащий символы операторов, для каждого из которых указаны:
 * 1. Приоритет выполнения оператора
 * 2. Функция, вызываемая для обработки оператора
 */
const Operators = {
    ["+"]: { priority: 1, calc: (a, b) => a + b },
    ["-"]: { priority: 1, calc: (a, b) => a - b }, 
    ["*"]: { priority: 2, calc: (a, b) => a * b },
    ["/"]: { priority: 2, calc: (a, b) => a / b },
    ["^"]: { priority: 3, calc: (a, b) => Math.pow(a, b) },
};

const Functions = {
    ["random"]: {priority: 4, calc: () => Math.random() },
    ["round"]:  {priority: 4, calc: (a) => Math.round(a) },
    ["round2"]: {priority: 4, calc: (a) => Math.round(a * 100) / 100 },
    ["round3"]: {priority: 4, calc: (a) => Math.round(a * 1000) / 1000 },
    ["round4"]: {priority: 4, calc: (a) => Math.round(a * 10000) / 10000 },
    ["sum"]:    {priority: 4, calc: (...args) => args.reduce( (sum, current) => sum + current, 0) },
    ["min"]:    {priority: 4, calc: (...args) => Math.min(...args) },
    ["max"]:    {priority: 4, calc: (...args) => Math.max(...args) },
    ["if"]:     {priority: 4, calc: (...args) => args[0] ? args[1] : (args[2] ? args[2] : 0) }
};

/**
 * Класс для хранения значений токенов формулы
 * Вводимая формула разбивается на токены и уже в расчетчике используется в виде массива токенов. 
 */
class Token {

    static separators = Object.keys(Operators).join("")+"();"; // запоминает строку разделителей вида "+-*/^();""
    static sepPattern = `[${Token.escape(Token.separators)}]`; // формирует шаблон разделитетей вида "[\+\-\*\/\^\(\)]"
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
        if ( type === Types.Operator ) {
            this.#calc = Operators[value].calc;
            this.#priority = Operators[value].priority;
        }
        else if ( type === Types.Function ) {
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
     * Применимо для токенов со всеми типами, кроме Types.Operator
     */
    get value() {
        return this.#value;
    }

    /**
     * Получение функции, соответствующей оператору токена
     * Применимо только для токена с типом Types.Operator
     */
    get calc() {
        return this.#calc;
    }

    /**
     * Получение приоритета оператора токена
     * Применимо только для токена с типом Types.Operator
     */
    get priority() {
        return this.#priority;
    }

    /**
     * Разбирает формулу на токены 
     * @param {Sring} formula строка с формулой
     */
    static getTokens(formula){
        let tokens = [];
        let tokenCodes = formula.replace(/\s+/g, "")                // очистка от пробельных символов
            .replace(/(?<=\d+),(?=\d+)/g, ".")                                     // заменяет запятую на точку (для чисел)
            .replace(/^\-/g, "0-")                                  // подставляет отсутсующий 0 для знака "-" в начале строки
            .replace(/\(\-/g, "(0-")                                // подставляет отсутсующий 0 для знака "-" в середине строки
            .replace(new RegExp (Token.sepPattern, "g"), "&$&&")     // вставка знака & перед разделителями
            .split("&")                                             // разбиение на токены по знаку &
            .filter(item => item != "");                            // удаление из массива пустых элементов
        
        tokenCodes.forEach(function (tokenCode){
            if ( tokenCode in Operators ) 
                tokens.push( new Token ( Types.Operator, tokenCode ));
            else if ( tokenCode === "(" )  
                tokens.push ( new Token ( Types.LeftBracket, tokenCode ));
            else if ( tokenCode === ")" ) 
                tokens.push ( new Token ( Types.RightBracket, tokenCode ));
            else if ( tokenCode === ";" ) 
                tokens.push ( new Token ( Types.Semicolon, tokenCode ));
            else if ( tokenCode.toLowerCase().match( Token.funcPattern ) !== null  )
                tokens.push ( new Token ( Types.Function, tokenCode.toLowerCase() ));
            else if ( tokenCode.match(/^\d+[.]?\d*/g) !== null ) 
                tokens.push ( new Token ( Types.Number, Number(tokenCode) )); 
            else if ( tokenCode.match(/^[A-Z]+[1-9]+/g) !== null )
                tokens.push ( new Token ( Types.Cell, tokenCode ));
        });
        return tokens;
    }

    /**
     * Экранирование обратным слешем специальных символов
     * @param {String} str 
     */    
    static escape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
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

// let calculator = new Calculator(null);
// console.log(formula+" = "+calculator.calc(formula));
// console.log(formula1+" = "+calculator.calc(formula1));
// console.log(formula2+" = "+calculator.calc(formula2));
// console.log(formula3+" = "+calculator.calc(formula3));
// console.log(formula4+" = "+calculator.calc(formula4));
// console.log(formula5+" = "+calculator.calc(formula5));
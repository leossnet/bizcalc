/**
 * Объект с типами операндов
 */
const Types = {
    Cell: "cell" ,
    Number: "number" ,
    Operator: "operator" ,
    LeftBracket: "left bracket" , 
    RightBracket: "right bracket",
    Text: "text"
};

/**
 * Объект, содержащий символы операторов, для каждого из которых указаны:
 * 1. Приоритет выполнения оператора
 * 2. Функция, вызываемая для обработки оператора
 */
const Operators = {
    ["+"]: { priority: 1, calc: function (a, b) { return a + b; } },
    ["-"]: { priority: 1, calc: function (a, b) { return a - b; } }, 
    ["*"]: { priority: 2, calc: function (a, b) { return a * b; } },
    ["/"]: { priority: 2, calc: function (a, b) { return a / b; } },
    ["^"]: { priority: 3, calc: function (a, b) { return Math.pow(a, b); } }
};


/**
 * Класс калькулятора, вычисляющего простые выражения с числами и ячейками электронных таблиц
 */
class Calculator {
    #tdata;

    /**
     * Конструктор калькулятора
     * @param {Map} cells хеш ячеек, содержащих формулы, в которых другие ячейки ссылаются на первичные значения
     */
    constructor(tableData) {
        this.#tdata = tableData;
    }

    /**
     * Расчет значений для формулы
     * @param {String} formula агрумент может быть представлен как в виде формулы в виде строки,
     *      так и в виде массива токенов, на которые была предварительна разобрана формула в виде сроки.
     * Токен представляет собой объект вида { type: Types.xxx [, value: xxx] [, calc:xxx] [, pririty:xxx]}, 
     *      который получается в результате разбора формулы в виде строки функцией getTokens(String)
     */
    calc(formula){
        let self = this;
        let tokens = Array.isArray(formula) ? formula : Token.getTokens(formula);
        let operators = [];
        let operands = [];
        tokens.forEach(function (token) {
            if ( token.type == Types.Number ) {
                operands.push(token);
            }
            else if ( token.type == Types.Cell ){
                if ( self.#tdata.isNumber(token.value) ) {
                    operands.push(self.#tdata.getNumberToken(token));
                }
                else if ( self.#tdata.isFormula(token.value) ) {
                    let formula = self.#tdata.getTokens(token.value);
                    operands.push(new Token(Types.Number, self.calc(formula)));
                }
                else operands.push(NaN);
            }
            else if ( token.type == Types.Operator ) {
                self.calcExpression(operands, operators, token.priority);
                operators.push(token);
            }
            else if ( token.type == Types.LeftBracket ) {
                operators.push(token);
            }
            else if ( token.type == Types.RightBracket ) {
                self.calcExpression(operands, operators, 1);
                operators.pop();
            }
        });
        self.calcExpression(operands, operators, 0);
        return operands.pop().value; 
    }

    /**
     * Вычисление подвыражения внутри (без) скобок
     * @param {Array} operands массив операндов
     * @param {Array} operators массив операторов 
     * @param {Number} minPriority минимальный приоритет для вычисления выражения
     */
    calcExpression (operands, operators, minPriority) {
        while ( operators.length && ( operators[operators.length-1].priority ) >= minPriority ) {
            let rightOperand = operands.pop().value;
            let leftOperand = operands.pop().value;
            let operator = operators.pop();
            let result = operator.calc(leftOperand, rightOperand);
            operands.push(new Token ( Types.Number, result ));
        }
    }
}


/**
 * Вспомогательный класс для наглядного определения токена формулы
 */
class Token {

    static separators = Object.keys(Operators).join("")+"()"; // запоминает строку разделителей вида "+-*/^()""
    static sepPattern = `[${Token.escape(Token.separators)}]`; // формирует шаблон разделитетей вида "[\+\-\*\/\^\(\)]"

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
            .replace(/,/g, ".")                                     // заменяет запятую на точку (для чисел)
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
	
	toString() {
		return this.#value;
	}
}
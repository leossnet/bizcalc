
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
    // ["round"]:  {priority: 4, calc: (a) => Math.round(a) },
    ["round"]:  {priority: 4, calc: round },
    ["round1"]: {priority: 4, calc: (a) => Math.round(a * 10) / 10 },
    ["round2"]: {priority: 4, calc: (a) => Math.round(a * 100) / 100 },
    ["round3"]: {priority: 4, calc: (a) => Math.round(a * 1000) / 1000 },
    ["round4"]: {priority: 4, calc: (a) => Math.round(a * 10000) / 10000 },
    ["sum"]:    {priority: 4, calc: (...args) => args.reduce( (sum, current) => sum + current, 0) },
    ["min"]:    {priority: 4, calc: (...args) => Math.min(...args) },
    ["max"]:    {priority: 4, calc: (...args) => Math.max(...args) },
    ["if"]:     {priority: 4, calc: (...args) => args[0] ? args[1] : (args[2] ? args[2] : 0) }
};

/**
 * Округление числа
 * @param {Number} value - округляемое значение
 * @param {Number} rate - степень округления в виде целого значения
 */
function round(value, rate=0) {
    return Math.round( value * Math.pow(10, rate) ) / Math.pow(10, rate);
}
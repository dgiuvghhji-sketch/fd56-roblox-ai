const KEYWORDS = new Set([
    "let",
    "const",
    "var",
    "if",
    "else",
    "for",
    "while",
    "function",
    "return",
    "true",
    "false",
    "null",
    "print",
    "site",
    "page",
    "text",
    "button",
    "on",
    "click"
]);

const TWO_CHARACTER_OPERATORS = [
    "==",
    "!=",
    ">=",
    "<=",
    "&&",
    "||",
    "=>"
];

const ONE_CHARACTER_OPERATORS = [
    "+",
    "-",
    "*",
    "/",
    "%",
    "=",
    ">",
    "<",
    "!",
    "?"
];

const SYMBOLS = {
    "(": "LPAREN",
    ")": "RPAREN",
    "{": "LBRACE",
    "}": "RBRACE",
    "[": "LBRACKET",
    "]": "RBRACKET",
    ",": "COMMA",
    ".": "DOT",
    ":": "COLON",
    ";": "SEMICOLON"
};

function isLetter(char) {
    return /[A-Za-z_$]/.test(char);
}

function isDigit(char) {
    return /[0-9]/.test(char);
}

function isWhitespace(char) {
    return /\s/.test(char);
}

function isIdentifierCharacter(char) {
    return /[A-Za-z0-9_$]/.test(char);
}

function readString(source, start) {
    const quote = source[start];
    let value = "";
    let index = start + 1;

    while (index < source.length) {
        const char = source[index];

        if (char === "\\") {
            const next = source[index + 1];

            if (next === undefined) {
                throw new Error(`Unterminated string at position ${start}`);
            }

            const escapes = {
                n: "\n",
                r: "\r",
                t: "\t",
                "\\": "\\",
                "\"": "\"",
                "'": "'"
            };

            value += escapes[next] ?? next;
            index += 2;
            continue;
        }

        if (char === quote) {
            return {
                value,
                nextIndex: index + 1
            };
        }

        value += char;
        index++;
    }

    throw new Error(`Unterminated string at position ${start}`);
}

function readNumber(source, start) {
    let index = start;
    let value = "";

    while (index < source.length && isDigit(source[index])) {
        value += source[index];
        index++;
    }

    if (source[index] === ".") {
        value += ".";
        index++;

        while (index < source.length && isDigit(source[index])) {
            value += source[index];
            index++;
        }
    }

    return {
        value: Number(value),
        nextIndex: index
    };
}

function readIdentifier(source, start) {
    let index = start;
    let value = "";

    while (
        index < source.length &&
        isIdentifierCharacter(source[index])
    ) {
        value += source[index];
        index++;
    }

    return {
        value,
        nextIndex: index
    };
}

function createToken(type, value, start, end, line, column) {
    return {
        type,
        value,
        position: {
            start,
            end,
            line,
            column
        }
    };
}

function tokenize(source) {
    if (typeof source !== "string") {
        throw new TypeError("FD lexer expects source code as a string");
    }

    const tokens = [];

    let index = 0;
    let line = 1;
    let column = 1;

    function advance(count = 1) {
        for (let i = 0; i < count; i++) {
            if (source[index] === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }

            index++;
        }
    }

    while (index < source.length) {
        const char = source[index];

        if (isWhitespace(char)) {
            advance();
            continue;
        }

        if (char === "/" && source[index + 1] === "/") {
            while (index < source.length && source[index] !== "\n") {
                advance();
            }

            continue;
        }

        const tokenStart = index;
        const tokenLine = line;
        const tokenColumn = column;

        if (char === "\"" || char === "'") {
            const result = readString(source, index);

            advance(result.nextIndex - index);

            tokens.push(
                createToken(
                    "STRING",
                    result.value,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        if (isDigit(char)) {
            const result = readNumber(source, index);

            advance(result.nextIndex - index);

            tokens.push(
                createToken(
                    "NUMBER",
                    result.value,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        if (isLetter(char)) {
            const result = readIdentifier(source, index);

            advance(result.nextIndex - index);

            const type = KEYWORDS.has(result.value)
                ? "KEYWORD"
                : "IDENTIFIER";

            tokens.push(
                createToken(
                    type,
                    result.value,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        const twoCharacter = source.slice(index, index + 2);

        if (TWO_CHARACTER_OPERATORS.includes(twoCharacter)) {
            advance(2);

            tokens.push(
                createToken(
                    "OPERATOR",
                    twoCharacter,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        if (ONE_CHARACTER_OPERATORS.includes(char)) {
            advance();

            tokens.push(
                createToken(
                    "OPERATOR",
                    char,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        if (SYMBOLS[char]) {
            advance();

            tokens.push(
                createToken(
                    SYMBOlS[char],
                    char,
                    tokenStart,
                    index,
                    tokenLine,
                    tokenColumn
                )
            );

            continue;
        }

        throw new Error(
            `Unexpected character "${char}" at line ${line}, column ${column}`
        );
    }

    tokens.push(
        createToken(
            "EOF",
            null,
            index,
            index,
            line,
            column
        )
    );

    return tokens;
}

module.exports = {
    tokenize,
    KEYWORDS
};
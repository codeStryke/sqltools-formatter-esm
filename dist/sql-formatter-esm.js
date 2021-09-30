var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var escapeRegExp_1 = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(str) {
    return (str && reHasRegExpChar.test(str))
        ? str.replace(reRegExpChar, '\\$&')
        : (str || '');
}
exports["default"] = escapeRegExp;
});

var types = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
exports.TokenTypes = void 0;
(function (TokenTypes) {
    TokenTypes["WHITESPACE"] = "whitespace";
    TokenTypes["WORD"] = "word";
    TokenTypes["STRING"] = "string";
    TokenTypes["RESERVED"] = "reserved";
    TokenTypes["RESERVED_TOP_LEVEL"] = "reserved-top-level";
    TokenTypes["RESERVED_TOP_LEVEL_NO_INDENT"] = "reserved-top-level-no-indent";
    TokenTypes["RESERVED_NEWLINE"] = "reserved-newline";
    TokenTypes["OPERATOR"] = "operator";
    TokenTypes["NO_SPACE_OPERATOR"] = "no-space-operator";
    TokenTypes["OPEN_PAREN"] = "open-paren";
    TokenTypes["CLOSE_PAREN"] = "close-paren";
    TokenTypes["LINE_COMMENT"] = "line-comment";
    TokenTypes["BLOCK_COMMENT"] = "block-comment";
    TokenTypes["NUMBER"] = "number";
    TokenTypes["PLACEHOLDER"] = "placeholder";
    TokenTypes["SERVERVARIABLE"] = "servervariable";
})(exports.TokenTypes || (exports.TokenTypes = {}));
});

var Tokenizer_1 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var escapeRegExp_1$1 = __importDefault(escapeRegExp_1);

var Tokenizer = (function () {
    function Tokenizer(cfg) {
        this.WHITESPACE_REGEX = /^(\s+)/u;
        this.NUMBER_REGEX = /^((-\s*)?[0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+|([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}))\b/u;
        this.AMBIGUOS_OPERATOR_REGEX = /^(\?\||\?&)/u;
        this.OPERATOR_REGEX = /^(!=|<>|>>|<<|==|<=|>=|!<|!>|\|\|\/|\|\/|\|\||~~\*|~~|!~~\*|!~~|~\*|!~\*|!~|:=|&&|@>|<@|#-|@|.)/u;
        this.NO_SPACE_OPERATOR_REGEX = /^(::|->>|->|#>>|#>)/u;
        this.BLOCK_COMMENT_REGEX = /^(\/\*[^]*?(?:\*\/|$))/u;
        this.LINE_COMMENT_REGEX = this.createLineCommentRegex(cfg.lineCommentTypes);
        this.RESERVED_TOP_LEVEL_REGEX = this.createReservedWordRegex(cfg.reservedTopLevelWords);
        this.RESERVED_TOP_LEVEL_NO_INDENT_REGEX = this.createReservedWordRegex(cfg.reservedTopLevelWordsNoIndent);
        this.RESERVED_NEWLINE_REGEX = this.createReservedWordRegex(cfg.reservedNewlineWords);
        this.RESERVED_PLAIN_REGEX = this.createReservedWordRegex(cfg.reservedWords);
        this.WORD_REGEX = this.createWordRegex(cfg.specialWordChars);
        this.STRING_REGEX = this.createStringRegex(cfg.stringTypes);
        this.OPEN_PAREN_REGEX = this.createParenRegex(cfg.openParens);
        this.CLOSE_PAREN_REGEX = this.createParenRegex(cfg.closeParens);
        this.INDEXED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(cfg.indexedPlaceholderTypes, '[0-9]*');
        this.IDENT_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(cfg.namedPlaceholderTypes, '[a-zA-Z0-9._$]+');
        this.STRING_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(cfg.namedPlaceholderTypes, this.createStringPattern(cfg.stringTypes));
    }
    Tokenizer.prototype.createLineCommentRegex = function (lineCommentTypes) {
        return new RegExp("^((?:" + lineCommentTypes.map(function (c) { return escapeRegExp_1$1["default"](c); }).join('|') + ")[^>]*?(?:\r\n|\r|\n|$))", 'u');
    };
    Tokenizer.prototype.createReservedWordRegex = function (reservedWords) {
        var reservedWordsPattern = reservedWords.join('|').replace(/ /gu, '\\s+');
        return new RegExp("^(" + reservedWordsPattern + ")\\b", 'iu');
    };
    Tokenizer.prototype.createWordRegex = function (specialChars) {
        return new RegExp("^([\\p{Alphabetic}\\p{Mark}\\p{Decimal_Number}\\p{Connector_Punctuation}\\p{Join_Control}" + specialChars.join('') + "]+)", 'u');
    };
    Tokenizer.prototype.createStringRegex = function (stringTypes) {
        return new RegExp('^(' + this.createStringPattern(stringTypes) + ')', 'u');
    };
    Tokenizer.prototype.createStringPattern = function (stringTypes) {
        var patterns = {
            '``': '((`[^`]*($|`))+)',
            '[]': '((\\[[^\\]]*($|\\]))(\\][^\\]]*($|\\]))*)',
            '""': '(("[^"\\\\]*(?:\\\\.[^"\\\\]*)*("|$))+)',
            "''": "(('[^'\\\\]*(?:\\\\.[^'\\\\]*)*('|$))+)",
            "N''": "((N'[^N'\\\\]*(?:\\\\.[^N'\\\\]*)*('|$))+)"
        };
        return stringTypes.map(function (t) { return patterns[t]; }).join('|');
    };
    Tokenizer.prototype.createParenRegex = function (parens) {
        var _this = this;
        return new RegExp('^(' + parens.map(function (p) { return _this.escapeParen(p); }).join('|') + ')', 'iu');
    };
    Tokenizer.prototype.escapeParen = function (paren) {
        if (paren.length === 1) {
            return escapeRegExp_1$1["default"](paren);
        }
        else {
            return '\\b' + paren + '\\b';
        }
    };
    Tokenizer.prototype.createPlaceholderRegex = function (types, pattern) {
        if (!types || types.length === 0) {
            return null;
        }
        var typesRegex = types.map(escapeRegExp_1$1["default"]).join('|');
        return new RegExp("^((?:" + typesRegex + ")(?:" + pattern + "))", 'u');
    };
    Tokenizer.prototype.tokenize = function (input) {
        if (!input)
            return [];
        var tokens = [];
        var token;
        while (input.length) {
            token = this.getNextToken(input, token);
            input = input.substring(token.value.length);
            tokens.push(token);
        }
        return tokens;
    };
    Tokenizer.prototype.getNextToken = function (input, previousToken) {
        return (this.getWhitespaceToken(input) ||
            this.getCommentToken(input) ||
            this.getStringToken(input) ||
            this.getOpenParenToken(input) ||
            this.getCloseParenToken(input) ||
            this.getAmbiguosOperatorToken(input) ||
            this.getNoSpaceOperatorToken(input) ||
            this.getServerVariableToken(input) ||
            this.getPlaceholderToken(input) ||
            this.getNumberToken(input) ||
            this.getReservedWordToken(input, previousToken) ||
            this.getWordToken(input) ||
            this.getOperatorToken(input));
    };
    Tokenizer.prototype.getWhitespaceToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.WHITESPACE,
            regex: this.WHITESPACE_REGEX
        });
    };
    Tokenizer.prototype.getCommentToken = function (input) {
        return this.getLineCommentToken(input) || this.getBlockCommentToken(input);
    };
    Tokenizer.prototype.getLineCommentToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.LINE_COMMENT,
            regex: this.LINE_COMMENT_REGEX
        });
    };
    Tokenizer.prototype.getBlockCommentToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.BLOCK_COMMENT,
            regex: this.BLOCK_COMMENT_REGEX
        });
    };
    Tokenizer.prototype.getStringToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.STRING,
            regex: this.STRING_REGEX
        });
    };
    Tokenizer.prototype.getOpenParenToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.OPEN_PAREN,
            regex: this.OPEN_PAREN_REGEX
        });
    };
    Tokenizer.prototype.getCloseParenToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.CLOSE_PAREN,
            regex: this.CLOSE_PAREN_REGEX
        });
    };
    Tokenizer.prototype.getPlaceholderToken = function (input) {
        return (this.getIdentNamedPlaceholderToken(input) ||
            this.getStringNamedPlaceholderToken(input) ||
            this.getIndexedPlaceholderToken(input));
    };
    Tokenizer.prototype.getServerVariableToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.SERVERVARIABLE,
            regex: /(^@@\w+)/iu
        });
    };
    Tokenizer.prototype.getIdentNamedPlaceholderToken = function (input) {
        return this.getPlaceholderTokenWithKey({
            input: input,
            regex: this.IDENT_NAMED_PLACEHOLDER_REGEX,
            parseKey: function (v) { return v.slice(1); }
        });
    };
    Tokenizer.prototype.getStringNamedPlaceholderToken = function (input) {
        var _this = this;
        return this.getPlaceholderTokenWithKey({
            input: input,
            regex: this.STRING_NAMED_PLACEHOLDER_REGEX,
            parseKey: function (v) { return _this.getEscapedPlaceholderKey({ key: v.slice(2, -1), quoteChar: v.slice(-1) }); }
        });
    };
    Tokenizer.prototype.getIndexedPlaceholderToken = function (input) {
        return this.getPlaceholderTokenWithKey({
            input: input,
            regex: this.INDEXED_PLACEHOLDER_REGEX,
            parseKey: function (v) { return v.slice(1); }
        });
    };
    Tokenizer.prototype.getPlaceholderTokenWithKey = function (_a) {
        var input = _a.input, regex = _a.regex, parseKey = _a.parseKey;
        var token = this.getTokenOnFirstMatch({ input: input, regex: regex, type: types.TokenTypes.PLACEHOLDER });
        if (token) {
            token.key = parseKey(token.value);
        }
        return token;
    };
    Tokenizer.prototype.getEscapedPlaceholderKey = function (_a) {
        var key = _a.key, quoteChar = _a.quoteChar;
        return key.replace(new RegExp(escapeRegExp_1$1["default"]('\\' + quoteChar), 'gu'), quoteChar);
    };
    Tokenizer.prototype.getNumberToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.NUMBER,
            regex: this.NUMBER_REGEX
        });
    };
    Tokenizer.prototype.getOperatorToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.OPERATOR,
            regex: this.OPERATOR_REGEX
        });
    };
    Tokenizer.prototype.getAmbiguosOperatorToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.OPERATOR,
            regex: this.AMBIGUOS_OPERATOR_REGEX
        });
    };
    Tokenizer.prototype.getNoSpaceOperatorToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.NO_SPACE_OPERATOR,
            regex: this.NO_SPACE_OPERATOR_REGEX
        });
    };
    Tokenizer.prototype.getReservedWordToken = function (input, previousToken) {
        if (previousToken && previousToken.value && previousToken.value === '.') {
            return;
        }
        return (this.getToplevelReservedToken(input) ||
            this.getNewlineReservedToken(input) ||
            this.getTopLevelReservedTokenNoIndent(input) ||
            this.getPlainReservedToken(input));
    };
    Tokenizer.prototype.getToplevelReservedToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.RESERVED_TOP_LEVEL,
            regex: this.RESERVED_TOP_LEVEL_REGEX
        });
    };
    Tokenizer.prototype.getNewlineReservedToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.RESERVED_NEWLINE,
            regex: this.RESERVED_NEWLINE_REGEX
        });
    };
    Tokenizer.prototype.getPlainReservedToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.RESERVED,
            regex: this.RESERVED_PLAIN_REGEX
        });
    };
    Tokenizer.prototype.getTopLevelReservedTokenNoIndent = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.RESERVED_TOP_LEVEL_NO_INDENT,
            regex: this.RESERVED_TOP_LEVEL_NO_INDENT_REGEX
        });
    };
    Tokenizer.prototype.getWordToken = function (input) {
        return this.getTokenOnFirstMatch({
            input: input,
            type: types.TokenTypes.WORD,
            regex: this.WORD_REGEX
        });
    };
    Tokenizer.prototype.getTokenOnFirstMatch = function (_a) {
        var input = _a.input, type = _a.type, regex = _a.regex;
        var matches = input.match(regex);
        if (matches) {
            return { type: type, value: matches[1] };
        }
    };
    return Tokenizer;
}());
exports["default"] = Tokenizer;
});

var last_1 = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var last = function (arr) {
    if (arr === void 0) { arr = []; }
    return arr[arr.length - 1];
};
exports["default"] = last;
});

var Indentation_1 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var last_1$1 = __importDefault(last_1);
var INDENT_TYPE_TOP_LEVEL = 'top-level';
var INDENT_TYPE_BLOCK_LEVEL = 'block-level';
var Indentation = (function () {
    function Indentation(indent) {
        this.indent = indent;
        this.indentTypes = [];
        this.indent = indent || '  ';
    }
    Indentation.prototype.getIndent = function () {
        return new Array(this.indentTypes.length).fill(this.indent).join('');
    };
    Indentation.prototype.increaseTopLevel = function () {
        this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
    };
    Indentation.prototype.increaseBlockLevel = function () {
        this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
    };
    Indentation.prototype.decreaseTopLevel = function () {
        if (last_1$1["default"](this.indentTypes) === INDENT_TYPE_TOP_LEVEL) {
            this.indentTypes.pop();
        }
    };
    Indentation.prototype.decreaseBlockLevel = function () {
        while (this.indentTypes.length > 0) {
            var type = this.indentTypes.pop();
            if (type !== INDENT_TYPE_TOP_LEVEL) {
                break;
            }
        }
    };
    Indentation.prototype.resetIndentation = function () {
        this.indentTypes = [];
    };
    return Indentation;
}());
exports["default"] = Indentation;
});

var InlineBlock_1 = createCommonjsModule(function (module, exports) {
exports.__esModule = true;

var INLINE_MAX_LENGTH = 50;
var InlineBlock = (function () {
    function InlineBlock() {
        this.level = 0;
    }
    InlineBlock.prototype.beginIfPossible = function (tokens, index) {
        if (this.level === 0 && this.isInlineBlock(tokens, index)) {
            this.level = 1;
        }
        else if (this.level > 0) {
            this.level++;
        }
        else {
            this.level = 0;
        }
    };
    InlineBlock.prototype.end = function () {
        this.level--;
    };
    InlineBlock.prototype.isActive = function () {
        return this.level > 0;
    };
    InlineBlock.prototype.isInlineBlock = function (tokens, index) {
        var length = 0;
        var level = 0;
        for (var i = index; i < tokens.length; i++) {
            var token = tokens[i];
            length += token.value.length;
            if (length > INLINE_MAX_LENGTH) {
                return false;
            }
            if (token.type === types.TokenTypes.OPEN_PAREN) {
                level++;
            }
            else if (token.type === types.TokenTypes.CLOSE_PAREN) {
                level--;
                if (level === 0) {
                    return true;
                }
            }
            if (this.isForbiddenToken(token)) {
                return false;
            }
        }
        return false;
    };
    InlineBlock.prototype.isForbiddenToken = function (_a) {
        var type = _a.type, value = _a.value;
        return (type === types.TokenTypes.RESERVED_TOP_LEVEL ||
            type === types.TokenTypes.RESERVED_NEWLINE ||
            type === types.TokenTypes.LINE_COMMENT ||
            type === types.TokenTypes.BLOCK_COMMENT ||
            value === ';');
    };
    return InlineBlock;
}());
exports["default"] = InlineBlock;
});

var Params_1 = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var Params = (function () {
    function Params(params) {
        this.params = params;
        this.index = 0;
        this.params = params;
    }
    Params.prototype.get = function (_a) {
        var key = _a.key, value = _a.value;
        if (!this.params) {
            return value;
        }
        if (key) {
            return this.params[key];
        }
        return this.params[this.index++];
    };
    return Params;
}());
exports["default"] = Params;
});

var Formatter_1 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;

var Indentation_1$1 = __importDefault(Indentation_1);
var InlineBlock_1$1 = __importDefault(InlineBlock_1);
var Params_1$1 = __importDefault(Params_1);
var trimSpacesEnd = function (str) { return str.replace(/[ \t]+$/u, ''); };
var Formatter = (function () {
    function Formatter(cfg, tokenizer, tokenOverride) {
        this.cfg = cfg;
        this.tokenizer = tokenizer;
        this.tokenOverride = tokenOverride;
        this.tokens = [];
        this.previousReservedWord = { type: null, value: null };
        this.previousNonWhiteSpace = { type: null, value: null };
        this.index = 0;
        this.indentation = new Indentation_1$1["default"](this.cfg.indent);
        this.inlineBlock = new InlineBlock_1$1["default"]();
        this.params = new Params_1$1["default"](this.cfg.params);
    }
    Formatter.prototype.format = function (query) {
        this.tokens = this.tokenizer.tokenize(query);
        var formattedQuery = this.getFormattedQueryFromTokens();
        return formattedQuery.trim();
    };
    Formatter.prototype.getFormattedQueryFromTokens = function () {
        var _this = this;
        var formattedQuery = '';
        this.tokens.forEach(function (token, index) {
            _this.index = index;
            if (_this.tokenOverride)
                token = _this.tokenOverride(token, _this.previousReservedWord) || token;
            if (token.type === types.TokenTypes.WHITESPACE) {
                formattedQuery = _this.formatWhitespace(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.LINE_COMMENT) {
                formattedQuery = _this.formatLineComment(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.BLOCK_COMMENT) {
                formattedQuery = _this.formatBlockComment(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.RESERVED_TOP_LEVEL
                || token.type === types.TokenTypes.RESERVED_TOP_LEVEL_NO_INDENT
                || token.type === types.TokenTypes.RESERVED_NEWLINE
                || token.type === types.TokenTypes.RESERVED) {
                formattedQuery = _this.formatReserved(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.OPEN_PAREN) {
                formattedQuery = _this.formatOpeningParentheses(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.CLOSE_PAREN) {
                formattedQuery = _this.formatClosingParentheses(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.NO_SPACE_OPERATOR) {
                formattedQuery = _this.formatWithoutSpaces(token, formattedQuery);
            }
            else if (token.type === types.TokenTypes.PLACEHOLDER || token.type === types.TokenTypes.SERVERVARIABLE) {
                formattedQuery = _this.formatPlaceholder(token, formattedQuery);
            }
            else if (token.value === ',') {
                formattedQuery = _this.formatComma(token, formattedQuery);
            }
            else if (token.value === ':') {
                formattedQuery = _this.formatWithSpaceAfter(token, formattedQuery);
            }
            else if (token.value === '.') {
                formattedQuery = _this.formatWithoutSpaces(token, formattedQuery);
            }
            else if (token.value === ';') {
                formattedQuery = _this.formatQuerySeparator(token, formattedQuery);
            }
            else {
                formattedQuery = _this.formatWithSpaces(token, formattedQuery);
            }
            if (token.type !== types.TokenTypes.WHITESPACE) {
                _this.previousNonWhiteSpace = token;
            }
        });
        return formattedQuery;
    };
    Formatter.prototype.formatWhitespace = function (token, query) {
        if (this.cfg.linesBetweenQueries === 'preserve'
            && /((\r\n|\n)(\r\n|\n)+)/u.test(token.value)
            && this.previousToken().value === ';') {
            return query.replace(/(\n|\r\n)$/m, '') + token.value;
        }
        return query;
    };
    Formatter.prototype.formatReserved = function (token, query) {
        if (token.type === types.TokenTypes.RESERVED_NEWLINE
            && this.previousReservedWord
            && this.previousReservedWord.value
            && token.value.toUpperCase() === 'AND' &&
            this.previousReservedWord.value.toUpperCase() === 'BETWEEN') {
            token.type = types.TokenTypes.RESERVED;
        }
        if (token.type === types.TokenTypes.RESERVED_TOP_LEVEL) {
            query = this.formatTopLevelReservedWord(token, query);
        }
        else if (token.type === types.TokenTypes.RESERVED_TOP_LEVEL_NO_INDENT) {
            query = this.formatTopLevelReservedWordNoIndent(token, query);
        }
        else if (token.type === types.TokenTypes.RESERVED_NEWLINE) {
            query = this.formatNewlineReservedWord(token, query);
        }
        else {
            query = this.formatWithSpaces(token, query);
        }
        this.previousReservedWord = token;
        return query;
    };
    Formatter.prototype.formatLineComment = function (token, query) {
        return this.addNewline(query + token.value);
    };
    Formatter.prototype.formatBlockComment = function (token, query) {
        return this.addNewline(this.addNewline(query) + this.indentComment(token.value));
    };
    Formatter.prototype.indentComment = function (comment) {
        return comment.replace(/\n[ \t]*/gu, '\n' + this.indentation.getIndent() + ' ');
    };
    Formatter.prototype.formatTopLevelReservedWordNoIndent = function (token, query) {
        this.indentation.decreaseTopLevel();
        query = this.addNewline(query) + this.equalizeWhitespace(this.formatReservedWord(token.value));
        return this.addNewline(query);
    };
    Formatter.prototype.formatTopLevelReservedWord = function (token, query) {
        var shouldChangeTopLevel = (this.previousNonWhiteSpace.value !== ',' && !['GRANT'].includes(("" + this.previousNonWhiteSpace.value).toUpperCase()));
        if (shouldChangeTopLevel) {
            this.indentation.decreaseTopLevel();
            query = this.addNewline(query);
        }
        query = query + this.equalizeWhitespace(this.formatReservedWord(token.value)) + ' ';
        if (shouldChangeTopLevel)
            this.indentation.increaseTopLevel();
        return query;
    };
    Formatter.prototype.formatNewlineReservedWord = function (token, query) {
        return (this.addNewline(query) + this.equalizeWhitespace(this.formatReservedWord(token.value)) + ' ');
    };
    Formatter.prototype.equalizeWhitespace = function (value) {
        return value.replace(/\s+/gu, ' ');
    };
    Formatter.prototype.formatOpeningParentheses = function (token, query) {
        token.value = this.formatCase(token.value);
        var previousTokenType = this.previousToken().type;
        if (previousTokenType !== types.TokenTypes.WHITESPACE
            && previousTokenType !== types.TokenTypes.OPEN_PAREN
            && previousTokenType !== types.TokenTypes.LINE_COMMENT) {
            query = trimSpacesEnd(query);
        }
        query += token.value;
        this.inlineBlock.beginIfPossible(this.tokens, this.index);
        if (!this.inlineBlock.isActive()) {
            this.indentation.increaseBlockLevel();
            query = this.addNewline(query);
        }
        return query;
    };
    Formatter.prototype.formatClosingParentheses = function (token, query) {
        token.value = this.formatCase(token.value);
        if (this.inlineBlock.isActive()) {
            this.inlineBlock.end();
            return this.formatWithSpaceAfter(token, query);
        }
        else {
            this.indentation.decreaseBlockLevel();
            return this.formatWithSpaces(token, this.addNewline(query));
        }
    };
    Formatter.prototype.formatPlaceholder = function (token, query) {
        return query + this.params.get(token) + ' ';
    };
    Formatter.prototype.formatComma = function (token, query) {
        query = trimSpacesEnd(query) + token.value + ' ';
        if (this.inlineBlock.isActive()) {
            return query;
        }
        else if (/^LIMIT$/iu.test(this.previousReservedWord.value)) {
            return query;
        }
        else {
            return this.addNewline(query);
        }
    };
    Formatter.prototype.formatWithSpaceAfter = function (token, query) {
        return trimSpacesEnd(query) + token.value + ' ';
    };
    Formatter.prototype.formatWithoutSpaces = function (token, query) {
        return trimSpacesEnd(query) + token.value;
    };
    Formatter.prototype.formatWithSpaces = function (token, query) {
        var value = token.type === types.TokenTypes.RESERVED ? this.formatReservedWord(token.value) : token.value;
        return query + value + ' ';
    };
    Formatter.prototype.formatReservedWord = function (value) {
        return this.formatCase(value);
    };
    Formatter.prototype.formatQuerySeparator = function (token, query) {
        this.indentation.resetIndentation();
        var lines = '\n';
        if (this.cfg.linesBetweenQueries !== 'preserve') {
            lines = '\n'.repeat(this.cfg.linesBetweenQueries || 1);
        }
        return trimSpacesEnd(query) + token.value + lines;
    };
    Formatter.prototype.addNewline = function (query) {
        query = trimSpacesEnd(query);
        if (!query.endsWith('\n'))
            query += '\n';
        return query + this.indentation.getIndent();
    };
    Formatter.prototype.previousToken = function () {
        return this.tokens[this.index - 1] || { type: null, value: null };
    };
    Formatter.prototype.formatCase = function (value) {
        if (this.cfg.reservedWordCase === 'upper')
            return value.toUpperCase();
        if (this.cfg.reservedWordCase === 'lower')
            return value.toLowerCase();
        return value;
    };
    return Formatter;
}());
exports["default"] = Formatter;
});

var abstract = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var Tokenizer_1$1 = __importDefault(Tokenizer_1);
var Formatter_1$1 = __importDefault(Formatter_1);
var AbstractFormatter = (function () {
    function AbstractFormatter(cfg) {
        this.cfg = cfg;
    }
    AbstractFormatter.prototype.format = function (query) {
        return new Formatter_1$1["default"](this.cfg, this.tokenizer(), this.tokenOverride).format(query);
    };
    AbstractFormatter.prototype.tokenize = function (query) {
        return this.tokenizer().tokenize(query);
    };
    AbstractFormatter.prototype.tokenizer = function () {
        return new Tokenizer_1$1["default"](this.getTokenizerConfig());
    };
    return AbstractFormatter;
}());
exports["default"] = AbstractFormatter;
});

var Db2Formatter_1 = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var abstract_1 = __importDefault(abstract);
var Db2Formatter = (function (_super) {
    __extends(Db2Formatter, _super);
    function Db2Formatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Db2Formatter.prototype.getTokenizerConfig = function () {
        return {
            reservedWords: reservedWords,
            reservedTopLevelWords: reservedTopLevelWords,
            reservedNewlineWords: reservedNewlineWords,
            reservedTopLevelWordsNoIndent: reservedTopLevelWordsNoIndent,
            stringTypes: ["\"\"", "''", '``', '[]'],
            openParens: ['('],
            closeParens: [')'],
            indexedPlaceholderTypes: ['?'],
            namedPlaceholderTypes: [':'],
            lineCommentTypes: ['--'],
            specialWordChars: ['#', '@']
        };
    };
    return Db2Formatter;
}(abstract_1["default"]));
exports["default"] = Db2Formatter;
var reservedWords = [
    'ABS',
    'ACTIVATE',
    'ALIAS',
    'ALL',
    'ALLOCATE',
    'ALLOW',
    'ALTER',
    'ANY',
    'ARE',
    'ARRAY',
    'AS',
    'ASC',
    'ASENSITIVE',
    'ASSOCIATE',
    'ASUTIME',
    'ASYMMETRIC',
    'AT',
    'ATOMIC',
    'ATTRIBUTES',
    'AUDIT',
    'AUTHORIZATION',
    'AUX',
    'AUXILIARY',
    'AVG',
    'BEFORE',
    'BEGIN',
    'BETWEEN',
    'BIGINT',
    'BINARY',
    'BLOB',
    'BOOLEAN',
    'BOTH',
    'BUFFERPOOL',
    'BY',
    'CACHE',
    'CALL',
    'CALLED',
    'CAPTURE',
    'CARDINALITY',
    'CASCADED',
    'CASE',
    'CAST',
    'CCSID',
    'CEIL',
    'CEILING',
    'CHAR',
    'CHARACTER',
    'CHARACTER_LENGTH',
    'CHAR_LENGTH',
    'CHECK',
    'CLOB',
    'CLONE',
    'CLOSE',
    'CLUSTER',
    'COALESCE',
    'COLLATE',
    'COLLECT',
    'COLLECTION',
    'COLLID',
    'COLUMN',
    'COMMENT',
    'COMMIT',
    'CONCAT',
    'CONDITION',
    'CONNECT',
    'CONNECTION',
    'CONSTRAINT',
    'CONTAINS',
    'CONTINUE',
    'CONVERT',
    'CORR',
    'CORRESPONDING',
    'COUNT',
    'COUNT_BIG',
    'COVAR_POP',
    'COVAR_SAMP',
    'CREATE',
    'CROSS',
    'CUBE',
    'CUME_DIST',
    'CURRENT',
    'CURRENT_DATE',
    'CURRENT_DEFAULT_TRANSFORM_GROUP',
    'CURRENT_LC_CTYPE',
    'CURRENT_PATH',
    'CURRENT_ROLE',
    'CURRENT_SCHEMA',
    'CURRENT_SERVER',
    'CURRENT_TIME',
    'CURRENT_TIMESTAMP',
    'CURRENT_TIMEZONE',
    'CURRENT_TRANSFORM_GROUP_FOR_TYPE',
    'CURRENT_USER',
    'CURSOR',
    'CYCLE',
    'DATA',
    'DATABASE',
    'DATAPARTITIONNAME',
    'DATAPARTITIONNUM',
    'DATE',
    'DAY',
    'DAYS',
    'DB2GENERAL',
    'DB2GENRL',
    'DB2SQL',
    'DBINFO',
    'DBPARTITIONNAME',
    'DBPARTITIONNUM',
    'DEALLOCATE',
    'DEC',
    'DECIMAL',
    'DECLARE',
    'DEFAULT',
    'DEFAULTS',
    'DEFINITION',
    'DELETE',
    'DENSERANK',
    'DENSE_RANK',
    'DEREF',
    'DESCRIBE',
    'DESCRIPTOR',
    'DETERMINISTIC',
    'DIAGNOSTICS',
    'DISABLE',
    'DISALLOW',
    'DISCONNECT',
    'DISTINCT',
    'DO',
    'DOCUMENT',
    'DOUBLE',
    'DROP',
    'DSSIZE',
    'DYNAMIC',
    'EACH',
    'EDITPROC',
    'ELEMENT',
    'ELSE',
    'ELSEIF',
    'ENABLE',
    'ENCODING',
    'ENCRYPTION',
    'END',
    'END-EXEC',
    'ENDING',
    'ERASE',
    'ESCAPE',
    'EVERY',
    'EXCEPTION',
    'EXCLUDING',
    'EXCLUSIVE',
    'EXEC',
    'EXECUTE',
    'EXISTS',
    'EXIT',
    'EXP',
    'EXPLAIN',
    'EXTENDED',
    'EXTERNAL',
    'EXTRACT',
    'FALSE',
    'FENCED',
    'FETCH',
    'FIELDPROC',
    'FILE',
    'FILTER',
    'FINAL',
    'FIRST',
    'FLOAT',
    'FLOOR',
    'FOR',
    'FOREIGN',
    'FREE',
    'FULL',
    'FUNCTION',
    'FUSION',
    'GENERAL',
    'GENERATED',
    'GET',
    'GLOBAL',
    'GOTO',
    'GRANT',
    'GRAPHIC',
    'GROUP',
    'GROUPING',
    'HANDLER',
    'HASH',
    'HASHED_VALUE',
    'HINT',
    'HOLD',
    'HOUR',
    'HOURS',
    'IDENTITY',
    'IF',
    'IMMEDIATE',
    'IN',
    'INCLUDING',
    'INCLUSIVE',
    'INCREMENT',
    'INDEX',
    'INDICATOR',
    'INDICATORS',
    'INF',
    'INFINITY',
    'INHERIT',
    'INNER',
    'INOUT',
    'INSENSITIVE',
    'INSERT',
    'INT',
    'INTEGER',
    'INTEGRITY',
    'INTERSECTION',
    'INTERVAL',
    'INTO',
    'IS',
    'ISOBID',
    'ISOLATION',
    'ITERATE',
    'JAR',
    'JAVA',
    'KEEP',
    'KEY',
    'LABEL',
    'LANGUAGE',
    'LARGE',
    'LATERAL',
    'LC_CTYPE',
    'LEADING',
    'LEAVE',
    'LEFT',
    'LIKE',
    'LINKTYPE',
    'LN',
    'LOCAL',
    'LOCALDATE',
    'LOCALE',
    'LOCALTIME',
    'LOCALTIMESTAMP',
    'LOCATOR',
    'LOCATORS',
    'LOCK',
    'LOCKMAX',
    'LOCKSIZE',
    'LONG',
    'LOOP',
    'LOWER',
    'MAINTAINED',
    'MATCH',
    'MATERIALIZED',
    'MAX',
    'MAXVALUE',
    'MEMBER',
    'MERGE',
    'METHOD',
    'MICROSECOND',
    'MICROSECONDS',
    'MIN',
    'MINUTE',
    'MINUTES',
    'MINVALUE',
    'MOD',
    'MODE',
    'MODIFIES',
    'MODULE',
    'MONTH',
    'MONTHS',
    'MULTISET',
    'NAN',
    'NATIONAL',
    'NATURAL',
    'NCHAR',
    'NCLOB',
    'NEW',
    'NEW_TABLE',
    'NEXTVAL',
    'NO',
    'NOCACHE',
    'NOCYCLE',
    'NODENAME',
    'NODENUMBER',
    'NOMAXVALUE',
    'NOMINVALUE',
    'NONE',
    'NOORDER',
    'NORMALIZE',
    'NORMALIZED',
    'NOT',
    'NULL',
    'NULLIF',
    'NULLS',
    'NUMERIC',
    'NUMPARTS',
    'OBID',
    'OCTET_LENGTH',
    'OF',
    'OFFSET',
    'OLD',
    'OLD_TABLE',
    'ON',
    'ONLY',
    'OPEN',
    'OPTIMIZATION',
    'OPTIMIZE',
    'OPTION',
    'ORDER',
    'OUT',
    'OUTER',
    'OVER',
    'OVERLAPS',
    'OVERLAY',
    'OVERRIDING',
    'PACKAGE',
    'PADDED',
    'PAGESIZE',
    'PARAMETER',
    'PART',
    'PARTITION',
    'PARTITIONED',
    'PARTITIONING',
    'PARTITIONS',
    'PASSWORD',
    'PATH',
    'PERCENTILE_CONT',
    'PERCENTILE_DISC',
    'PERCENT_RANK',
    'PIECESIZE',
    'PLAN',
    'POSITION',
    'POWER',
    'PRECISION',
    'PREPARE',
    'PREVVAL',
    'PRIMARY',
    'PRIQTY',
    'PRIVILEGES',
    'PROCEDURE',
    'PROGRAM',
    'PSID',
    'PUBLIC',
    'QUERY',
    'QUERYNO',
    'RANGE',
    'RANK',
    'READ',
    'READS',
    'REAL',
    'RECOVERY',
    'RECURSIVE',
    'REF',
    'REFERENCES',
    'REFERENCING',
    'REFRESH',
    'REGR_AVGX',
    'REGR_AVGY',
    'REGR_COUNT',
    'REGR_INTERCEPT',
    'REGR_R2',
    'REGR_SLOPE',
    'REGR_SXX',
    'REGR_SXY',
    'REGR_SYY',
    'RELEASE',
    'RENAME',
    'REPEAT',
    'RESET',
    'RESIGNAL',
    'RESTART',
    'RESTRICT',
    'RESULT',
    'RESULT_SET_LOCATOR',
    'RETURN',
    'RETURNS',
    'REVOKE',
    'RIGHT',
    'ROLE',
    'ROLLBACK',
    'ROLLUP',
    'ROUND_CEILING',
    'ROUND_DOWN',
    'ROUND_FLOOR',
    'ROUND_HALF_DOWN',
    'ROUND_HALF_EVEN',
    'ROUND_HALF_UP',
    'ROUND_UP',
    'ROUTINE',
    'ROW',
    'ROWNUMBER',
    'ROWS',
    'ROWSET',
    'ROW_NUMBER',
    'RRN',
    'RUN',
    'SAVEPOINT',
    'SCHEMA',
    'SCOPE',
    'SCRATCHPAD',
    'SCROLL',
    'SEARCH',
    'SECOND',
    'SECONDS',
    'SECQTY',
    'SECURITY',
    'SENSITIVE',
    'SEQUENCE',
    'SESSION',
    'SESSION_USER',
    'SIGNAL',
    'SIMILAR',
    'SIMPLE',
    'SMALLINT',
    'SNAN',
    'SOME',
    'SOURCE',
    'SPECIFIC',
    'SPECIFICTYPE',
    'SQL',
    'SQLEXCEPTION',
    'SQLID',
    'SQLSTATE',
    'SQLWARNING',
    'SQRT',
    'STACKED',
    'STANDARD',
    'START',
    'STARTING',
    'STATEMENT',
    'STATIC',
    'STATMENT',
    'STAY',
    'STDDEV_POP',
    'STDDEV_SAMP',
    'STOGROUP',
    'STORES',
    'STYLE',
    'SUBMULTISET',
    'SUBSTRING',
    'SUM',
    'SUMMARY',
    'SYMMETRIC',
    'SYNONYM',
    'SYSFUN',
    'SYSIBM',
    'SYSPROC',
    'SYSTEM',
    'SYSTEM_USER',
    'TABLE',
    'TABLESAMPLE',
    'TABLESPACE',
    'THEN',
    'TIME',
    'TIMESTAMP',
    'TIMEZONE_HOUR',
    'TIMEZONE_MINUTE',
    'TO',
    'TRAILING',
    'TRANSACTION',
    'TRANSLATE',
    'TRANSLATION',
    'TREAT',
    'TRIGGER',
    'TRIM',
    'TRUE',
    'TRUNCATE',
    'TYPE',
    'UESCAPE',
    'UNDO',
    'UNIQUE',
    'UNKNOWN',
    'UNNEST',
    'UNTIL',
    'UPPER',
    'USAGE',
    'USER',
    'USING',
    'VALIDPROC',
    'VALUE',
    'VARCHAR',
    'VARIABLE',
    'VARIANT',
    'VARYING',
    'VAR_POP',
    'VAR_SAMP',
    'VCAT',
    'VERSION',
    'VIEW',
    'VOLATILE',
    'VOLUMES',
    'WHEN',
    'WHENEVER',
    'WHILE',
    'WIDTH_BUCKET',
    'WINDOW',
    'WITH',
    'WITHIN',
    'WITHOUT',
    'WLM',
    'WRITE',
    'XMLELEMENT',
    'XMLEXISTS',
    'XMLNAMESPACES',
    'YEAR',
    'YEARS'
];
var reservedTopLevelWords = [
    'ADD',
    'AFTER',
    'ALTER COLUMN',
    'ALTER TABLE',
    'DELETE FROM',
    'EXCEPT',
    'FETCH FIRST',
    'FROM',
    'GROUP BY',
    'GO',
    'HAVING',
    'INSERT INTO',
    'INTERSECT',
    'LIMIT',
    'ORDER BY',
    'SELECT',
    'SET CURRENT SCHEMA',
    'SET SCHEMA',
    'SET',
    'UPDATE',
    'VALUES',
    'WHERE'
];
var reservedTopLevelWordsNoIndent = ['INTERSECT', 'INTERSECT ALL', 'MINUS', 'UNION', 'UNION ALL'];
var reservedNewlineWords = [
    'AND',
    'CROSS JOIN',
    'INNER JOIN',
    'JOIN',
    'LEFT JOIN',
    'LEFT OUTER JOIN',
    'OR',
    'OUTER JOIN',
    'RIGHT JOIN',
    'RIGHT OUTER JOIN'
];
});

var N1qlFormatter_1 = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var abstract_1 = __importDefault(abstract);
var N1qlFormatter = (function (_super) {
    __extends(N1qlFormatter, _super);
    function N1qlFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    N1qlFormatter.prototype.getTokenizerConfig = function () {
        return {
            reservedWords: reservedWords,
            reservedTopLevelWords: reservedTopLevelWords,
            reservedNewlineWords: reservedNewlineWords,
            reservedTopLevelWordsNoIndent: reservedTopLevelWordsNoIndent,
            stringTypes: ["\"\"", "''", '``'],
            openParens: ['(', '[', '{'],
            closeParens: [')', ']', '}'],
            namedPlaceholderTypes: ['$'],
            lineCommentTypes: ['#', '--'],
            specialWordChars: []
        };
    };
    return N1qlFormatter;
}(abstract_1["default"]));
exports["default"] = N1qlFormatter;
var reservedWords = [
    'ALL',
    'ALTER',
    'ANALYZE',
    'AND',
    'ANY',
    'ARRAY',
    'AS',
    'ASC',
    'BEGIN',
    'BETWEEN',
    'BINARY',
    'BOOLEAN',
    'BREAK',
    'BUCKET',
    'BUILD',
    'BY',
    'CALL',
    'CASE',
    'CAST',
    'CLUSTER',
    'COLLATE',
    'COLLECTION',
    'COMMIT',
    'CONNECT',
    'CONTINUE',
    'CORRELATE',
    'COVER',
    'CREATE',
    'DATABASE',
    'DATASET',
    'DATASTORE',
    'DECLARE',
    'DECREMENT',
    'DELETE',
    'DERIVED',
    'DESC',
    'DESCRIBE',
    'DISTINCT',
    'DO',
    'DROP',
    'EACH',
    'ELEMENT',
    'ELSE',
    'END',
    'EVERY',
    'EXCEPT',
    'EXCLUDE',
    'EXECUTE',
    'EXISTS',
    'EXPLAIN',
    'FALSE',
    'FETCH',
    'FIRST',
    'FLATTEN',
    'FOR',
    'FORCE',
    'FROM',
    'FUNCTION',
    'GRANT',
    'GROUP',
    'GSI',
    'HAVING',
    'IF',
    'IGNORE',
    'ILIKE',
    'IN',
    'INCLUDE',
    'INCREMENT',
    'INDEX',
    'INFER',
    'INLINE',
    'INNER',
    'INSERT',
    'INTERSECT',
    'INTO',
    'IS',
    'JOIN',
    'KEY',
    'KEYS',
    'KEYSPACE',
    'KNOWN',
    'LAST',
    'LEFT',
    'LET',
    'LETTING',
    'LIKE',
    'LIMIT',
    'LSM',
    'MAP',
    'MAPPING',
    'MATCHED',
    'MATERIALIZED',
    'MERGE',
    'MISSING',
    'NAMESPACE',
    'NEST',
    'NOT',
    'NULL',
    'NUMBER',
    'OBJECT',
    'OFFSET',
    'ON',
    'OPTION',
    'OR',
    'ORDER',
    'OUTER',
    'OVER',
    'PARSE',
    'PARTITION',
    'PASSWORD',
    'PATH',
    'POOL',
    'PREPARE',
    'PRIMARY',
    'PRIVATE',
    'PRIVILEGE',
    'PROCEDURE',
    'PUBLIC',
    'RAW',
    'REALM',
    'REDUCE',
    'RENAME',
    'RETURN',
    'RETURNING',
    'REVOKE',
    'RIGHT',
    'ROLE',
    'ROLLBACK',
    'SATISFIES',
    'SCHEMA',
    'SELECT',
    'SELF',
    'SEMI',
    'SET',
    'SHOW',
    'SOME',
    'START',
    'STATISTICS',
    'STRING',
    'SYSTEM',
    'THEN',
    'TO',
    'TRANSACTION',
    'TRIGGER',
    'TRUE',
    'TRUNCATE',
    'UNDER',
    'UNION',
    'UNIQUE',
    'UNKNOWN',
    'UNNEST',
    'UNSET',
    'UPDATE',
    'UPSERT',
    'USE',
    'USER',
    'USING',
    'VALIDATE',
    'VALUE',
    'VALUED',
    'VALUES',
    'VIA',
    'VIEW',
    'WHEN',
    'WHERE',
    'WHILE',
    'WITH',
    'WITHIN',
    'WORK',
    'XOR'
];
var reservedTopLevelWords = [
    'DELETE FROM',
    'EXCEPT ALL',
    'EXCEPT',
    'EXPLAIN DELETE FROM',
    'EXPLAIN UPDATE',
    'EXPLAIN UPSERT',
    'FROM',
    'GROUP BY',
    'HAVING',
    'INFER',
    'INSERT INTO',
    'LET',
    'LIMIT',
    'MERGE',
    'NEST',
    'ORDER BY',
    'PREPARE',
    'SELECT',
    'SET CURRENT SCHEMA',
    'SET SCHEMA',
    'SET',
    'UNNEST',
    'UPDATE',
    'UPSERT',
    'USE KEYS',
    'VALUES',
    'WHERE'
];
var reservedTopLevelWordsNoIndent = ['INTERSECT', 'INTERSECT ALL', 'MINUS', 'UNION', 'UNION ALL'];
var reservedNewlineWords = [
    'AND',
    'INNER JOIN',
    'JOIN',
    'LEFT JOIN',
    'LEFT OUTER JOIN',
    'OR',
    'OUTER JOIN',
    'RIGHT JOIN',
    'RIGHT OUTER JOIN',
    'XOR'
];
});

var PlSqlFormatter_1 = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var abstract_1 = __importDefault(abstract);

var PlSqlFormatter = (function (_super) {
    __extends(PlSqlFormatter, _super);
    function PlSqlFormatter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tokenOverride = function (token, previousReservedToken) {
            if (token.type === types.TokenTypes.RESERVED_TOP_LEVEL &&
                previousReservedToken.value &&
                token.value.toUpperCase() === 'SET' &&
                previousReservedToken.value.toUpperCase() === 'BY') {
                token.type = types.TokenTypes.RESERVED;
                return token;
            }
        };
        return _this;
    }
    PlSqlFormatter.prototype.getTokenizerConfig = function () {
        return {
            reservedWords: reservedWords,
            reservedTopLevelWords: reservedTopLevelWords,
            reservedNewlineWords: reservedNewlineWords,
            reservedTopLevelWordsNoIndent: reservedTopLevelWordsNoIndent,
            stringTypes: ["\"\"", "N''", "''", '``'],
            openParens: ['(', 'CASE'],
            closeParens: [')', 'END'],
            indexedPlaceholderTypes: ['?'],
            namedPlaceholderTypes: [':'],
            lineCommentTypes: ['--'],
            specialWordChars: ['_', '$', '#', '.', '@']
        };
    };
    return PlSqlFormatter;
}(abstract_1["default"]));
exports["default"] = PlSqlFormatter;
var reservedWords = [
    'A',
    'ACCESSIBLE',
    'AGENT',
    'AGGREGATE',
    'ALL',
    'ALTER',
    'ANY',
    'ARRAY',
    'AS',
    'ASC',
    'AT',
    'ATTRIBUTE',
    'AUTHID',
    'AVG',
    'BETWEEN',
    'BFILE_BASE',
    'BINARY_INTEGER',
    'BINARY',
    'BLOB_BASE',
    'BLOCK',
    'BODY',
    'BOOLEAN',
    'BOTH',
    'BOUND',
    'BREADTH',
    'BULK',
    'BY',
    'BYTE',
    'C',
    'CALL',
    'CALLING',
    'CASCADE',
    'CASE',
    'CHAR_BASE',
    'CHAR',
    'CHARACTER',
    'CHARSET',
    'CHARSETFORM',
    'CHARSETID',
    'CHECK',
    'CLOB_BASE',
    'CLONE',
    'CLOSE',
    'CLUSTER',
    'CLUSTERS',
    'COALESCE',
    'COLAUTH',
    'COLLECT',
    'COLUMNS',
    'COMMENT',
    'COMMIT',
    'COMMITTED',
    'COMPILED',
    'COMPRESS',
    'CONNECT',
    'CONSTANT',
    'CONSTRUCTOR',
    'CONTEXT',
    'CONTINUE',
    'CONVERT',
    'COUNT',
    'CRASH',
    'CREATE',
    'CREDENTIAL',
    'CURRENT',
    'CURRVAL',
    'CURSOR',
    'CUSTOMDATUM',
    'DANGLING',
    'DATA',
    'DATE_BASE',
    'DATE',
    'DAY',
    'DECIMAL',
    'DEFAULT',
    'DEFINE',
    'DELETE',
    'DEPTH',
    'DESC',
    'DETERMINISTIC',
    'DIRECTORY',
    'DISTINCT',
    'DO',
    'DOUBLE',
    'DROP',
    'DURATION',
    'ELEMENT',
    'ELSIF',
    'EMPTY',
    'END',
    'ESCAPE',
    'EXCEPTIONS',
    'EXCLUSIVE',
    'EXECUTE',
    'EXISTS',
    'EXIT',
    'EXTENDS',
    'EXTERNAL',
    'EXTRACT',
    'FALSE',
    'FETCH',
    'FINAL',
    'FIRST',
    'FIXED',
    'FLOAT',
    'FOR',
    'FORALL',
    'FORCE',
    'FROM',
    'FUNCTION',
    'GENERAL',
    'GOTO',
    'GRANT',
    'GROUP',
    'HASH',
    'HEAP',
    'HIDDEN',
    'HOUR',
    'IDENTIFIED',
    'IF',
    'IMMEDIATE',
    'IN',
    'INCLUDING',
    'INDEX',
    'INDEXES',
    'INDICATOR',
    'INDICES',
    'INFINITE',
    'INSTANTIABLE',
    'INT',
    'INTEGER',
    'INTERFACE',
    'INTERVAL',
    'INTO',
    'INVALIDATE',
    'IS',
    'ISOLATION',
    'JAVA',
    'LANGUAGE',
    'LARGE',
    'LEADING',
    'LENGTH',
    'LEVEL',
    'LIBRARY',
    'LIKE',
    'LIKE2',
    'LIKE4',
    'LIKEC',
    'LIMITED',
    'LOCAL',
    'LOCK',
    'LONG',
    'MAP',
    'MAX',
    'MAXLEN',
    'MEMBER',
    'MERGE',
    'MIN',
    'MINUTE',
    'MLSLABEL',
    'MOD',
    'MODE',
    'MONTH',
    'MULTISET',
    'NAME',
    'NAN',
    'NATIONAL',
    'NATIVE',
    'NATURAL',
    'NATURALN',
    'NCHAR',
    'NEW',
    'NEXTVAL',
    'NOCOMPRESS',
    'NOCOPY',
    'NOT',
    'NOWAIT',
    'NULL',
    'NULLIF',
    'NUMBER_BASE',
    'NUMBER',
    'OBJECT',
    'OCICOLL',
    'OCIDATE',
    'OCIDATETIME',
    'OCIDURATION',
    'OCIINTERVAL',
    'OCILOBLOCATOR',
    'OCINUMBER',
    'OCIRAW',
    'OCIREF',
    'OCIREFCURSOR',
    'OCIROWID',
    'OCISTRING',
    'OCITYPE',
    'OF',
    'OLD',
    'ON',
    'ONLY',
    'OPAQUE',
    'OPEN',
    'OPERATOR',
    'OPTION',
    'ORACLE',
    'ORADATA',
    'ORDER',
    'ORGANIZATION',
    'ORLANY',
    'ORLVARY',
    'OTHERS',
    'OUT',
    'OVERLAPS',
    'OVERRIDING',
    'PACKAGE',
    'PARALLEL_ENABLE',
    'PARAMETER',
    'PARAMETERS',
    'PARENT',
    'PARTITION',
    'PASCAL',
    'PCTFREE',
    'PIPE',
    'PIPELINED',
    'PLS_INTEGER',
    'PLUGGABLE',
    'POSITIVE',
    'POSITIVEN',
    'PRAGMA',
    'PRECISION',
    'PRIOR',
    'PRIVATE',
    'PROCEDURE',
    'PUBLIC',
    'RAISE',
    'RANGE',
    'RAW',
    'READ',
    'REAL',
    'RECORD',
    'REF',
    'REFERENCE',
    'RELEASE',
    'RELIES_ON',
    'REM',
    'REMAINDER',
    'RENAME',
    'RESOURCE',
    'RESULT_CACHE',
    'RESULT',
    'RETURN',
    'RETURNING',
    'REVERSE',
    'REVOKE',
    'ROLLBACK',
    'ROW',
    'ROWID',
    'ROWNUM',
    'ROWTYPE',
    'SAMPLE',
    'SAVE',
    'SAVEPOINT',
    'SB1',
    'SB2',
    'SB4',
    'SEARCH',
    'SECOND',
    'SEGMENT',
    'SELF',
    'SEPARATE',
    'SEQUENCE',
    'SERIALIZABLE',
    'SHARE',
    'SHORT',
    'SIZE_T',
    'SIZE',
    'SMALLINT',
    'SOME',
    'SPACE',
    'SPARSE',
    'SQL',
    'SQLCODE',
    'SQLDATA',
    'SQLERRM',
    'SQLNAME',
    'SQLSTATE',
    'STANDARD',
    'START',
    'STATIC',
    'STDDEV',
    'STORED',
    'STRING',
    'STRUCT',
    'STYLE',
    'SUBMULTISET',
    'SUBPARTITION',
    'SUBSTITUTABLE',
    'SUBTYPE',
    'SUCCESSFUL',
    'SUM',
    'SYNONYM',
    'SYSDATE',
    'TABAUTH',
    'TABLE',
    'TDO',
    'THE',
    'THEN',
    'TIME',
    'TIMESTAMP',
    'TIMEZONE_ABBR',
    'TIMEZONE_HOUR',
    'TIMEZONE_MINUTE',
    'TIMEZONE_REGION',
    'TO',
    'TRAILING',
    'TRANSACTION',
    'TRANSACTIONAL',
    'TRIGGER',
    'TRUE',
    'TRUSTED',
    'TYPE',
    'UB1',
    'UB2',
    'UB4',
    'UID',
    'UNDER',
    'UNIQUE',
    'UNPLUG',
    'UNSIGNED',
    'UNTRUSTED',
    'USE',
    'USER',
    'USING',
    'VALIDATE',
    'VALIST',
    'VALUE',
    'VARCHAR',
    'VARCHAR2',
    'VARIABLE',
    'VARIANCE',
    'VARRAY',
    'VARYING',
    'VIEW',
    'VIEWS',
    'VOID',
    'WHENEVER',
    'WHILE',
    'WITH',
    'WORK',
    'WRAPPED',
    'WRITE',
    'YEAR',
    'ZONE'
];
var reservedTopLevelWords = [
    'ADD',
    'ALTER COLUMN',
    'ALTER TABLE',
    'BEGIN',
    'CONNECT BY',
    'DECLARE',
    'DELETE FROM',
    'DELETE',
    'END',
    'EXCEPT',
    'EXCEPTION',
    'FETCH FIRST',
    'FROM',
    'GROUP BY',
    'HAVING',
    'INSERT INTO',
    'INSERT',
    'LIMIT',
    'LOOP',
    'MODIFY',
    'ORDER BY',
    'SELECT',
    'SET CURRENT SCHEMA',
    'SET SCHEMA',
    'SET',
    'START WITH',
    'UPDATE',
    'VALUES',
    'WHERE'
];
var reservedTopLevelWordsNoIndent = ['INTERSECT', 'INTERSECT ALL', 'MINUS', 'UNION', 'UNION ALL'];
var reservedNewlineWords = [
    'AND',
    'CROSS APPLY',
    'CROSS JOIN',
    'ELSE',
    'END',
    'INNER JOIN',
    'JOIN',
    'LEFT JOIN',
    'LEFT OUTER JOIN',
    'OR',
    'OUTER APPLY',
    'OUTER JOIN',
    'RIGHT JOIN',
    'RIGHT OUTER JOIN',
    'WHEN',
    'XOR'
];
});

var StandardSqlFormatter_1 = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var abstract_1 = __importDefault(abstract);
var StandardSqlFormatter = (function (_super) {
    __extends(StandardSqlFormatter, _super);
    function StandardSqlFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StandardSqlFormatter.prototype.getTokenizerConfig = function () {
        return {
            reservedWords: reservedWords,
            reservedTopLevelWords: reservedTopLevelWords,
            reservedNewlineWords: reservedNewlineWords,
            reservedTopLevelWordsNoIndent: reservedTopLevelWordsNoIndent,
            stringTypes: ["\"\"", "N''", "''", '``', '[]'],
            openParens: ['(', 'CASE'],
            closeParens: [')', 'END'],
            indexedPlaceholderTypes: ['?'],
            namedPlaceholderTypes: ['@', ':', '%', '$'],
            lineCommentTypes: ['#', '--'],
            specialWordChars: []
        };
    };
    return StandardSqlFormatter;
}(abstract_1["default"]));
exports["default"] = StandardSqlFormatter;
var reservedWords = [
    'ACCESSIBLE',
    'ACTION',
    'AGAINST',
    'AGGREGATE',
    'ALGORITHM',
    'ALL',
    'ALTER',
    'ANALYSE',
    'ANALYZE',
    'AS',
    'ASC',
    'AUTOCOMMIT',
    'AUTO_INCREMENT',
    'BACKUP',
    'BEGIN',
    'BETWEEN',
    'BINLOG',
    'BOTH',
    'CASCADE',
    'CASE',
    'CHANGE',
    'CHANGED',
    'CHARACTER SET',
    'CHARSET',
    'CHECK',
    'CHECKSUM',
    'COLLATE',
    'COLLATION',
    'COLUMN',
    'COLUMNS',
    'COMMENT',
    'COMMIT',
    'COMMITTED',
    'COMPRESSED',
    'CONCURRENT',
    'CONSTRAINT',
    'CONTAINS',
    'CONVERT',
    'COUNT',
    'CREATE',
    'CROSS',
    'CURRENT_TIMESTAMP',
    'DATABASE',
    'DATABASES',
    'DAY_HOUR',
    'DAY_MINUTE',
    'DAY_SECOND',
    'DAY',
    'DEFAULT',
    'DEFINER',
    'DELAYED',
    'DELETE',
    'DESC',
    'DESCRIBE',
    'DETERMINISTIC',
    'DISTINCT',
    'DISTINCTROW',
    'DIV',
    'DO',
    'DROP',
    'DUMPFILE',
    'DUPLICATE',
    'DYNAMIC',
    'ELSE',
    'ENCLOSED',
    'END',
    'ENGINE',
    'ENGINES',
    'ENGINE_TYPE',
    'ESCAPE',
    'ESCAPED',
    'EVENTS',
    'EXEC',
    'EXECUTE',
    'EXISTS',
    'EXPLAIN',
    'EXTENDED',
    'FAST',
    'FETCH',
    'FIELDS',
    'FILE',
    'FIRST',
    'FIXED',
    'FLUSH',
    'FOR',
    'FORCE',
    'FOREIGN',
    'FULL',
    'FULLTEXT',
    'FUNCTION',
    'GLOBAL',
    'GRANTS',
    'GROUP_CONCAT',
    'HEAP',
    'HIGH_PRIORITY',
    'HOSTS',
    'HOUR',
    'HOUR_MINUTE',
    'HOUR_SECOND',
    'IDENTIFIED',
    'IF',
    'IFNULL',
    'IGNORE',
    'IN',
    'INDEX',
    'INDEXES',
    'INFILE',
    'INSERT',
    'INSERT_ID',
    'INSERT_METHOD',
    'INTERVAL',
    'INTO',
    'INVOKER',
    'IS',
    'ISOLATION',
    'KEY',
    'KEYS',
    'KILL',
    'LAST_INSERT_ID',
    'LEADING',
    'LEVEL',
    'LIKE',
    'LINEAR',
    'LINES',
    'LOAD',
    'LOCAL',
    'LOCK',
    'LOCKS',
    'LOGS',
    'LOW_PRIORITY',
    'MARIA',
    'MASTER',
    'MASTER_CONNECT_RETRY',
    'MASTER_HOST',
    'MASTER_LOG_FILE',
    'MATCH',
    'MAX_CONNECTIONS_PER_HOUR',
    'MAX_QUERIES_PER_HOUR',
    'MAX_ROWS',
    'MAX_UPDATES_PER_HOUR',
    'MAX_USER_CONNECTIONS',
    'MEDIUM',
    'MERGE',
    'MINUTE',
    'MINUTE_SECOND',
    'MIN_ROWS',
    'MODE',
    'MONTH',
    'MRG_MYISAM',
    'MYISAM',
    'NAMES',
    'NATURAL',
    'NOT',
    'NOW()',
    'NULL',
    'OFFSET',
    'ON DELETE',
    'ON UPDATE',
    'ON',
    'ONLY',
    'OPEN',
    'OPTIMIZE',
    'OPTION',
    'OPTIONALLY',
    'OUTFILE',
    'PACK_KEYS',
    'PAGE',
    'PARTIAL',
    'PARTITION',
    'PARTITIONS',
    'PASSWORD',
    'PRIMARY',
    'PRIVILEGES',
    'PROCEDURE',
    'PROCESS',
    'PROCESSLIST',
    'PURGE',
    'QUICK',
    'RAID0',
    'RAID_CHUNKS',
    'RAID_CHUNKSIZE',
    'RAID_TYPE',
    'RANGE',
    'READ',
    'READ_ONLY',
    'READ_WRITE',
    'REFERENCES',
    'REGEXP',
    'RELOAD',
    'RENAME',
    'REPAIR',
    'REPEATABLE',
    'REPLACE',
    'REPLICATION',
    'RESET',
    'RESTORE',
    'RESTRICT',
    'RETURN',
    'RETURNS',
    'REVOKE',
    'RLIKE',
    'ROLLBACK',
    'ROW',
    'ROWS',
    'ROW_FORMAT',
    'SECOND',
    'SECURITY',
    'SEPARATOR',
    'SERIALIZABLE',
    'SESSION',
    'SHARE',
    'SHOW',
    'SHUTDOWN',
    'SLAVE',
    'SONAME',
    'SOUNDS',
    'SQL',
    'SQL_AUTO_IS_NULL',
    'SQL_BIG_RESULT',
    'SQL_BIG_SELECTS',
    'SQL_BIG_TABLES',
    'SQL_BUFFER_RESULT',
    'SQL_CACHE',
    'SQL_CALC_FOUND_ROWS',
    'SQL_LOG_BIN',
    'SQL_LOG_OFF',
    'SQL_LOG_UPDATE',
    'SQL_LOW_PRIORITY_UPDATES',
    'SQL_MAX_JOIN_SIZE',
    'SQL_NO_CACHE',
    'SQL_QUOTE_SHOW_CREATE',
    'SQL_SAFE_UPDATES',
    'SQL_SELECT_LIMIT',
    'SQL_SLAVE_SKIP_COUNTER',
    'SQL_SMALL_RESULT',
    'SQL_WARNINGS',
    'START',
    'STARTING',
    'STATUS',
    'STOP',
    'STORAGE',
    'STRAIGHT_JOIN',
    'STRING',
    'STRIPED',
    'SUPER',
    'TABLE',
    'TABLES',
    'TEMPORARY',
    'TERMINATED',
    'THEN',
    'TO',
    'TRAILING',
    'TRANSACTIONAL',
    'TRIGGER',
    'TRUE',
    'TRUNCATE',
    'TYPE',
    'TYPES',
    'UNCOMMITTED',
    'UNIQUE',
    'UNLOCK',
    'UNSIGNED',
    'USAGE',
    'USE',
    'USING',
    'VARIABLES',
    'VIEW',
    'WHEN',
    'WITH',
    'WORK',
    'WRITE',
    'YEAR_MONTH',
];
var reservedTopLevelWords = [
    'ADD',
    'AFTER',
    'ALTER COLUMN',
    'ALTER TABLE',
    'CREATE OR REPLACE',
    'DECLARE',
    'DELETE FROM',
    'EXCEPT',
    'FETCH FIRST',
    'FROM',
    'GO',
    'GRANT',
    'GROUP BY',
    'HAVING',
    'INSERT INTO',
    'INSERT',
    'LIMIT',
    'MODIFY',
    'ORDER BY',
    'RETURNING',
    'SELECT',
    'SET CURRENT SCHEMA',
    'SET SCHEMA',
    'SET',
    'UPDATE',
    'VALUES',
    'WHERE',
];
var reservedTopLevelWordsNoIndent = ['INTERSECT ALL', 'INTERSECT', 'MINUS', 'UNION ALL', 'UNION'];
var reservedNewlineWords = [
    'AND',
    'CROSS APPLY',
    'CROSS JOIN',
    'ELSE',
    'INNER JOIN',
    "FULL JOIN",
    "FULL OUTER JOIN",
    'LEFT JOIN',
    'LEFT OUTER JOIN',
    'NATURAL JOIN',
    'OR',
    'OUTER APPLY',
    'OUTER JOIN',
    'RENAME',
    'RIGHT JOIN',
    'RIGHT OUTER JOIN',
    'JOIN',
    'WHEN',
    'XOR',
];
});

var sqlFormatter = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.tokenize = exports.format = void 0;
var Db2Formatter_1$1 = __importDefault(Db2Formatter_1);
var N1qlFormatter_1$1 = __importDefault(N1qlFormatter_1);
var PlSqlFormatter_1$1 = __importDefault(PlSqlFormatter_1);
var StandardSqlFormatter_1$1 = __importDefault(StandardSqlFormatter_1);
exports.format = function (query, cfg) {
    if (cfg === void 0) { cfg = {}; }
    switch (cfg.language) {
        case 'db2':
            return new Db2Formatter_1$1["default"](cfg).format(query);
        case 'n1ql':
            return new N1qlFormatter_1$1["default"](cfg).format(query);
        case 'pl/sql':
            return new PlSqlFormatter_1$1["default"](cfg).format(query);
        case 'sql':
        default:
            return new StandardSqlFormatter_1$1["default"](cfg).format(query);
    }
};
exports.tokenize = function (query, cfg) {
    if (cfg === void 0) { cfg = {}; }
    return new StandardSqlFormatter_1$1["default"](cfg).tokenize(query);
};
exports["default"] = {
    format: exports.format,
    tokenize: exports.tokenize
};
});

var sqlFormatter$1 = /*@__PURE__*/getDefaultExportFromCjs(sqlFormatter);

export { sqlFormatter$1 as default };

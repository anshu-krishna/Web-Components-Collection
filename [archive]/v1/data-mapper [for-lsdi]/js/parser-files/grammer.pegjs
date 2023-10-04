// ----- Format Grammer -----
Exp "Txt-Exp Chain" = pre:Txt? cols:OneExp* {
		let ret = [];
		if(pre !== "") {
			ret.push({ty: "txt", val: pre});
		}
		for(const c of cols) {
			ret.push(c[0]);
			if(c[1] !== "") {
				ret.push({ty: "txt", val: c[1]});
			}
		}
		return ret;
	}
OneExp "Expression" = "{" _ col:ColID _ maps:Func* _ "}" post:Txt?
	{return [{ty: "exp", col:col, maps:maps}, post ?? ''] }
ColID "ColID" = SimpleInt { return parseInt(text()); } / String
Func "Function"
	= _ "=>" _ func:KeyChain args:(
		_ "(" _ args:(
			head:Value tail:(Comma v:Value {return v;})* Comma? {return [head, ...tail ]; }
		)?  _ ")" _ { return args ?? []; }
	)? {return { func:func, args:args ?? [] };}

// ----- JSON Grammer -----
// ----- Value -----
Value "Value" = False / Null / True / Object / Array / Number / String

Null "Null" = _ "null" _ { return null; }
//Bool "bool" = True / False
False "False" = _ "false" _ { return false; }
True "True" = _ "true" _ { return true; }

// ----- Object -----
Object "Object"
	= _ "{" _ prop:(
		head:KeyVal tail:(Comma m:KeyVal { return m; })*
			{ return Object.fromEntries([head, ...tail]);}
	)? Comma? _ "}" _ { return prop ?? {}; }
KeyVal "{Key:Value}" = name:(String / KeyChain) Colon value:Value
	{ return [ name, value]; }
KeyChain "Key-Chain" = Key ("." Key)* { return text(); }
Key "Key" = ([_a-z$]i [0-9a-z$_]i*) { return text(); }
Colon = _ ":" _
// ----- Array -----
Array "Array"
	= _ "[" _ values:(
		head:Value tail:(Comma v:Value { return v; })* { return [head, ...tail ]; }
	)? Comma? _ "]" _ { return values ?? []; }

// ----- Number -----
Number "Number" = "-"? SimpleInt ("." Digit+)? ([eE] ("-" / "+")? Digit+)?
	{ return parseFloat(text()); }
//  <exp = [eE] ("-" / "+")? DIGIT+>  <frac = "." DIGIT+>
SimpleInt = "0" / ([1-9] Digit*)

// ----- String -----
String "String"
	= '"' chars:CharDQ* '"' { return chars.join(""); }
	/ "'" chars:CharSQ* "'" { return chars.join(""); }
	/ '`' chars:CharBQ* '`' { return chars.join(""); }
CharDQ
	= [^\0-\x1F\x5C\x22]
	/ esc:EscChar { return esc; }
CharSQ
	= [^\0-\x1F\x5C\x27]
	/ esc:EscChar { return esc; }
CharBQ
	= [^\0-\x1F\x5C\x60]
	/ esc:EscChar { return esc; }
EscChar "Escaped-Char"
	= '\\\\' {return '\\'; }
	/ '\\"' {return '"'; }
	/ "\\'" {return "'"; }
	/ '\\`' {return "`"; }
	/ '\\b' {return "\b"; }
	/ '\\f' {return "\f"; }
	/ '\\n' {return "\n"; }
	/ '\\r' {return "\r"; }
	/ '\\t' {return "\t"; }
	/ "\\u" digits:$(HexDig HexDig HexDig HexDig)
		{ return String.fromCharCode(parseInt(digits, 16)); }

// ----- Other -----
Txt "Text" = txt:([^\\{] / "\\{" { return "\x7B"; } / esc:EscChar
	{ return esc; })* {return txt.join(""); }
Digit "Digit[0-9]" = [0-9]
Comma = _ "," _
_ "Whitespace" = [ \t\n\r]*
HexDig = [0-9a-f]i
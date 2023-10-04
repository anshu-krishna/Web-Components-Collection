# Data Mapper
A GUI (web-component) for mapping output columns of table-data as various combination of input columns.

The library also allows you to process column values in extensive ways before using them.

---
***Note:*** *All examples use the following data as input.*

|Col→|0|1|2|3|4|5|6|7|8|
|-|-|-|-|-|-|-|-|-|-|
|**Row↓**|**First Name**|**Last Name**|**Email**|**Gender**|**Street**|**City**|**Country**|**Lat**|**Long**|
|**0**|Binky|Mullinder|bmullinder0@nymag.com|Female|Grayhawk|Yunluo|China|23.24772|116.083951|
|**1**|Natale|Gonet|ngonet1@si.edu|Female|Grover|Bearna|Ireland|53.2993199|-6.2340942|
|**2**|Sheba|Alexandrou|salexandrou2@shop-pro.jp|Female|Vermont|Tiabaya|Peru|-16.4359692|-71.6050339|
|**3**|Shaughn|Killeley|skilleley3@cpanel.net|Female|Bellgrove|Kenyau|Indonesia|-1.4580748|114.4108587|
|**4**|Rea|Lissenden|rlissenden4@soup.io|Female|Elmside|Zelenogorsk|Russia|60.1967148|29.7006916|

---
## How-To Define Format (Basic):

- A expresstion is a reference to a input column. It is enclosed in `{}`. eg: ```{write_expression_here}```

- Anything outside the expression is a constant. eg: `this is a constant{expression}this is another constant`

- A column can be refrenced by its column number or its column name. eg: 'First Name' column is ```{0}``` or ```{`First Name`}```

- Format is collection of 'constants' and 'expressions' eg:

	|**Format**|**Sample Result (for row {0})**|
	|-|-|
	|{0}|Binky|
	|{0} {1}|Binky Mullinder|
	|ABC {0} PQR {1} XYZ|ABC Binky PQR Mullinder XYZ|

---
## How-To Define Format (Advanced):

- A column expression can be further transformed using the provided mapper functions.
- Syntax for mapper function is ```=> func_name``` or ```=> func_name(parameter_1, parameter_2, ...)``` eg:
	
	|**Format**|**Sample Result (for row {0})**|
	|-|-|
	|{ \`Lat\` => num.round(3) }|23.248|
	|{ 0 => str.lower }|binky|

- Mapper functions can be chained. eg:
	
	|**Format**|**Sample Result (for row {0})**|
	|-|-|
	|{ \`Lat\` => num.add(50) => num.round(3) }|73.248|
	|{ \'First Name\' => str.at(0) => str.lower }|b|

---
## Supported mapper functions:

|Function|Description|Signatue|Example|Result [Row 0, Row 1, ...]|
|-|-|-|-|-|
|**switch**|Compares with 'key'. On match returns 'value'. When no 'key' is matched returns 'default' value.|`(default = null, ...pairs)`|`{ 0 => str.at(0) => switch('not s or n', ['N', 'is n'], ['S', 'is s']) }`|"not s or n", "is n", "is s", "is s", "not s or n"|
|**str**|Converts value to string|`()`|`{ 7 => str}`|"23.24772", "53.2993199", ...|
|**str.slice**|Gets part of string by 'start' and 'end' position.|`(start = 0, end = null)`|`{ 6 => str.slice(0,2)}`|"Ch", "Ir", "Pe", ...|
|**str.part**|Gets part of string by 'start' position and 'length'.|`(start = 0, length = null)`|`{ 6 => str.part(1,3) }`|"hin", "rel", "eru", ...|
|**str.trim**|Removes white-space from front and end of string|`()`|`{ 0 => str.trim }`|"Binky", "Natale", "Sheba", ...|
|**str.trim.l**|Removes white-space from front of string|`()`|`{ 0 => str.trim.l }`|"Binky", "Natale", "Sheba", ...|
|**str.trim.r**|Removes white-space from end of string|`()`|`{ 0 => str.trim.r }`|"Binky", "Natale", "Sheba", ...|
|**str.pad.l**|Pads string with given value at front|`(maxLength, padWith = ' ')`|`{ 0 => str.pad.l(7, '0') }`|"00Binky", "0Natale", "00Sheba"|
|**str.pad.r**|Pads string with given value at end|`(maxLength, padWith = ' ')`|`{ 0 => str.pad.r(7, '0') }`|"Binky00", "Natale0", "Sheba00"|
|**str.upper**|Converts string to upper-case|`()`|`{ 0 => str.upper }`|"BINKY", "NATALE", "SHEBA", ...|
|**str.lower**|Converts string to lower-case|`()`|`{ 0 => str.lower }`|"binky", "natale", "sheba", ...|
|**str.title**|Converts string to title-case|`()`|`{ 0 => str.title }`|"Binky", "Natale", "Sheba", ...|
|**str.replace**|Search and replace parts of string|`(search = '', replace = '')`|`{ 0 => str.replace('a', 'oo') }`|"Binky", "Nootoole", "Sheboo", "Shooughn", "Reoo"|
|**str.at**|Get character at a specific index of string|`(index = 0)`|`{ 0 => str.at(2) }`|"n", "t", "e", "a", "a"|
|**num**|Convert string to number|`()`|`{ 7 => num }`|23.24772, 53.2993199, -16.4359692, ...|
|**num.add**|Add a number to the value|`(num = 0)`|`{ 7 => num.add(100) }`|123.24772, 153.2993199, 83.5640308, ...|
|**num.sub**|Substract a number from the value|`(num = 0)`|`{ 7 => num.sub(100) }`|-76.75228, -46.7006801, -116.4359692, ...|
|**num.mul**|Mulltiply the value with a number|`(num = 1)`|`{ 7 => num.mul(10) }`|232.4772, 532.993199, -164.359692, ...|
|**num.div**|Divide the value with a number|`(num = 1)`|`{ 7 => num.div(2) }`|11.62386, 26.64965995, -8.2179846, ...|
|**num.mod**|Value modulus with number|`(num = 2)`|`{ 7 => num.mod(100) }`|23.24772, 53.2993199, -16.4359692, ...|
|**num.exp**|Raise the value to a number|`(num = 1)`|`{ 7 => num.exp(2) }`|540.4564851984001, 2840.817501802536, ...|
|**num.round**|Round the value to fixed precision|`(size = 2)`|`{ 7 => num.round(2) }`|23.25, 53.30, -16.44, ...|
|**num.in_range**|Check if number is in given range|`(min = null, max = null)`|`{ 7 => num.in_range(50, 70) }`|false, true, false, false, true|
|**bool**|Convert string to boolean|`()`|`{ 0 => str.at(0) => switch(0, ['S', 1]) => bool }`|false, false, true, true, false|
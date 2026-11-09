// Run with: node test.js
const { evaluate, format } = require("./calc.js");

const cases = [
  ["2+3×4", "14"], ["(2+3)×4", "20"], ["2^3^2", "512"], ["-2^2", "-4"], ["10÷4", "2.5"],
  ["0.1+0.2", "0.3"], ["sin(30)", "0.5"], ["cos(60)", "0.5"], ["tan(45)", "1"], ["sin(180)", "0"],
  ["asin(1)", "90"], ["√(16)+√(9)", "7"], ["log(1000)", "3"], ["ln(e)", "1"], ["5!", "120"],
  ["2π", "6.28318530718"], ["3(4+1)", "15"], ["2sin(30)", "1"], ["abs(-7)", "7"], ["1e3+1", "1001"],
];
const errors = ["1÷0", "tan(90)", "√(-4)", "log(0)", "(2+3", "2++", "3.5!", "171!", "foo(2)"];

let pass = 0;
for (const [expr, want] of cases) {
  const got = format(evaluate(expr));
  console.log(`${got === want ? "PASS" : "FAIL"}  ${expr} = ${got}`);
  if (got === want) pass++;
}
for (const expr of errors) {
  try { evaluate(expr); console.log(`FAIL  ${expr} should be an error`); }
  catch (e) { console.log(`PASS  ${expr} → ${e.message}`); pass++; }
}
console.log(`\n${pass} / ${cases.length + errors.length} tests passed`);
process.exitCode = pass === cases.length + errors.length ? 0 : 1;

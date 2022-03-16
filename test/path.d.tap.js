"uses strict";
import test from "tap";
import { Path } from "../dist/index.js";
import { enum_path_data, test_segment } from "./path.utils.js";
import "./utils.js";
const CI = !!process.env.CI;

test.test(`path parse`, { bail: !CI }, function (t) {
	// let p = Path.parse("M3");
	t.throws(() => Path.parse("M3"));

	t.end();
});

export interface DescParams {
	relative?: boolean;
	smooth?: boolean;
	short?: boolean;
	close?: boolean;
	dfix?: number;
}


export function tCheck(t: number) {
	if (t > 1) {
		return 1;
	} else if (t < 0) {
		return 0;
	}
	// if (t < 0 || t > 1) {
	// 	throw new RangeError(`"t" must be between 0 and 1 (${t})`);
	// }
	return t;
}

export function tNorm(t: number) {
	if (t < 0) {
		t = 1 + (t % 1);
	} else if (t > 1) {
		if (0 == (t = t % 1)) {
			t = 1;
		}
	}
	return t;
}

import randomString = require("random-string");

export function randomName(prefix?: string) {
	const name = randomString({ length: 20 });
	if (prefix) {
		return prefix + name;
	}
	return name;
}

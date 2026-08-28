export function encodeRle(values: Uint16Array): number[] {
	if (values.length === 0) return [];
	const encoded: number[] = [];
	let value = values[0];
	let count = 1;
	for (let index = 1; index < values.length; index += 1) {
		if (values[index] === value && count < 0xffffffff) {
			count += 1;
		} else {
			encoded.push(value, count);
			value = values[index];
			count = 1;
		}
	}
	encoded.push(value, count);
	return encoded;
}

export function decodeRle(encoded: number[], expectedLength?: number): Uint16Array {
	if (encoded.length % 2 !== 0) throw new Error('Data RLE tidak valid.');
	let length = 0;
	for (let index = 1; index < encoded.length; index += 2) {
		if (!Number.isInteger(encoded[index]) || encoded[index] < 1) throw new Error('Panjang RLE tidak valid.');
		length += encoded[index];
	}
	if (expectedLength !== undefined && length !== expectedLength) throw new Error('Jumlah sel file proyek tidak cocok.');
	const result = new Uint16Array(length);
	let cursor = 0;
	for (let index = 0; index < encoded.length; index += 2) {
		const value = encoded[index];
		const count = encoded[index + 1];
		if (!Number.isInteger(value) || value < 0 || value > 0xffff) throw new Error('Slot warna RLE tidak valid.');
		result.fill(value, cursor, cursor + count);
		cursor += count;
	}
	return result;
}

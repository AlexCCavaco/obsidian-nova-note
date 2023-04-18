
export function randomCode(length:number=11){
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export function getAlphanumericFor(num:number):string {
	let arr = "abcdefghijklmnopqrstuvwxyz";
	let count = 0; let count2 = 0;
	while(num > arr.length-1){ count++; num-= arr.length-1; }
	while(count > arr.length-1){ count2++; count-= arr.length-1; }
	while(count2 > arr.length-1){ count2-= arr.length-1; }
	return (count2?(arr[count2]??'+'):'') + (count?arr[count]:'') + arr[num];
}

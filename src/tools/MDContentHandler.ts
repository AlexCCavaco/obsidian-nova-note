import { NovaContent } from "../components/NovaContent";

export type BlockData = {
	type: string,
	opts: { [key:string]:any },
	views: {
		id: string,
		name: string,
		type: string,
		opts: { [key:string]:any }
	}[]
};

export type ContentData = {
	context: 'heading'|'paragraph'|'list'|'code'|'blockquote',
	data: { content:string,check?:string,type?:string }[]
}

export function handleBlockData(novaContent:NovaContent,data:string[]):BlockData|null {
	if(data.length<=0) return null;
	let header = data[0];
	let match = header.match(/^nova-(.*?)(?:::(.*?))?$/);
	let block:BlockData = {
		type: match&&match[1] ? match[1] : '',
		opts: match ? getOpts(match[2]) : {},
		views: []
	}
	data.shift();
	if(data.length > 0){
		data.map(e=>e.match(/(.*?)::(.*?)::(.*?)(?:::(.*)$|$)/)).forEach((match=>{
			if(!match||match.length<2){ console.warn('NovaNote: View Option malformatted, skiping and overriding'); return; }
			block.views.push({ id: match[1], name: match[2], type: match[3], opts: getOpts(match[4]) });
		}));
	}
	if(data.length===0||block.views.length===0){
		console.warn('NovaNote: Block has no View, a default view will be created');
		block.views.push({ id: novaContent.generateViewId(), name: 'Untitled', type: 'list', opts: {} });
	}
	return block;
}

function getOpts(data:string|undefined|null):{ [key:string]:any } {
	if(!data) return {};
	let matches = data.matchAll(/(.+?):(.+?)(?:\||$)/g);
	let opts:{ [key:string]:any } = {};
	for(let match of matches){
		if(!match||match.length<2) continue;
		opts[match[1]] = opts[2];
	}
	return opts;
}

export function processParagraph(novaContent:NovaContent,data:string[]):ContentData|null {
	return { context:'paragraph',data:data.map(line=>({ content:line.trim() })) };
}

export function processHeading(novaContent:NovaContent,data:string[]):ContentData|null {
	let content = data.map(line=>line.trim()).join(' ');
	let index = 0; while(content.charAt(index)==="#") index++;
	return { context:'heading',data:[{ content,type:index.toString() }] };
}

export function processList(novaContent:NovaContent,data:string[]):ContentData|null {
	let listData = data.map(line=>{
		let index = 0; while(line.charAt(index)==="\t") index++;
		line = line.trim().slice(1).trim();
		let check = undefined;
		if(line[0]==="["){
			check = line[1];
			line = line.slice(3).trim();
		}
		return { content:line,type:(index-1).toString(),check:check??undefined };
	});
	return { context:'list',data:listData };
}

export function processBlockquote(novaContent:NovaContent,data:string[]):ContentData|null {
	return null;
}

export function processCode(novaContent:NovaContent,data:string[]):ContentData|null {
	return null;
}

export function processBreak(novaContent:NovaContent,data:string[]):ContentData|null {
	return null;
}

export function processFootnote(novaContent:NovaContent,data:string[]):ContentData|null {
	return null;
}

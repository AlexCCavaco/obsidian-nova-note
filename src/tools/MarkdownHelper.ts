import { marked } from "marked";
import { fromTextArea,cm_t } from "hypermd";
import * as CodeMirror from "codemirror";
/**/ require("codemirror/mode/htmlmixed/htmlmixed");
/**/ require("codemirror/mode/stex/stex");
/**/ require("hypermd/powerpack/fold-math-with-katex");
/**/ require("hypermd/powerpack/hover-with-marked");

const DOMPurify = require('dompurify');
export type HyperEditor = CodeMirror.Editor;

export function parseMarkdown(data:string):string {
	return DOMPurify.sanitize(marked.parse(data));
}

export function hyper(elm:HTMLTextAreaElement):cm_t {
	return fromTextArea(elm);
}

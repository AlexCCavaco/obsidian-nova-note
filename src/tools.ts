
export const isAsync = (func:()=>any)=>(func.constructor.name === "AsyncFunction");

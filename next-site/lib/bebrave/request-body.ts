/** Bound untrusted lockbox input even when Content-Length is missing. */
export async function readLockboxBody(request:Request):Promise<{sessionId?:unknown;code?:unknown}> {
  const reader=request.body?.getReader();
  if(!reader)throw new Error("Nothing happened.");
  let size=0;
  const chunks:Uint8Array[]=[];
  try {
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();throw new Error("Nothing happened.");}chunks.push(value);}
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const body:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
  if(!body||typeof body!=="object"||Array.isArray(body))throw new Error("Nothing happened.");
  return body;
}

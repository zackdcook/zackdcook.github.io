import ts from "typescript";

const normalize=text=>text.replace(/\s+/g," ").trim();
export function authoredCopy(source,filename){
  const tree=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const copy=new Set();
  const add=value=>{const normalized=normalize(value);if(normalized)copy.add(normalized);};
  const visibleAttributes=new Set(["aria-label","alt","title","placeholder"]);
  function walk(node){
    if(ts.isJsxText(node))add(node.text);
    if(ts.isJsxAttribute(node)&&visibleAttributes.has(node.name.text)&&node.initializer&&ts.isStringLiteral(node.initializer))add(node.initializer.text);
    if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&["setCacheMessage","setProblem"].includes(node.expression.text)){
      for(const arg of node.arguments)if(ts.isStringLiteral(arg)||ts.isNoSubstitutionTemplateLiteral(arg))add(arg.text);
    }
    ts.forEachChild(node,walk);
  }
  walk(tree);return [...copy].sort();
}

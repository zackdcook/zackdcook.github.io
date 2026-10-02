"""Build deterministic numeric outlines from the bundled OFL fonts.

Run with fontTools installed. This is a build-time authoring utility, not a
runtime service. Literal outlines serve both the preview and collision checks.
"""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
FONTS = {"caveat": "Caveat-Variable", "handlee": "Handlee-Regular", "allura": "Allura-Regular", "kalam": "Kalam-Regular", "patrickhand": "PatrickHand-Regular"}

def simplify(points, tolerance):
    if len(points)<3: return points
    a,b=points[0],points[-1]; dx=b[0]-a[0]; dy=b[1]-a[1]
    def distance(p):
        t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
        return ((p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2)**.5
    index=max(range(1,len(points)-1),key=lambda i:distance(points[i]))
    if distance(points[index])<=tolerance: return [a,b]
    return simplify(points[:index+1],tolerance)[:-1]+simplify(points[index:],tolerance)

class FlattenPen(BasePen):
    def __init__(self, glyphs):
        super().__init__(glyphs); self.contours = []; self.current = []
    def _moveTo(self, p): self.current = [p]
    def _lineTo(self, p): self.current.append(p)
    def _qCurveToOne(self, b, c):
        a = self._getCurrentPoint()
        for i in range(1, 13):
            t = i / 12; s = 1-t
            self.current.append((s*s*a[0]+2*s*t*b[0]+t*t*c[0], s*s*a[1]+2*s*t*b[1]+t*t*c[1]))
    def _curveToOne(self, b, c, d):
        a = self._getCurrentPoint()
        for i in range(1, 17):
            t = i/16; s=1-t
            self.current.append((s**3*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t**3*d[0], s**3*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t**3*d[1]))
    def _closePath(self):
        if len(self.current)>2: self.contours.append(self.current)
        self.current=[]
    def _endPath(self): self._closePath()

out = ROOT / 'public/fonts/geometry'; out.mkdir(parents=True, exist_ok=True)
codes = list(range(32, 592)) + [0x2018,0x2019,0x201c,0x201d,0x2013,0x2014,0x2026,0x2665]
for key, filename in FONTS.items():
    font = TTFont(ROOT / f'public/fonts/{filename}.ttf')
    if 'fvar' in font: font = instantiateVariableFont(font, {'wght': 500})
    glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); upm=font['head'].unitsPerEm
    data={"units":upm,"glyphs":{}}
    for code in codes:
        if code not in cmap: continue
        g=glyphs[cmap[code]]; pen=FlattenPen(glyphs); g.draw(pen)
        compact=[]
        for contour in pen.contours:
            if len(contour)<3: continue
            middle=max(range(len(contour)), key=lambda i:(contour[i][0]-contour[0][0])**2+(contour[i][1]-contour[0][1])**2)
            compact.append(simplify(contour[:middle+1],upm*.004)[:-1]+simplify(contour[middle:]+[contour[0]],upm*.004)[:-1])
        data['glyphs'][str(code)]={"advance":g.width,"contours":[[[round(x,1),round(-y,1)] for x,y in contour] for contour in compact]}
    (out / f'{key}.json').write_text(json.dumps(data,separators=(',',':')))
    options=subset.Options(); options.flavor='woff2'; sub=subset.Subsetter(options=options); sub.populate(unicodes=codes); sub.subset(font)
    font.flavor='woff2'; font.save(ROOT / f'public/fonts/{filename}.woff2')
    print(key, len(data['glyphs']), (out / f'{key}.json').stat().st_size)

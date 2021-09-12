from sys import path
from os.path import exists
from os import environ
from json import dumps


d = "/usr/share/inkscape/extensions"
exists(d) and path.append(d)

from inkex import BoundingBox


DATA = environ.get("DATA") or environ.get("SEGMENTS")
if not DATA:
    r = [a * 10 for a in range(-2, 3, 1)]

    def extrema():
        for a in r:
            for b in r:
                for c in r:
                    for d in r:
                        yield a, b, c, d

    # print([a, b])
    for a, b, c, d in extrema():
        B = BoundingBox((a, b), (c, d))
        D = {}
        D["x"] = B.x.minimum
        D["y"] = B.y.minimum
        D["xMin"] = B.x.minimum
        D["yMin"] = B.y.minimum
        D["xMax"] = B.x.maximum
        D["yMax"] = B.y.maximum

        for n in [
            "width",
            "height",
            "top",
            "left",
            "bottom",
            "right",
            ("center_x", "centerX"),
            ("center_y", "centerY"),
        ]:
            if isinstance(n, tuple):
                D[n[-1]] = getattr(B, n[0])
            else:
                D[n] = getattr(B, n)

        print(dumps(D))
elif DATA == "":
    pass

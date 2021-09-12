data1 = [
    "m0,0l10,0",
    "M0,0L10,0",
    "M0,0L10,0M0,0L10,0",
    "M0,0L10,0m0,0L10,0",
    "M0,0L10,0l10,0",
    "m0,0h10",
    "M50,0H40",
    "m0,0v10",
    "M0,50V40",
    "m0,0h10z",
    "m0,0h10Z",
    "M100,25C10,90,110,100,150,195",
    "m100,25c-90,65,10,75,50,170",
    "M100,200 C100,100 250,100 250,200 S400,300 400,200",
    "M100,200 c0,-100 150,-100 150,0 s150,100 150,0",
    "M100,200 S400,300 400,200",
    "M100,200 s300,100 300,0",
    "M200,300 Q400,50 600,300",
    "M200,300 q200,-250 400,0",
    "M0,100 Q50,-50 100,100 T200,100",
    "M0,100 q50,-150 100,0 t100,0",
    "M0,100 Q50,-50 100,100 T200,100 T300,100",
    "M0,100 T200,100",
    "M0,100 t200,100",
    "M50,20A50,50,0,0,0,150,20",
    "M50,20A50,50,0,0,0,150,20Z",
    "M50,20a50,50,0,0,0,100,0",
    "M137.69692698614858,194.75002119995685L140.5811864522362,200.02784443179866L145.21300688556522,205.5730786360974L151.96589957664872,210.57916233863872L157.11811791245674,216.958427402148L160.38007797705498,217.5517159659712L170.86150068075614,226.50677931755828L184.78753673995035,229.40372164152683L188.48682846625186,231.74464203758626L194.96220985606624,232.24831761753774L199.0151340580992,235.98908347947008L200.33619274822317,239.1501414459547L208.1352797340722,240.97174662891314L214.55451361971706,243.72269753526453L217.92992784370034,242.79750552259512L222.422382828094,245.95312239185364L226.33834281296274,246.6562900586742L232.1785094475572,250.37579609444018L247.67126011118384,253.41216989328635L249.86860925383274,259.67235659237457L258.0102758151366,263.53584756964034L265.7094539012957,271.9301187141604L275.3442092382522,280.797134878233L292.5367640425162,281.439215857073L300.3900165167456,283.19277126134665L317.1541418598862,288.08140107614616L325.68746219694265,282.98731281377525L334.20900545032936,279.42687578910136L341.89090086141164,279.65662234387565L344.6975683081848,280.71420717321774L352.73368224017975,278.81635544720564L357.8378453664788,280.8621873013037L360.27780217558785,280.351713437805L366.10835670115375,282.6140677325477L369.09298803246423,282.32880268111796L376.79699044083907,278.5755589629451L382.0884404158815,278.74374570898004L386.6969703376813,280.7868194847831L391.5118882394122,287.6851129793625L401.6043570144851,289.4523241399227L418.32264375071753,303.60974325767233L416.56748832810626,308.8321991418072L421.85304030224415,309.8073672357337L426.9233662531078,306.30064325383734L428.39794675453993,303.9729502861741L433.7178516894217,301.12745610964237L435.55518815288303,303.2790040699963L429.98849506106274,310.0981677440247L430.3920258191735,315.904266873991L431.8697365975619,320.41310652120495L431.51963155330213,325.7229788905284L437.6672507546333,329.58621381302714L437.3918696288182,334.8637567665635L439.98603260092784,334.44629338092415L446.1764597142119,341.8547790472293L453.6668527230894,346.9381545890387L457.5294853076264,347.9669234517022L462.48118856871827,352.94569484976665L466.87142760911547,353.62325409732335L470.1647323309724,356.65500849656917L478.52329558789495,361.73028232300277L486.88560554821527,370.7823973990582L489.73056770534674,376.3046557640006L489.2413765676388,379.0217789927731L492.6796339000674,384.9123226146289L500.3373626256565,376.6596349946864L507.84942333888387,380.4063594074064L511.8061547036337,380.01502900094323",
    "M240,100C290,100,240,225,290,200S290,75,340,50S515,100,390,150S215,200,90,150S90,25,140,50S140,175,190,200S190,100,240,100",
    "m240,100c50,0,0,125,50,100s0,-125,50,-150s175,50,50,100s-175,50,-300,0s0,-125,50,-100s0,125,50,150s0,-100,50,-100",
    "M100,100h100v100h-100Zm200,0h1v1h-1z",
    "M470,623Q468,627,467,629",
    "M0,0L31.081620209059235,726.1062992125984Q41.44216027874565,726.1062992125984,41.44216027874565,726.1062992125984",
    # heart
    "M10,30 A20,20,0,0,1,50,30 A20,20,0,0,1,90,30 Q90,60,50,90 Q10,60,10,30 Z"
    # https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#curve_commands
    # """M 10 315
    #        L 110 215
    #        A 36 60 0 0 1 150.71 170.29
    #        L 172.55 152.45
    #        A 30 50 -45 0 1 215.1 109.9
    #        L 315 10""",
    """M 80 80
           A 45 45, 0, 0, 0, 125 125
           L 125 80 Z""",
    """M 230 80
           A 45 45, 0, 1, 0, 275 125
           L 275 80 Z""",
    """M 80 230
           A 45 45, 0, 0, 1, 125 275
           L 125 230 Z""",
    """M 230 230
           A 45 45, 0, 1, 1, 275 275
           L 275 230 Z""",
    "M 10 80 Q 52.5 10, 95 80 T 180 80",
    # """Examples from the SVG spec"""
    "M 100,100 L 300,100 L 200,300 Z",
    "M 0,0 L 50,20 M 100,100 L 300,100 L 200,300 Z",
    "M 100,100 L 200,200",
    "M 100,200 L 200,100 L -100,-200",
    "M 100,200 C 100,100 250,100 250,200 S 400,300 400,200",
    "M 100,200 C 100,100 400,100 400,200",
    "M 100,500 C 25,400 475,400 400,500",
    "M 100,800 C 175,700 325,700 400,800",
    "M 600,200 C 675,100 975,100 900,200",
    "M 600,500 C 600,350 900,650 900,500",
    "M 600,800 C 625,700 725,700 750,800 S 875,900 900,800",
    "M 200,300 Q 400,50 600,300 T 1000,300",
    "M -3.4E+38,3.4E+38 L -3.4E-38,3.4E-38",
    # "M 0,0 L 50,20 M 50,20 L 200,100 Z",
    "M 600,350 L 650,325 A 25,25 -30 0,1 700,300 L 750,275",
    # https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#b%C3%A9zier_curves
    # "M 10 10 C 20 20, 40 20, 50 10",
    # "M 70 10 C 70 20, 110 20, 110 10",
    # "M 130 10 C 120 20, 180 20, 170 10",
    # "M 10 60 C 20 80, 40 80, 50 60",
    # "M 70 60 C 70 80, 110 80, 110 60",
    # "M 130 60 C 120 80, 180 80, 170 60",
    # "M 10 110 C 20 140, 40 140, 50 110",
    # "M 70 110 C 70 140, 110 140, 110 110",
    # "M 130 110 C 120 140, 180 140, 170 110",
]
data2 = [
    "M352,5779.724c499,2-3-89,496-84",
    "M478,2877.472c247,3-255-88,244-83",
    "M478,2392.817c247,3-246,14,244-83",
    "M478,3361.031c247-69-246,14,244-83",
    "M500.5,1403.542c273-45-220,38,199-37",
    "M500.5,2587.469c215,96-220,38,199-37",
    "M406,1823.559c404,146-31,88,388,13",
    "M406,2064.553c86,150-31,88,388,13",
    "M406,4966.489c261,149-31,88,388,13",
    "M406,4484.496c382,141-31,88,388,13",
    "M394.5,6471.436c405,75-8,22,411-53",
    "M394.5,5279.895c449-4-8,22,411-53",
    "M394.5,6247.762c449-4,0,0,411-53",
    "M489.5,3565.342c449-4,0,0,221-8",
    "M479.072,3809.049c529-26,0,0,167-6",
    "M516.5,1644.744c352-80,0,0,167-6",
    "M798.002,4082.546c-529,7-523-141.999-12-38.999",
    "M801.469,6774.896c-550.999-16-522.999-142-1-140",
    "M799.765,4354.818c-542,32-523-142-1-140",
    "M770.439,7017.016c-380.001-148-523.001-142-1-140",
    "M769.988,274.009C390.988,266.009,247.988,272.009,769.988,274.009",
    "M794.813,1141.56C277.813,1150.56,272.813,1139.56,794.813,1141.56",
    "M785.217,901.998C320.216,900.998,263.217,899.998,785.217,901.998",
    "M347.5,462.172c505-17-17-18,505-16",
    "M339.5,663.235c521,0-1-1,521,1",
    "M377.5,5495.454c445,0-77-1,445,1",
    "M377.5,5978.951c372,1-77-1,445,1",
    # "M564.756,3078.079c372,1-77-1-77-1",
    # "M602.874,4750.803c196.999,91-77-1-77-1",
    "M731.169,7500.317c-551-16-74.463,21-1-140",
    "M731.169,7209.412c-551-4.777-74.463,6.271-1-41.811",
    "M1075.169,7682.533c-1996.043-2.379-269.747,3.121-3.622-20.811",
    "M612.657,8228.399c-57.988-464.354,2.249,314.834-1-140",
    "M748.791,9246.203c-48.561-445.45,0,0,0-246.418",
    "M407.051,9488.014c8.771-403.029,0,0,0-246.416",
    "M492,7954.201c258.471-128.029-126-68.002,216-56",
    "M529.006,8937.162c232.271-130.145,105.271-167.076,123.23-0.48",
    "M532.461,8453.83c213.563-131.8,105.271-167.076,123.232-0.479",
    "M538.385,8695.068c169.485-128.53,105.27-167.075,123.23-0.479",
    "M177.365,9657.754 C2314.484,9433.758-164.635,9645.75,177.365,9657.754",
    "M177.365,9863.064 C2314.484,9798.949-164.635,9859.629,177.365,9863.064",
    "M177.365,10098.412 C2314.482,10062.607-164.635,10096.492,177.365,10098.412",
    "M121.108,10352.402c2137.118-35.807,82,41-10.136-40.705",
    "M163.396,10885.141 C453.589,10902.539,162.471,10562.539,163.396,10885.141",
    "M228.071,10627.99 C1915.305,10622.137,202.129,10387.359,228.071,10627.99",
    "M152.222,10991.809 C1084.453,10959.602,1582.453,10868.578,152.222,10991.809",
]

data3 = [
    """M 10 315
           L 110 215
           A 36 60 0 0 1 150.71 170.29
           L 172.55 152.45
           A 30 50 -45 0 1 215.1 109.9
           L 315 10""",
    "M396 140a176 112 0 0 1 -352 0a176 112 0 0 1 352 0z",
]

#  Array.from(document.querySelectorAll(".pl-s")).map(e=>e.textContent).map(x=>x.match(/^"(.+)"$/)[1]).filter(x=>x.indexOf(',')>0)
from svgpathtools import (
    parse_path,
    path,
    QuadraticBezier,
    Arc,
    CubicBezier,
    Line,
    Path as SPTPath,
)
from json import dumps
from sys import stderr
from os import environ
import re

if 1:
    COMMANDS = set("MmZzLlHhVvCcSsQqTtAa")
    UPPERCASE = set("MZLHVCSQTA")
    COMMAND_RE = re.compile("([MmZzLlHhVvCcSsQqTtAa])")
    FLOAT_RE = re.compile("[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?")

    def _tokenize_path(pathdef):
        for x in COMMAND_RE.split(pathdef):
            if x in COMMANDS:
                yield x
            for token in FLOAT_RE.findall(x):
                yield float(token)


# path._quad_available = False


def brpt(c):
    return c.real, c.imag


def paths(*args, parser=parse_path):
    seen = {}
    for ds in args:
        for i, d in enumerate(ds):
            d = " ".join(d.strip().split())
            if d in seen:
                stderr.write(f"Seen : {i} {d}\n")
            else:
                seen[d] = True
                yield parser(d), d


DATA = environ.get("DATA") or environ.get("SEGMENTS")
if not DATA:
    r = int(environ.get("PATH_POINTS", 0)) or int(environ.get("POINTS", 0)) or 10

    k = [i / r for i in range(r)] + [1]

    # tf = [i / r for i in range(r)] + [1]
    # stderr.write(f"t {k}\n")
    for i, (p, d) in enumerate(paths(data1)):
        v = dict(d=d)
        t = None
        try:

            v["length"] = p.length()
            v["bbox"] = p.bbox()
            # pts = v["points"] = []
            # for t in k:
            #     # stderr.write(f"t={t}\n")
            #     assert t >= 0
            #     assert t <= 1
            #     pts.append([t, *brpt(p.point(t))])
            # pts = v["tangents"] = []
            # for t in tf:
            #     # stderr.write(f"t={t}\n")
            #     assert t >= 0
            #     assert t <= 1
            #     try:
            #         pts.append([t, *brpt(p.derivative(t))])
            #     except AssertionError:
            #         stderr.write(f"AssertionError {t} {p!r}\n")
            #         break

            pts = v["at"] = {}
            for t in k:
                assert t >= 0
                assert t <= 1
                pAt = dict(zip(["x", "y"], brpt(p.point(t))))
                try:
                    tAt = dict(zip(["tx", "ty"], brpt(p.derivative(t))))
                except AssertionError:
                    tAt = dict(tx=0, ty=0)
                    stderr.write(f"AssertionError {t} {p!r}\n")
                    # break
                if t < 1 and t > 0:
                    a = p.cropped(0, t)
                    b = p.cropped(t, 1)
                    a = a.d(use_closed_attrib=False, rel=False)
                    b = b.d(use_closed_attrib=False, rel=False)
                    a = list(_tokenize_path(a))
                    b = list(_tokenize_path(b))
                else:
                    a = b = 0
                pts[t] = {**pAt, **tAt, "pathA": a, "pathB": b}

        except:
            stderr.write(f"err on {t} {v} {p}\n")
            raise

        print(dumps(v))

    stderr.write(f"{i} Paths, {r} Points\n")
elif DATA.startswith("CubicBezier"):

    r = int(environ.get("POINTS", 10))
    k = [i / r for i in range(r)] + [1]
    for i, (p, d) in enumerate(paths(data1, data2)):
        for seg in p:
            if isinstance(seg, CubicBezier):
                pts = tuple(
                    brpt(im) for im in (seg.start, seg.control1, seg.control2, seg.end)
                )
                d = dict(points=pts, bbox=seg.bbox(), length=seg.length(), d=d)

                pts = d["at"] = {}
                for t in k:
                    assert t >= 0
                    assert t <= 1
                    pAt = dict(zip(["x", "y"], brpt(seg.point(t))))
                    tAt = dict(zip(["tx", "ty"], brpt(seg.derivative(t))))
                    if t < 1 and t > 0:
                        s = SPTPath(seg)
                        a = s.cropped(0, t)
                        b = s.cropped(t, 1)
                        a = a.d(use_closed_attrib=False, rel=False)
                        b = b.d(use_closed_attrib=False, rel=False)
                        a = list(_tokenize_path(a))
                        b = list(_tokenize_path(b))
                    else:
                        a = b = 0
                    pts[t] = {**pAt, **tAt, "pathA": a, "pathB": b}

                print(dumps(d))
elif DATA.startswith("QuadraticBezier"):
    r = int(environ.get("POINTS", 10))
    k = [i / r for i in range(r)] + [1]
    for i, (p, d) in enumerate(paths(data1)):
        for seg in p:
            if isinstance(seg, QuadraticBezier):
                pts = tuple(brpt(im) for im in (seg.start, seg.control, seg.end))
                d = dict(points=pts, bbox=seg.bbox(), length=seg.length(), d=d)

                pts = d["at"] = {}
                for t in k:
                    assert t >= 0
                    assert t <= 1
                    pAt = dict(zip(["x", "y"], brpt(seg.point(t))))
                    tAt = dict(zip(["tx", "ty"], brpt(seg.derivative(t))))

                    if t < 1 and t > 0:
                        s = SPTPath(seg)
                        a = s.cropped(0, t)
                        b = s.cropped(t, 1)
                        a = a.d(use_closed_attrib=False, rel=False)
                        b = b.d(use_closed_attrib=False, rel=False)
                        a = list(_tokenize_path(a))
                        b = list(_tokenize_path(b))
                    else:
                        a = b = 0
                    pts[t] = {**pAt, **tAt, "pathA": a, "pathB": b}
                print(dumps(d))
elif DATA.startswith("Arc"):
    seen = {}
    dataA1 = ["m 182.94048,133.3363 a 71.059525,34.395832 0 0 1 -57.74432,33.78659 71.059525,34.395832 0 0 1 -79.384695,-21.12465 71.059525,34.395832 0 0 1 27.993926,-41.70331 71.059525,34.395832 0 0 1 89.875769,5.49583"]
    r = int(environ.get("POINTS", 10))
    k = [i / r for i in range(r)] + [1]
    for i, (p, d) in enumerate(paths(data1, data3, dataA1)):
        for seg in p:
            if isinstance(seg, Arc):
                d = dict(d=d)

                d["start"] = tuple(brpt(seg.start))
                d["end"] = tuple(brpt(seg.end))
                d["large_arc"] = int(seg.large_arc)
                d["sweep"] = int(seg.sweep)
                d["rotation"] = seg.rotation
                d["radius"] = tuple(brpt(seg.radius))
                d["center"] = tuple(brpt(seg.center))
                d["theta"] = tuple(brpt(seg.theta))
                d["delta"] = tuple(brpt(seg.delta))
                key = (
                    d["start"],
                    d["radius"],
                    d["rotation"],
                    d["sweep"],
                    d["large_arc"],
                    d["end"],
                )
                if key in seen:
                    stderr.write(f"Seen: {key}\n")
                    continue
                else:
                    seen[key] = True

                d["bbox"] = seg.bbox()
                d["length"] = seg.length()
                d["repr"] = repr(seg)
                pts = d["at"] = {}
                for t in k:
                    assert t >= 0
                    assert t <= 1
                    pAt = dict(zip(["x", "y"], brpt(seg.point(t))))
                    tAt = dict(zip(["tx", "ty"], brpt(seg.derivative(t))))
                    # pts[t] = {**pAt, **tAt}
                    if t < 1 and t > 0:
                        s = SPTPath(seg)
                        a = s.cropped(0, t)
                        b = s.cropped(t, 1)
                        a = a.d(use_closed_attrib=False, rel=False)
                        b = b.d(use_closed_attrib=False, rel=False)
                        a = list(_tokenize_path(a))
                        b = list(_tokenize_path(b))
                    else:
                        a = b = 0
                    pts[t] = {**pAt, **tAt, "pathA": a, "pathB": b}

                print(dumps(d))
elif DATA.startswith("Line"):
    r = int(environ.get("POINTS", 10))
    k = [i / r for i in range(r)] + [1]
    for i, (p, d) in enumerate(paths(data1)):
        for seg in p:
            if isinstance(seg, Line):
                d = dict(
                    start=brpt(seg.start),
                    end=brpt(seg.end),
                    bbox=seg.bbox(),
                    length=seg.length(),
                    d=d,
                )
                d["repr"] = repr(seg)
                pts = d["at"] = {}
                tAt = 0
                for t in k:
                    assert t >= 0
                    assert t <= 1
                    pAt = dict(zip(["x", "y"], brpt(seg.point(t))))
                    try:
                        tAt = dict(zip(["tx", "ty"], brpt(seg.derivative(t))))
                    except AssertionError:
                        break

                    if t < 1 and t > 0:
                        s = SPTPath(seg)
                        a = s.cropped(0, t)
                        b = s.cropped(t, 1)
                        a = a.d(use_closed_attrib=False, rel=False)
                        b = b.d(use_closed_attrib=False, rel=False)
                        a = list(_tokenize_path(a))
                        b = list(_tokenize_path(b))
                    else:
                        a = b = 0

                    pts[t] = {**pAt, **tAt, "pathA": a, "pathB": b}
                if tAt == 0:
                    continue
                print(dumps(d))
    stderr.write(f"{i} Items\n")
elif DATA.startswith("Parsed"):
    from sys import path
    from os.path import exists
    from svgelements import Path as PathSE
    d = "/usr/share/inkscape/extensions"
    exists(d) and path.append(d)
    from inkex import Path as PathIX, Line
    from inkex.paths import PathCommand
    PathCommand.number_template = "{}"

    skip = 0

    for i, (p, d) in enumerate(paths(data1, data2, data3, parser=PathIX)):
        # p = Path(d)
        # D = p.d()
        D = str(p.to_non_shorthand())
        if "A" in D:
            p = PathSE(d)
            rel = p.d(relative=True, smooth=False)
            abs = p.d(relative=False, smooth=False)
            # p = parse_path(d)
            # rel = p.d(use_closed_attrib=False, rel=True)
            # abs = p.d(use_closed_attrib=False, rel=False)
        else:
            abs = str(p.to_non_shorthand())
            rel = str(p.to_non_shorthand().to_relative())
        abs = list(_tokenize_path(abs))
        rel = list(_tokenize_path(rel))
        # if "Q" in D:
        #     skip += 1
        #     continue
        # if "A" in D:
        #     skip += 1
        #     continue
        d = dict(
            abs=abs,
            rel=rel,
            d=d,
            D=D,
        )
        print(dumps(d))
    stderr.write(f"{i-skip} Items\n")
    skip and stderr.write(f"{skip} Skipped\n")
elif DATA.startswith("SEPaths"):
    from svgelements import Path

    skip = 0

    for i, (p, d) in enumerate(paths(data1, data2, data3, parser=Path)):
        # p = Path(d)
        rel = p.d(relative=True, smooth=False)
        abs = p.d(relative=False, smooth=False)
        # rel = p.d(use_closed_attrib=False, rel=True)
        # abs = p.d(use_closed_attrib=False, rel=False)
        abs = list(_tokenize_path(abs))
        rel = list(_tokenize_path(rel))
        # if "Q" in D:
        #     skip += 1
        #     continue
        # if "A" in D:
        #     skip += 1
        #     continue
        d = dict(
            abs=abs,
            rel=rel,
            d=d,
            D=p.d(),
        )
        print(dumps(d))
    stderr.write(f"{i-skip} Items\n")
    skip and stderr.write(f"{skip} Skipped\n")
elif DATA.startswith("transforms"):
    from svgelements import Path, Matrix

    ARCS = environ.get("ARCS")
    SCALE = environ.get("SCALE")
    CI = environ.get("CI")

    ts = [100, 0, -100]
    ss = [-2, -1, 1, 2]
    if CI:
        rs = set(
            [*map(lambda v: -v, range(0, 370, 15)), *range(0, 370, 15)]
        )  ## -360 ... 0 ... 360
    else:
        rs = [0, -30, 60, -90, 120, -150, 180, -210, 240, -270, 300, -330, 360]

    datas = [data1, data2, data3]
    skip = 0
    c_transforms = 0

    if SCALE == "no":

        def matrixes():
            for tx in ts:
                for ty in ts:
                    for r in rs:
                        yield f"translate({tx},{ty})rotate({r})"

    elif SCALE == "equal":

        def matrixes():
            for tx in ts:
                for ty in ts:
                    for s in ss:
                        for r in rs:
                            yield f"translate({tx},{ty})rotate({r})scale({s},{s})"

    else:

        def matrixes():
            for tx in ts:
                for ty in ts:
                    for sx in ss:
                        for sy in ss:
                            for r in rs:
                                yield f"translate({tx},{ty})rotate({r})scale({sx},{sy})"

    _paths = paths(*datas, parser=Path)

    if ARCS == "no":

        def fn(v):
            p, d = v
            return "A" not in d and "a" not in d

        _paths = filter(fn, _paths)
    elif ARCS == "only":

        def fn(v):
            p, d = v
            return "A" in d or "a" in d

        _paths = filter(fn, _paths)

    for i, (p, d) in enumerate(_paths):
        d_ = p.d(relative=False)
        # print(d_, list(_tokenize_path(d_)))
        j = dict(d=d)
        j["abs"] = list(_tokenize_path(d_))
        transforms = j["transforms"] = []
        for s in matrixes():
            m = Matrix(s)
            pT = p * Matrix(s)
            dT = pT.d(relative=False, smooth=None)
            transforms.append([s, list(_tokenize_path(dT))])
            c_transforms += 1

        print(dumps(j))

    stderr.write(f"{i-skip} Path\n")
    skip and stderr.write(f"{skip} Skipped\n")
    stderr.write(f"{c_transforms} Transfroms\n")

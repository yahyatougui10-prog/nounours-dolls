"""
toy_art.py - procedural cartoon illustrations of dolls and nounours (teddy bears).

Pure Pillow, no external assets. Shapes are described in normalised
coordinates (0..1) and rendered with 4x supersampling for smooth edges.
"""
import math

from PIL import Image, ImageDraw

SIZE = 512            # final image size (px)
SS = 4                # supersampling factor
N = SIZE * SS
OW = 0.0055           # outline width (normalised units)


# ------------------------------------------------------------------ colours
def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(int(round(x + (y - x) * t)) for x, y in zip(a, b))


def darken(c, t=.4):
    return mix(c, (24, 14, 14), t)


def lighten(c, t=.4):
    return mix(c, (255, 255, 255), t)


# ------------------------------------------------------------------- canvas
class Canvas:
    """Square drawing surface; every coordinate is expressed in 0..1."""

    def __init__(self, bg, style='solid', bg2=None, scale=1.0, dx=0.0, dy=0.0):
        self.s, self.dx, self.dy = scale, dx, dy
        self.base = bg2 if (style == 'gradient' and bg2) else bg
        self.img = self._background(bg, style, bg2)
        self.d = ImageDraw.Draw(self.img)

    @staticmethod
    def _background(c1, style, c2):
        img = Image.new('RGB', (N, N), c1)
        if style == 'gradient':
            mask = Image.linear_gradient('L').resize((N, N))
            return Image.composite(Image.new('RGB', (N, N), c2), img, mask)
        d = ImageDraw.Draw(img)
        if style == 'dots':
            col, step = lighten(c1, .5), N // 8
            r = step * .13
            for row in range(-1, 10):
                for k in range(-1, 10):
                    x = k * step + (step // 2 if row % 2 else 0)
                    y = row * step
                    d.ellipse([x - r, y - r, x + r, y + r], fill=col)
        elif style == 'stripes':
            col, w = lighten(c1, .45), N // 10
            for k in range(0, 10, 2):
                d.rectangle([k * w, 0, (k + 1) * w, N], fill=col)
        return img

    # -- coordinate transform (small random zoom / shift for variety)
    def X(self, x):
        return (.5 + self.dx + (x - .5) * self.s) * N

    def Y(self, y):
        return (.5 + self.dy + (y - .5) * self.s) * N

    def L(self, v):
        return v * self.s * N

    # -- primitives; g = "grow" amount used to draw outlines
    def _E(self, cx, cy, rx, ry, color, g=0):
        x, y, a, b = self.X(cx), self.Y(cy), self.L(rx + g), self.L(ry + g)
        self.d.ellipse([x - a, y - b, x + a, y + b], fill=color)

    def _R(self, cx, cy, rx, ry, ang, color, g=0):
        ca, sa = math.cos(ang), math.sin(ang)
        pts = []
        for i in range(96):
            t = 2 * math.pi * i / 96
            u, v = (rx + g) * math.cos(t), (ry + g) * math.sin(t)
            pts.append((self.X(cx + u * ca - v * sa), self.Y(cy + u * sa + v * ca)))
        self.d.polygon(pts, fill=color)

    def _P(self, pts, color, g=0):
        P = [(self.X(x), self.Y(y)) for x, y in pts]
        self.d.polygon(P, fill=color)
        if g:
            self.d.line(P + P[:2], fill=color, width=max(1, int(self.L(g) * 2)), joint='curve')

    def _B(self, x0, y0, x1, y1, r, color, g=0):
        self.d.rounded_rectangle(
            [self.X(x0) - self.L(g), self.Y(y0) - self.L(g),
             self.X(x1) + self.L(g), self.Y(y1) + self.L(g)],
            radius=self.L(r + g), fill=color)

    def group(self, shapes, fill, line=None, ow=OW):
        """Draw several shapes as one blob with a clean outer outline."""
        fn = {'E': self._E, 'R': self._R, 'P': self._P, 'B': self._B}
        if line is not None:
            for k, a in shapes:
                fn[k](*a, line, ow)
        for k, a in shapes:
            fn[k](*a, fill, 0)

    def E(self, cx, cy, rx, ry, fill, line=None):
        self.group([('E', (cx, cy, rx, ry))], fill, line)

    def R(self, cx, cy, rx, ry, ang, fill, line=None):
        self.group([('R', (cx, cy, rx, ry, ang))], fill, line)

    def P(self, pts, fill, line=None):
        self.group([('P', (pts,))], fill, line)

    def B(self, x0, y0, x1, y1, r, fill, line=None):
        self.group([('B', (x0, y0, x1, y1, r))], fill, line)

    def stroke(self, pts, color, w):
        P = [(self.X(x), self.Y(y)) for x, y in pts]
        wd = max(1, int(self.L(w)))
        self.d.line(P, fill=color, width=wd, joint='curve')
        r = wd / 2
        for x, y in (P[0], P[-1]):
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=color)

    def outline(self, pts, color, w=OW * 2):
        self.stroke(list(pts) + list(pts[:2]), color, w)

    def arc(self, cx, cy, rx, ry, a0, a1, color, w, steps=36):
        pts = []
        for i in range(steps + 1):
            t = math.radians(a0 + (a1 - a0) * i / steps)
            pts.append((cx + rx * math.cos(t), cy + ry * math.sin(t)))
        self.stroke(pts, color, w)

    def shadow(self):
        self.E(.5, .948, .27, .026, mix(self.base, (0, 0, 0), .12))

    def finish(self):
        return self.img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


# ------------------------------------------------------------ little shapes
def bow(cv, cx, cy, w, color, line):
    h = w * .72
    cv.group([('P', ([(cx, cy), (cx - w, cy - h), (cx - w, cy + h)],)),
              ('P', ([(cx, cy), (cx + w, cy - h), (cx + w, cy + h)],))], color, line)
    cv.E(cx, cy, w * .3, w * .3, lighten(color, .12), line)


def party_hat(cv, x, y, color, color2, line):
    cv.P([(x - .075, y), (x + .075, y), (x + .015, y - .15)], color, line)
    for dx, dy in ((-.022, -.034), (.012, -.064), (-.004, -.094)):
        cv.E(x + dx, y + dy, .009, .009, lighten(color, .65))
    cv.E(x, y, .075, .013, color2, line)
    cv.E(x + .015, y - .152, .02, .02, color2, line)


def crown(cv, x, y, w):
    gold, edge = (246, 201, 69), (170, 120, 20)
    h = w * .95
    cv.P([(x - w, y), (x - w, y - h), (x - w * .5, y - h * .5), (x, y - h * 1.2),
          (x + w * .5, y - h * .5), (x + w, y - h), (x + w, y)], gold, edge)
    for dx, col in ((-w * .62, (230, 70, 90)), (0, (70, 140, 230)), (w * .62, (230, 70, 90))):
        cv.E(x + dx, y - h * .24, w * .11, w * .11, col, edge)


def heart(cv, cx, cy, s, color):
    cv.E(cx - s * .5, cy - s * .25, s * .56, s * .56, color)
    cv.E(cx + s * .5, cy - s * .25, s * .56, s * .56, color)
    cv.P([(cx - s * 1.03, cy - s * .02), (cx + s * 1.03, cy - s * .02), (cx, cy + s * 1.15)], color)


def flower(cv, cx, cy, r, color):
    for k in range(5):
        a = 2 * math.pi * k / 5 - math.pi / 2
        cv.E(cx + 1.25 * r * math.cos(a), cy + 1.25 * r * math.sin(a), r, r,
             lighten(color, .1), darken(color, .4))
    cv.E(cx, cy, r * .8, r * .8, (255, 215, 80), (200, 150, 30))


def scarf(cv, color, color2, line):
    cv.group([('B', (.30, .515, .70, .585, .03)), ('B', (.575, .55, .665, .72, .02))], color, line)
    for yy in (.61, .65, .69):
        cv.stroke([(.585, yy), (.655, yy)], color2, .012)


# ------------------------------------------------------------------ palettes
BG_COLORS = ['#FDE2E4', '#E2ECE9', '#DFE7FD', '#FFF1E6', '#EAE4E9', '#FDE4CF',
             '#FFCFD2', '#F1DDF5', '#D8E2FF', '#D4F0F0', '#E3F6D8', '#FBF8CC']

BEAR_FUR = [  # (en, hex, fr)
    ('brown', '#8B5A2B', 'brun'), ('caramel', '#C68E52', 'caramel'),
    ('honey', '#E3AE4F', 'miel'), ('cream', '#F1E1C2', 'crème'),
    ('white', '#F8F5F0', 'blanc'), ('grey', '#A6A7B5', 'gris'),
    ('pink', '#F4A6C0', 'rose'), ('blue', '#8EC5E8', 'bleu'),
    ('lavender', '#C2A8E3', 'lavande'), ('mint', '#9ED9B8', 'menthe'),
    ('chocolate', '#5E3A24', 'chocolat'), ('yellow', '#F7D45E', 'jaune'),
    ('red', '#DB6B6B', 'rouge'),
]
ACCENTS = [  # (en, hex, fr masculine, fr feminine)
    ('red', '#E63946', 'rouge', 'rouge'), ('blue', '#3A86FF', 'bleu', 'bleue'),
    ('green', '#2A9D8F', 'vert', 'verte'), ('orange', '#F4A261', 'orange', 'orange'),
    ('purple', '#9B5DE5', 'violet', 'violette'), ('pink', '#F15BB5', 'rose', 'rose'),
    ('yellow', '#FFD23F', 'jaune', 'jaune'), ('turquoise', '#00BBF9', 'turquoise', 'turquoise'),
]
BEAR_ACC = ['none', 'bow_tie', 'scarf', 'party_hat', 'heart', 'ear_bow', 'crown']

SKIN = [('light', '#FBDCC4'), ('fair', '#F2C2A0'), ('tan', '#E0AA80'),
        ('brown', '#C08558'), ('dark brown', '#94643F'), ('deep', '#6A412C')]
HAIR = [  # (en, hex, fr - masculine plural, used after "cheveux")
    ('black', '#2A2629', 'noirs'), ('dark brown', '#4B2E1E', 'châtain foncé'),
    ('brown', '#7A4B2B', 'châtains'), ('blonde', '#F0CF7E', 'blonds'),
    ('ginger', '#D2692A', 'roux'), ('pink', '#F28DB8', 'roses'),
    ('blue', '#6FA8F0', 'bleus'), ('purple', '#A98BE0', 'violets'),
]
HAIR_STYLES = ['long', 'bob', 'pigtails', 'buns', 'braids', 'short']
CLOTHES = [  # (en, hex, fr feminine, fr masculine)
    ('red', '#E5484D', 'rouge', 'rouge'), ('blue', '#4C8DF6', 'bleue', 'bleu'),
    ('yellow', '#F6C945', 'jaune', 'jaune'), ('green', '#3FB68B', 'verte', 'vert'),
    ('pink', '#F57CB4', 'rose', 'rose'), ('purple', '#9B6DE0', 'violette', 'violet'),
    ('orange', '#F59A3D', 'orange', 'orange'), ('turquoise', '#2EC4C9', 'turquoise', 'turquoise'),
]
PATTERNS = ['plain', 'dots', 'stripes', 'belt', 'hem_band', 'heart']
HAIR_ACC = ['none', 'none', 'bow', 'flower', 'headband']
EYES = [('brown', '#6B4226'), ('blue', '#4C9BE8'), ('green', '#4FAF7C'), ('hazel', '#A07C3A')]
SHOES = ['#D64550', '#2B2B33', '#F4F4F4', '#F28DB8', '#4C6FDB', '#7A4B2B']
LEGS = ['skin', 'white', 'accent']


# --------------------------------------------------------------------- bear
def draw_bear(cv, p):
    fur = rgb(p['fur_hex'])
    line = darken(fur, .5)
    belly = mix(lighten(fur, .45), (255, 236, 205), .35)
    inner = mix(fur, (238, 140, 160), .55)
    dark = (56, 38, 40)
    acc = rgb(p['accent_hex'])
    aline = darken(acc, .45)
    er = p['ear']

    for sx in (-1, 1):                                       # ears
        cv.E(.5 + sx * .165, .205, er, er, fur, line)
        cv.E(.5 + sx * .165, .212, er * .56, er * .56, inner)
    for sx in (-1, 1):                                       # legs
        cv.E(.5 + sx * .13, .86, .09, .075, fur, line)
    cv.E(.5, .68, .205, .215, fur, line)                     # body
    cv.E(.5, .70, .125, .14, belly)                          # belly patch
    for sx in (-1, 1):                                       # foot pads
        cv.E(.5 + sx * .13, .888, .05, .032, belly)
    for sx in (-1, 1):                                       # arms + paws
        ang = -sx * .45
        cx, cy = .5 + sx * .235, .645
        cv.R(cx, cy, .066, .125, ang, fur, line)
        cv.E(cx - .085 * math.sin(ang), cy + .085 * math.cos(ang), .034, .03, belly)
    cv.E(.5, .35, .205, .185, fur, line)                     # head
    cv.E(.5, .405, .095, .07, belly, mix(fur, line, .3))     # muzzle
    for sx in (-1, 1):                                       # blush
        cv.E(.5 + sx * .125, .385, .03, .02, mix(fur, (255, 120, 140), .45))
    cv.E(.5, .385, .033, .023, dark)                         # nose
    cv.E(.49, .377, .011, .006, (255, 255, 255))
    cv.stroke([(.5, .405), (.5, .425)], dark, .007)          # mouth
    cv.arc(.472, .425, .028, .02, 10, 170, dark, .007)
    cv.arc(.528, .425, .028, .02, 10, 170, dark, .007)
    for sx in (-1, 1):                                       # eyes
        x, y = .5 + sx * .075, .33
        if p['eyes'] == 'happy':
            cv.arc(x, y + .008, .022, .02, 200, 340, dark, .009)
        else:
            cv.E(x, y, .02, .024, (35, 25, 28))
            cv.E(x + .006, y - .008, .0065, .0075, (255, 255, 255))

    a = p['accessory']                                       # accessory
    if a == 'bow_tie':
        bow(cv, .5, .555, .06, acc, aline)
    elif a == 'scarf':
        scarf(cv, acc, lighten(acc, .55), aline)
    elif a == 'party_hat':
        party_hat(cv, .5, .205, acc, lighten(acc, .35), aline)
    elif a == 'heart':
        heart(cv, .5, .68, .045, acc)
    elif a == 'ear_bow':
        bow(cv, .335, .15, .042, acc, aline)
    elif a == 'crown':
        crown(cv, .5, .2, .075)


# --------------------------------------------------------------------- doll
def _edges(y):
    xl = .40 - .13 * (y - .50) / .30
    return xl, 1 - xl


def _hem(y0=.80, amp=.032, scallop=False):
    n = 60 if scallop else 24
    pts = []
    for k in range(n + 1):
        u = k / n
        y = y0 + (.022 * abs(math.sin(6 * math.pi * u)) if scallop else amp * math.sin(math.pi * u))
        pts.append((.73 - .46 * u, y))
    return pts


def draw_doll(cv, p):
    skin = rgb(p['skin_hex'])
    sline = darken(skin, .42)
    hair = rgb(p['hair_hex'])
    hline = darken(hair, .5)
    top = rgb(p['dress_hex'])
    tline = darken(top, .45)
    acc = rgb(p['accent_hex'])
    aline = darken(acc, .45)
    shoe = rgb(p['shoes_hex'])
    style = p['hair_style']
    dark = (38, 26, 30)

    # 1. back hair ---------------------------------------------------------
    back = {
        'long': [('E', (.5, .30, .205, .19)), ('B', (.295, .20, .705, .62, .10))],
        'bob': [('B', (.285, .15, .715, .445, .10))],
        'pigtails': [('R', (.305, .455, .06, .12, .18)), ('R', (.695, .455, .06, .12, -.18))],
        'buns': [('E', (.375, .165, .07, .07)), ('E', (.625, .165, .07, .07))],
        'braids': [('E', (.5 + sx * (.16 + .008 * i), .36 + .055 * i, .036 - .002 * i, .036 - .002 * i))
                   for sx in (-1, 1) for i in range(5)],
        'short': [('E', (.5, .265, .172, .15))],
    }[style]
    cv.group(back, hair, hline)

    # 2. legs + shoes --------------------------------------------------------
    leg_col = {'skin': skin, 'white': (246, 246, 248), 'accent': acc}[p['legs']]
    leg_line = sline if p['legs'] == 'skin' else darken(leg_col, .35)
    for sx in (-1, 1):
        cv.B(.5 + sx * .07 - .026, .77, .5 + sx * .07 + .026, .90, .022, leg_col, leg_line)
    for sx in (-1, 1):
        cv.E(.5 + sx * .08, .915, .062, .031, shoe, darken(shoe, .45))

    # 3. neck ----------------------------------------------------------------
    cv.B(.465, .42, .535, .52, .015, skin, sline)

    # 4. outfit --------------------------------------------------------------
    if p['outfit'] == 'dress':
        hem = _hem(.80, .032, p['scallop'])
        body = [(.40, .50), (.60, .50), (.73, .80)] + hem + [(.27, .80)]
        cv.P(body, top)
        light = lighten(top, .55)
        pat = p['pattern']
        if pat == 'stripes':
            for y0 in (.575, .65, .725):
                (xa, xb), (xc, xd) = _edges(y0), _edges(y0 + .034)
                cv.P([(xa, y0), (xb, y0), (xd, y0 + .034), (xc, y0 + .034)], light)
        elif pat == 'dots':
            for r_i, y in enumerate((.575, .63, .685, .74)):
                xl, xr = _edges(y)
                x = xl + .05 + (.035 if r_i % 2 else 0)
                while x < xr - .045:
                    cv.E(x, y, .011, .011, light)
                    x += .07
        elif pat == 'belt':
            (xa, xb), (xc, xd) = _edges(.565), _edges(.60)
            cv.P([(xa, .565), (xb, .565), (xd, .60), (xc, .60)], acc)
            cv.B(.478, .56, .522, .605, .006, (250, 205, 70), (170, 120, 20))
        elif pat == 'hem_band':
            xa, xb = _edges(.745)
            cv.P([(xa, .745), (xb, .745), (.73, .80)] + hem + [(.27, .80)], acc)
        elif pat == 'heart':
            heart(cv, .5, .65, .04, light)
        cv.outline(body, tline)
        cv.group([('E', (.455, .51, .045, .024)), ('E', (.545, .51, .045, .024))],
                 (255, 255, 255), tline)                      # collar
    else:                                                    # T-shirt + shorts
        cv.B(.40, .50, .60, .735, .035, top, tline)
        if p['pattern'] == 'stripes':
            for y0 in (.55, .62, .69):
                cv.P([(.407, y0), (.593, y0), (.593, y0 + .03), (.407, y0 + .03)], lighten(top, .55))
        cv.E(.5, .505, .05, .026, skin, sline)               # round neckline
        sh = rgb(p['accent_hex'])
        cv.P([(.40, .70), (.60, .70), (.615, .815), (.515, .815), (.50, .76), (.485, .815), (.385, .815)],
             sh, darken(sh, .45))

    # 5. arms + sleeves ------------------------------------------------------
    for sx in (-1, 1):
        ang = -sx * .2
        cx, cy = .5 + sx * .14, .625
        cv.R(cx, cy, .026, .088, ang, skin, sline)
        cv.E(cx - .088 * math.sin(ang), cy + .088 * math.cos(ang), .03, .03, skin, sline)
        cv.E(.5 + sx * .115, .527, .047, .047, top, tline)

    # 6. head + face ---------------------------------------------------------
    cv.E(.5, .29, .155, .165, skin, sline)
    eye = rgb(p['eye_hex'])
    for sx in (-1, 1):
        x, y = .5 + sx * .066, .328
        cv.E(x, y, .03, .038, dark)
        cv.E(x, y + .003, .024, .032, eye)
        cv.E(x, y + .006, .013, .02, dark)
        cv.E(x + .009, y - .011, .008, .008, (255, 255, 255))
        cv.E(x - .007, y + .012, .0035, .0035, (255, 255, 255))
        if p['lashes']:
            cv.stroke([(x + sx * .026, y - .02), (x + sx * .047, y - .035)], dark, .006)
            cv.stroke([(x + sx * .03, y - .005), (x + sx * .052, y - .012)], dark, .006)
        cv.E(.5 + sx * .1, .385, .028, .018, mix(skin, (255, 105, 125), .4))
    cv.E(.5, .362, .008, .006, darken(skin, .3))
    cv.arc(.5, .39, .028, .02, 20, 160, (190, 65, 80), .0065)

    # 7. front hair ----------------------------------------------------------
    arc_pts = []
    for k in range(31):
        t = math.pi - .1 + (math.pi + .2) * k / 30
        arc_pts.append((.5 + .168 * math.cos(t), .29 + .178 * math.sin(t)))
    side = .335 if style == 'short' else .30
    cap = arc_pts + [(.645, side), (.62, .27), (.60, .252), (.40, .252), (.38, .27), (.355, side)]
    fringe = [('E', (x, .245, .032, .032)) for x in (.41, .455, .5, .545, .59)]
    cv.group([('P', (cap,))] + fringe, hair, hline)
    cv.arc(.5, .29, .135, .146, 212, 248, lighten(hair, .35), .012)

    # 8. hair ties + accessories ---------------------------------------------
    if style == 'pigtails':
        for sx in (-1, 1):
            cv.E(.5 + sx * .165, .345, .021, .023, acc, aline)
    elif style == 'braids':
        for sx in (-1, 1):
            cv.E(.5 + sx * (.16 + .008 * 4), .36 + .055 * 4 + .03, .02, .02, acc, aline)
    ha = p['hair_acc']
    if ha == 'bow':
        bow(cv, .625, .16, .052, acc, aline)
    elif ha == 'flower':
        flower(cv, .625, .17, .024, acc)
    elif ha == 'headband':
        cv.arc(.5, .29, .148, .158, 205, 335, aline, .03)
        cv.arc(.5, .29, .148, .158, 205, 335, acc, .02)


# ------------------------------------------------------------ random params
def _scene(rng):
    bg1, bg2 = rng.sample(BG_COLORS, 2)
    return dict(bg_style=rng.choice(['solid', 'solid', 'gradient', 'dots', 'stripes']),
                bg1=bg1, bg2=bg2,
                scale=round(rng.uniform(.9, 1.0), 3),
                dx=round(rng.uniform(-.025, .025), 3),
                dy=round(rng.uniform(-.012, .02), 3))


def random_bear(rng):
    fur = rng.choice(BEAR_FUR)
    accent = rng.choice([a for a in ACCENTS if a[0] != fur[0]])
    p = dict(kind='nounours', fur=fur[0], fur_hex=fur[1], fur_fr=fur[2],
             accent=accent[0], accent_hex=accent[1], accent_fr_m=accent[2], accent_fr_f=accent[3],
             accessory=rng.choice(BEAR_ACC), eyes=rng.choice(['open', 'open', 'happy']),
             ear=round(rng.uniform(.068, .085), 3))
    p.update(_scene(rng))
    return p


def random_doll(rng):
    skin, hair = rng.choice(SKIN), rng.choice(HAIR)
    style = rng.choice(HAIR_STYLES)
    dress = rng.choice(CLOTHES)
    accent = rng.choice([c for c in CLOTHES if c[0] != dress[0]])
    outfit = 'shorts' if (style == 'short' and rng.random() < .7) else 'dress'
    pattern = rng.choice(['plain', 'stripes']) if outfit == 'shorts' else rng.choice(PATTERNS)
    eye = rng.choice(EYES)
    p = dict(kind='dolls', skin=skin[0], skin_hex=skin[1],
             hair=hair[0], hair_hex=hair[1], hair_fr=hair[2], hair_style=style,
             dress=dress[0], dress_hex=dress[1], dress_fr_f=dress[2], dress_fr_m=dress[3],
             accent=accent[0], accent_hex=accent[1], accent_fr_m=accent[3],
             outfit=outfit, pattern=pattern, scallop=rng.random() < .35,
             legs=rng.choice(LEGS), shoes_hex=rng.choice(SHOES),
             eye=eye[0], eye_hex=eye[1], hair_acc=rng.choice(HAIR_ACC),
             lashes=(outfit == 'dress'))
    p.update(_scene(rng))
    return p


def identity_key(p):
    """What makes two images 'the same toy' (background / zoom do not count)."""
    if p['kind'] == 'nounours':
        acc = p['accessory']
        return (p['fur'], acc, p['accent'] if acc not in ('none', 'crown') else '', p['eyes'])
    return (p['skin'], p['hair'], p['hair_style'], p['dress'], p['pattern'], p['outfit'],
            p['hair_acc'], p['legs'], p['accent'] if p['outfit'] == 'shorts' else '')


# -------------------------------------------------------------- descriptions
def _a(word):
    return 'an' if word[:1].lower() in 'aeiou' else 'a'


def _join(*parts):
    return ' '.join(x for x in parts if x)


def describe(p):
    """Return (title_en, title_fr, description, tags) for a parameter dict."""
    bg = {'solid': 'plain', 'gradient': 'gradient', 'dots': 'polka-dot', 'stripes': 'striped'}[p['bg_style']]
    if p['kind'] == 'nounours':
        a, ac = p['accessory'], p['accent']
        en = {
            'none': '',
            'bow_tie': f"with {_a(ac)} {ac} bow tie",
            'scarf': f"with {_a(ac)} {ac} scarf",
            'party_hat': f"with {_a(ac)} {ac} party hat",
            'heart': f"with {_a(ac)} {ac} heart on its belly",
            'ear_bow': f"with {_a(ac)} {ac} bow on its ear",
            'crown': "with a golden crown",
        }[a]
        fr = {
            'none': '',
            'bow_tie': f"avec un nœud papillon {p['accent_fr_m']}",
            'scarf': f"avec une écharpe {p['accent_fr_f']}",
            'party_hat': f"avec un chapeau de fête {p['accent_fr_m']}",
            'heart': f"avec un cœur {p['accent_fr_m']} sur le ventre",
            'ear_bow': f"avec un nœud {p['accent_fr_m']} sur l'oreille",
            'crown': "avec une couronne dorée",
        }[a]
        title_en = _join(f"{p['fur'].capitalize()} teddy bear", en)
        title_fr = _join(f"Nounours {p['fur_fr']}", fr)
        tags = ['teddy bear', 'nounours', 'toy', 'illustration', f"{p['fur']} fur"]
        if a != 'none':
            tags.append({'bow_tie': 'bow tie', 'scarf': 'scarf', 'party_hat': 'party hat', 'heart': 'heart',
                         'ear_bow': 'ear bow', 'crown': 'crown'}[a])
            if a != 'crown':
                tags.append(f"{ac} accessory")
        if p['eyes'] == 'happy':
            tags.append('happy eyes')
    else:
        hc, st = p['hair'], p['hair_style']
        hair_en = {'long': f"long {hc} hair", 'bob': f"a {hc} bob", 'pigtails': f"{hc} pigtails",
                   'buns': f"{hc} hair buns", 'braids': f"{hc} braids", 'short': f"short {hc} hair"}[st]
        h = p['hair_fr']
        hair_fr = {'long': f"aux longs cheveux {h}", 'bob': f"aux cheveux {h} au carré",
                   'pigtails': f"aux cheveux {h} en couettes", 'buns': f"aux cheveux {h} en chignons",
                   'braids': f"aux cheveux {h} en tresses", 'short': f"aux cheveux courts {h}"}[st]
        c, ac, pat = p['dress'], p['accent'], p['pattern']
        if p['outfit'] == 'dress':
            dress_en = {'plain': f"{c} dress", 'dots': f"{c} polka-dot dress", 'stripes': f"{c} striped dress",
                        'belt': f"{c} dress with a belt", 'hem_band': f"{c} dress with a {ac} hem band",
                        'heart': f"{c} dress with a heart"}[pat]
            outfit_en = f"in {_a(dress_en)} {dress_en}"
            outfit_fr = f"robe {p['dress_fr_f']}" + {
                'plain': '', 'dots': ' à pois', 'stripes': ' rayée', 'belt': ' avec ceinture',
                'hem_band': f" avec bordure {p['accent_fr_m']}", 'heart': ' avec un cœur'}[pat]
        else:
            shirt = f"{c} striped T-shirt" if pat == 'stripes' else f"{c} T-shirt"
            outfit_en = f"in {_a(shirt)} {shirt} and {ac} shorts"
            outfit_fr = (f"T-shirt {p['dress_fr_m']}" + (' rayé' if pat == 'stripes' else '')
                         + f" et short {p['accent_fr_m']}")
        title_en = f"Doll with {hair_en} {outfit_en}"
        title_fr = f"Poupée {hair_fr}, {outfit_fr}"
        tags = ['doll', 'poupée', 'toy', 'illustration', f"{hc} hair",
                {'long': 'long hair', 'bob': 'bob', 'pigtails': 'pigtails', 'buns': 'hair buns',
                 'braids': 'braids', 'short': 'short hair'}[st],
                f"{p['skin']} skin tone"]
        if p['outfit'] == 'dress':
            tags += ['dress', f"{c} dress"]
        else:
            tags += ['T-shirt', 'shorts', f"{c} T-shirt"]
        if pat != 'plain':
            tags.append({'dots': 'polka dots', 'stripes': 'stripes', 'belt': 'belt',
                         'hem_band': 'hem band', 'heart': 'heart'}[pat])
        if p['hair_acc'] != 'none':
            tags.append({'bow': 'hair bow', 'flower': 'hair flower', 'headband': 'headband'}[p['hair_acc']])
    description = f"{title_en}. Cartoon illustration on a {bg} pastel background."
    return title_en, title_fr, description, tags


# ------------------------------------------------------------------- render
def render(p):
    cv = Canvas(rgb(p['bg1']), p['bg_style'], rgb(p['bg2']), p['scale'], p['dx'], p['dy'])
    cv.shadow()
    (draw_bear if p['kind'] == 'nounours' else draw_doll)(cv, p)
    return cv.finish()

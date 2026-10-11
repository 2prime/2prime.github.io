#!/usr/bin/env python3
"""Create the original vector illustrations for the URGE / Stein blog.

Only Python's standard library is required. All probabilities and paths are
explicitly schematic teaching examples, not reconstructed experimental data.
Run this script from anywhere; output is resolved relative to this repository.
"""

from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "images" / "blog" / "diffusion_urge_stein"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)

INK = "#292a28"
SLATE = "#4f5551"
MUTED = "#696b65"
PAPER = "#fcfbf8"
CLOUD = "#f3f1ec"
LINE = "#dedcd5"
RED = "#842c36"
TEAL = "#526b60"
OCHRE = "#887358"
GRAY = "#69797e"
PALE_RED = "#f2e9e8"
PALE_TEAL = "#eaf0ec"


def element(parent, tag, **attrs):
    return ET.SubElement(parent, f"{{{NS}}}{tag}", {
        key.replace("_", "-"): str(value)
        for key, value in attrs.items() if value is not None
    })


class Drawing:
    def __init__(self, name, number, category, heading, description, height=660):
        self.name = name
        self.root = ET.Element(f"{{{NS}}}svg", {
            "width": "960", "height": str(height),
            "viewBox": f"0 0 960 {height}",
            "role": "img", "aria-labelledby": f"{name}-title {name}-desc",
            "lang": "zh-CN",
        })
        element(self.root, "title", id=f"{name}-title").text = heading
        element(self.root, "desc", id=f"{name}-desc").text = description
        defs = element(self.root, "defs")
        element(defs, "style").text = (
            "text { font-family: 'PingFang SC', 'Microsoft YaHei', "
            "'Noto Sans CJK SC', 'FandolHei', sans-serif; "
            "font-weight: 400; text-rendering: optimizeLegibility; }"
        )
        for name_, color in [("red", RED), ("teal", TEAL), ("slate", SLATE), ("muted", MUTED)]:
            marker = element(defs, "marker", id=f"arrow-{name_}",
                             viewBox="0 0 12 12", refX=10, refY=6,
                             markerWidth=12, markerHeight=12,
                             markerUnits="userSpaceOnUse", orient="auto-start-reverse")
            element(marker, "path", d="M 1 1 L 11 6 L 1 11 Z", fill=color)
        self.rect(0, 0, 960, height, PAPER)
        self.line(48, 57, 86, 57, RED, width=3)
        self.text(102, 65, f"{number:02d}  {category}", 24, RED)
        self.text(48, 113, heading, 34, INK)

    def text(self, x, y, content, size=28, color=INK, anchor="start", weight=None):
        node = element(self.root, "text", x=x, y=y, fill=color,
                       font_size=size, text_anchor=anchor, font_weight=weight)
        node.text = content
        return node

    def terminal_text(self, x, y, before="", after="", size=28, color=INK, anchor="start"):
        """Render a terminal x with a genuine T subscript, without raster text."""
        node = self.text(x, y, before + "x", size, color, anchor)
        element(node, "tspan", baseline_shift="sub", font_size=round(size * 0.75)).text = "T"
        element(node, "tspan", baseline_shift="baseline").text = after
        return node

    def rect(self, x, y, w, h, fill=CLOUD, stroke=None, radius=0, width=1.5):
        return element(self.root, "rect", x=x, y=y, width=w, height=h,
                       fill=fill, stroke=stroke, stroke_width=width if stroke else None,
                       rx=radius, ry=radius)

    def line(self, x1, y1, x2, y2, color=LINE, width=2, arrow=None, dash=None):
        return element(self.root, "line", x1=x1, y1=y1, x2=x2, y2=y2,
                       stroke=color, stroke_width=width, stroke_linecap="round",
                       marker_end=f"url(#arrow-{arrow})" if arrow else None,
                       stroke_dasharray=dash)

    def path(self, d, color=INK, width=3, fill="none", arrow=None, dash=None):
        return element(self.root, "path", d=d, stroke=color,
                       stroke_width=width, fill=fill, stroke_linejoin="round",
                       stroke_linecap="round",
                       marker_end=f"url(#arrow-{arrow})" if arrow else None,
                       stroke_dasharray=dash)

    def circle(self, x, y, r, fill=PAPER, stroke=None, width=2):
        return element(self.root, "circle", cx=x, cy=y, r=r, fill=fill,
                       stroke=stroke, stroke_width=width if stroke else None)

    def write(self):
        OUT.mkdir(parents=True, exist_ok=True)
        ET.indent(self.root, space="  ")
        target = OUT / f"{self.name}.svg"
        ET.ElementTree(self.root).write(target, encoding="utf-8", xml_declaration=True)
        ET.parse(target)
        return target


def book(d, x, y, scale=1, color=SLATE):
    """An open book, with a central fold and distinct left/right pages."""
    s = scale
    d.path(f"M {x} {y+7*s} Q {x+20*s} {y-2*s} {x+40*s} {y+9*s} "
           f"Q {x+60*s} {y-2*s} {x+80*s} {y+7*s} L {x+80*s} {y+57*s} "
           f"Q {x+60*s} {y+48*s} {x+40*s} {y+59*s} "
           f"Q {x+20*s} {y+48*s} {x} {y+57*s} Z", color, 2.5, PAPER)
    d.line(x+40*s, y+9*s, x+40*s, y+59*s, color, 2.5)
    for k in [0, 1, 2]:
        yy = y+(22+10*k)*s
        d.path(f"M {x+10*s} {yy} Q {x+20*s} {yy-2*s} {x+31*s} {yy+2*s}", color, 1.7)
        d.path(f"M {x+49*s} {yy+2*s} Q {x+60*s} {yy-2*s} {x+70*s} {yy}", color, 1.7)


def laptop(d, x, y, scale=1):
    s = scale
    d.rect(x+9*s, y, 70*s, 45*s, PALE_TEAL, TEAL, 3, 2.5)
    d.path(f"M {x+9*s} {y+45*s} L {x} {y+55*s} L {x+88*s} {y+55*s} "
           f"L {x+79*s} {y+45*s} Z", TEAL, 2.5, PAPER)
    d.line(x+30*s, y+49*s, x+58*s, y+49*s, TEAL, 1.5)


def target():
    d = Drawing("target", 1, "教学示例", "从原始生成，到偏好分布",
                "教学示例，不是论文实验。只有书和书加电脑的原始概率分别为百分之八十与百分之二十。"
                "将它们乘以正偏好权重一与四后，加权质量均为零点八，归一化后两类的目标概率均为百分之五十。",
                650)
    d.text(48, 157, "先乘正的偏好权重，再把总概率归一化。", 28, SLATE)
    for x, label in [(156, "生成结果"), (382, "原始概率 p"), (568, "偏好权重 φ"), (805, "目标概率 π")]:
        d.text(x, 211, label, 26, MUTED, "middle")
    d.rect(48, 234, 864, 142, CLOUD, radius=4)
    d.rect(48, 395, 864, 142, CLOUD, radius=4)
    book(d, 114, 252, 1.05)
    d.text(156, 354, "只有书", 28, INK, "middle")
    book(d, 80, 421, 0.86)
    laptop(d, 164, 422, 0.92)
    d.text(156, 514, "书和电脑", 28, INK, "middle")
    for y, probability, phi in [(321, "80%", "1"), (482, "20%", "4")]:
        d.text(382, y, probability, 40, SLATE, "middle")
        d.text(469, y-3, "×", 32, MUTED, "middle")
        d.text(568, y, phi, 40, RED, "middle")
        d.line(653, y-13, 701, y-13, MUTED, 2.5, "muted")
        d.text(805, y, "50%", 40, RED, "middle")
    d.text(480, 588, "0.8 × 1 = 0.2 × 4 = 0.8", 32, INK, "middle")
    d.text(480, 627, "两类加权质量相同，归一化后各占 50%。", 26, SLATE, "middle")
    return d.write()


def path_weight():
    d = Drawing("path_weight", 2, "路径权重", "同一个终点，也可能来自不同路径",
                "两条示意轨迹从同一起点出发，经过不同中间状态，到达同一个终点。"
                "每一步记录原始转移概率与实际提议概率的比值。终点奖励相同，并不意味着整条路径权重相同。"
                "完整路径概率比需要包含实际采用的采样机制及其必要随机变量。",
                660)
    d.text(48, 157, "记录实际走过的路，计算整条路径的权重", 28, SLATE)
    d.text(480, 193, "每一步，都比较原始概率 P 与提议概率 Q", 25, MUTED, "middle")
    upper = [(110, 338), (301, 275), (494, 271), (676, 290), (850, 338)]
    lower = [(110, 338), (301, 419), (494, 414), (676, 444), (850, 338)]
    d.path("M 110 338 C 170 250 236 299 301 275 S 424 227 494 271 S 611 255 676 290 S 781 286 850 338", TEAL, 4)
    d.path("M 110 338 C 172 438 231 377 301 419 S 425 368 494 414 S 612 397 676 444 S 798 397 850 338", RED, 4)
    for points, color in [(upper, TEAL), (lower, RED)]:
        for x, y in points[1:-1]:
            d.circle(x, y, 7, PAPER, color, 3)
    d.circle(110, 338, 12, INK)
    d.circle(850, 338, 12, INK)
    d.text(110, 383, "x₀", 28, INK, "middle")
    d.terminal_text(850, 383, size=28, anchor="middle")
    d.text(70, 251, "路径 A", 27, TEAL)
    d.text(168, 486, "路径 B", 27, RED)
    for x, y, label, color in [(242, 254, "P₁ / Q₁", TEAL),
                                (404, 228, "P₂ / Q₂", TEAL),
                                (621, 252, "…", TEAL),
                                (230, 444, "P₁ / Q₁", RED),
                                (422, 487, "P₂ / Q₂", RED),
                                (681, 487, "…", RED)]:
        d.text(x, y, label, 25, color, "middle")
    d.rect(48, 522, 864, 95, CLOUD, radius=4)
    d.terminal_text(185, 579, before="R = φ(", after=") ×", size=31)
    d.text(644, 559, "P(整条路径)", 28, INK, "middle")
    d.line(520, 572, 770, 572, INK, 1.5)
    d.text(644, 605, "Q(整条路径)", 28, INK, "middle")
    d.text(480, 649, "终点奖励相同，路径概率比仍可不同。", 27, SLATE, "middle")
    return d.write()


def ancestry_node(d, x, y, letter, color, r=18):
    d.circle(x, y, r, color)
    d.text(x, y+8, letter, 24, PAPER, "middle")


def genealogy():
    d = Drawing("genealogy", 3, "祖先相关性", "粒子很多，不等于独立的信息很多",
                "左图反复重采样仍保留四个粒子，但祖先家族由四个变成两个再变成一个。"
                "分支共享已生成的前缀，复制后的后续噪声仍然可以独立。"
                "右图四条完整提议由各自独立随机性生成，分别标记 A、B、C、D。"
                "独立性只指提议轨迹，后续的 MH 链输出仍然可能相关。",
                670)
    d.rect(48, 156, 416, 466, CLOUD, radius=4)
    d.rect(496, 156, 416, 466, CLOUD, radius=4)
    d.text(72, 202, "反复重采样", 30, RED)
    d.text(520, 202, "独立生成完整提议", 28, TEAL)
    for x, label in [(107, "开始"), (256, "复制"), (414, "再复制")]:
        d.text(x, 247, label, 24, MUTED, "middle")
    d.text(705, 247, "每条路径使用独立随机性", 24, MUTED, "middle")
    ys = [292, 357, 422, 487]
    colors = [RED, TEAL, OCHRE, GRAY]
    # A and C reproduce; B and D leave no descendants. Every child edge is
    # a separate continuation, rather than a duplicated complete trajectory.
    links = [(107, ys[0], 256, ys[0], RED), (107, ys[0], 256, ys[1], RED),
             (107, ys[2], 256, ys[2], OCHRE), (107, ys[2], 256, ys[3], OCHRE),
             (256, ys[0], 414, ys[0], RED), (256, ys[0], 414, ys[1], RED),
             (256, ys[1], 414, ys[2], RED), (256, ys[1], 414, ys[3], RED)]
    for x1, y1, x2, y2, color in links:
        midpoint = (x1+x2)/2
        d.path(f"M {x1} {y1} C {midpoint-24} {y1-11} {midpoint+24} {y2+11} {x2} {y2}", color, 3)
    for y, letter, color in zip(ys, "ABCD", colors):
        ancestry_node(d, 107, y, letter, color)
    for y, letter, color in zip(ys, "AACC", [RED, RED, OCHRE, OCHRE]):
        ancestry_node(d, 256, y, letter, color)
    for y in ys:
        ancestry_node(d, 414, y, "A", RED)
    for index, (y, letter, color) in enumerate(zip(ys, "ABCD", colors)):
        swing = [16, -16, 19, -14][index]
        d.path(f"M 548 {y} C 593 {y+swing} 620 {y-swing} 660 {y-2} "
               f"S 710 {y+swing} 755 {y+3} S 808 {y-swing} 862 {y}", color, 3.2)
        ancestry_node(d, 548, y, letter, color)
        ancestry_node(d, 862, y, letter, color)
    d.text(257, 550, "4 族 → 2 族 → 1 族", 28, RED, "middle")
    d.text(705, 550, "4 条独立的完整提议", 28, TEAL, "middle")
    d.text(257, 589, "共享前缀，后续噪声仍可独立", 24, SLATE, "middle")
    d.text(705, 589, "独立的是提议轨迹", 26, SLATE, "middle")
    d.text(480, 655, "家族字母表示祖先来源；曲线表示各自的随机延续。", 24, MUTED, "middle")
    return d.write()


def two_queries():
    d = Drawing("two_queries", 4, "对称双查询", "两次函数值查询，也能产生方向",
                "教学示例。候选点关于均值 μ 对称，位移为正负根号 h 乘以 σZ。"
                "若 H 正为四、H 负为一，则分别以百分之八十与百分之二十的概率选择，"
                "并非每次都选择高价值点。此给定查询对的平均位移为零点六倍正向位移。"
                "对称平均 S 等于两个函数值的均值；在平滑小步长展开中，相反的一阶扰动相互抵消。",
                680)
    d.text(48, 157, "先提出两个对称候选，再按价值比例随机选择。", 28, SLATE)
    d.text(480, 208, "以下数值只用于说明抽样概率", 24, MUTED, "middle")
    d.text(183, 252, "H⁻ = 1", 32, SLATE, "middle")
    d.text(777, 252, "H⁺ = 4", 32, RED, "middle")
    d.rect(82, 274, 204, 44, CLOUD, radius=4)
    d.rect(675, 274, 204, 44, PALE_RED, radius=4)
    d.text(184, 305, "选择概率 20%", 25, SLATE, "middle")
    d.text(777, 305, "选择概率 80%", 25, RED, "middle")
    d.line(145, 363, 815, 363, LINE, 3)
    d.circle(184, 363, 12, SLATE)
    d.circle(480, 363, 9, INK)
    d.circle(776, 363, 12, RED)
    d.text(184, 345, "Y⁻", 28, SLATE, "middle")
    d.text(480, 341, "μ", 30, INK, "middle")
    d.text(776, 345, "Y⁺", 28, RED, "middle")
    d.line(461, 397, 207, 397, MUTED, 2, "muted")
    d.line(499, 397, 753, 397, RED, 2, "red")
    d.text(333, 435, "−√h σZ", 28, SLATE, "middle")
    d.text(628, 435, "+√h σZ", 28, RED, "middle")
    d.text(184, 486, "μ = x + h b(x)", 28, SLATE, "middle")
    # Conditional on this query pair: (0.8 - 0.2) * delta = 0.6 * delta.
    d.line(480, 474, 658, 474, RED, 4, "red")
    d.text(663, 514, "本组候选的平均位移：0.6 √h σZ", 26, RED, "middle")
    d.rect(48, 548, 864, 105, CLOUD, radius=4)
    d.text(480, 591, "S = (H⁺ + H⁻) / 2", 31, INK, "middle")
    d.text(480, 632, "平滑小步长下，相反的一阶波动相互抵消。", 27, SLATE, "middle")
    return d.write()


def outer_mh():
    d = Drawing("outer_mh", 5, "整条路径的 MH", "独立提议，逐条校正",
                "上方并行生成独立的完整提议轨迹，每条记录自身的重要性权重 R。"
                "下方为按顺序处理的教学示例：旧路径权重为二，新提议权重为一，"
                "接受概率为二分之一，本例抽样结果为拒绝，因此仍保留旧路径及权重二。"
                "下一条新提议权重为三，接受概率为一，接受新路径。"
                "即使独立生成提议，MH 链的连续输出仍然相关。",
                680)
    d.text(48, 157, "每次比较新旧路径的权重，再接受或保留。", 28, SLATE)
    d.rect(48, 180, 864, 148, CLOUD, radius=4)
    d.text(80, 237, "并行生成", 29, TEAL)
    d.text(80, 281, "完整提议", 29, TEAL)
    for index, (y, color, label) in enumerate([(211, GRAY, "R = 1"), (254, TEAL, "R = 3"), (297, OCHRE, "R = …")]):
        amplitude = [10, -10, 9][index]
        d.path(f"M 279 {y} C 330 {y+amplitude} 370 {y-amplitude} 421 {y+1} "
               f"S 507 {y+amplitude} 550 {y-2} S 638 {y-amplitude} 703 {y}", color, 3)
        d.circle(279, y, 5, color)
        d.circle(703, y, 6, color)
        d.text(765, y+9, label, 28, color)
    d.text(48, 374, "按顺序进行 MH", 28, INK)
    d.text(912, 374, "接受与拒绝为教学示例", 24, MUTED, "end")
    for x, label, alpha, color in [(320, "新 R = 1", "α = 1/2", RED), (640, "新 R = 3", "α = 1", TEAL)]:
        d.text(x, 422, label, 27, SLATE, "middle")
        d.text(x, 457, alpha, 28, color, "middle")
    for x, name, value, color, fill in [(64, "路径 A", "R = 2", RED, PALE_RED),
                                      (392, "路径 A", "R = 2", RED, PALE_RED),
                                      (720, "路径 B", "R = 3", TEAL, PALE_TEAL)]:
        d.rect(x, 479, 176, 86, fill, color, 4, 1.5)
        d.text(x+88, 514, name, 26, color, "middle")
        d.text(x+88, 550, value, 31, color, "middle")
    d.line(256, 522, 375, 522, RED, 3, "red")
    d.line(584, 522, 703, 522, TEAL, 3, "teal")
    d.text(320, 578, "本次拒绝", 26, RED, "middle")
    d.text(640, 578, "接受", 26, TEAL, "middle")
    d.text(48, 625, "拒绝时，保留旧路径与旧权重", 28, INK)
    d.text(48, 663, "MH 链的连续输出仍然相关", 28, SLATE)
    return d.write()


def main():
    for generate in (target, path_weight, genealogy, two_queries, outer_mh):
        print(generate())


if __name__ == "__main__":
    main()

"""Classical computer-vision soiling analyser.

This is a real image-analysis pipeline: it segments the PV panel, masks
specular glare and metallic busbars, measures the fraction of the panel
surface covered by dirt/soiling, detects compact bright contamination
(droppings) and converts those measurements into calibrated class scores.

It is deliberately NOT a neural network. It needs no training data, runs on
CPU in a few milliseconds and is fully explainable from its metrics. If a
trained CNN is supplied (``model_path``), the application prefers that model
instead; otherwise this analyser is the real detection engine.
"""

from __future__ import annotations

import time
from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageFilter

from .inference import CLASS_LABELS, InferenceResult, PanelSoilingClassifier

ANALYSIS_SIZE = 512
GRID_COLS = 16
GRID_ROWS = 12


@dataclass
class _CellStats:
    panel: bool
    dirt: float
    brown: float
    clump: float
    bright: float
    glare: float
    contrast: float


def _resize_for_analysis(image: Image.Image) -> Image.Image:
    w, h = image.size
    scale = ANALYSIS_SIZE / max(w, h)
    if scale >= 1:
        return image
    return image.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.BILINEAR)


def _softmax(scores: dict[str, float]) -> dict[str, float]:
    items = list(scores.items())
    vals = np.array([s for _, s in items], dtype=np.float64)
    vals = vals - vals.max()
    exp = np.exp(vals)
    total = float(exp.sum())
    return {k: float(v / total) for (k, _), v in zip(items, exp)}


def _grid_bounds(width: int, height: int) -> list[tuple[int, int]]:
    xs = np.linspace(0, width, GRID_COLS + 1).astype(int)
    ys = np.linspace(0, height, GRID_ROWS + 1).astype(int)
    return list(zip(xs.tolist(), ys.tolist()))


def _dilate(mask: np.ndarray, passes: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(passes):
        m = out.copy()
        m[1:, :] |= out[:-1, :]
        m[:-1, :] |= out[1:, :]
        m[:, 1:] |= out[:, :-1]
        m[:, :-1] |= out[:, 1:]
        out = m
    return out


def _erode(mask: np.ndarray, passes: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(passes):
        m = out.copy()
        m[1:, :] &= out[:-1, :]
        m[:-1, :] &= out[1:, :]
        m[:, 1:] &= out[:, :-1]
        m[:, :-1] &= out[:, 1:]
        m[0, :] = False
        m[-1, :] = False
        m[:, 0] = False
        m[:, -1] = False
        out = m
    return out


def _close(mask: np.ndarray, passes: int = 1) -> np.ndarray:
    return _erode(_dilate(mask, passes), passes)


def _analyse_cells(image: Image.Image) -> tuple[list[_CellStats], float, float, float]:
    img = _resize_for_analysis(image.convert("RGB"))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    h, w = arr.shape[:2]
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    v = mx
    s = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0.0)

    # Photovoltaic cells are blue-dominant and reasonably dark. This excludes
    # wood, sky, cables, hands and most frames from the surface statistics.
    blue = (b > r + 0.05) & (b >= g * 0.92) & (v < 0.78) & (s > 0.16)

    glare = (v > 0.90) & (s < 0.16)
    structure = (v > 0.70) & (s < 0.17)

    brown = (r > b + 0.015) & (v > 0.07) & (v < 0.74) & (s > 0.07)
    dark_clump = brown & (v < 0.44) & (s > 0.17)
    bright = (v > 0.58) & (s < 0.24)
    # Droppings are opaque white/grey or slightly warm. Specular reflections
    # over blue cells keep a blue cast (b > r) and must not count as birds.
    warm_bright = (v > 0.60) & (s < 0.18) & (r >= b - 0.01)

    # Reference clean-surface colour, taken from the blue cells themselves, so
    # the analyser adapts to exposure, white balance and wetness.
    ref_s = float(np.median(s[blue])) if blue.any() else 0.5
    ref_v = float(np.median(v[blue])) if blue.any() else 0.5

    # Remove thin bright lines (busbars, frame edges) from the bright mask so
    # only compact blobs remain.
    # Only compact, opaque bright areas count: drop thin busbar/glare flecks.
    bright_mask = Image.fromarray(((bright & warm_bright) * 255).astype(np.uint8))
    bright_mask = bright_mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    bright_blobs = np.asarray(bright_mask) > 127

    xs, ys = np.linspace(0, w, GRID_COLS + 1).astype(int), np.linspace(0, h, GRID_ROWS + 1).astype(int)
    cells: list[_CellStats] = []
    grid = np.zeros((GRID_ROWS, GRID_COLS), dtype=bool)

    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            x0, x1 = int(xs[col]), int(xs[col + 1])
            y0, y1 = int(ys[row]), int(ys[row + 1])
            if x1 - x0 < 4 or y1 - y0 < 4:
                cells.append(_CellStats(False, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0))
                continue
            sl = (slice(y0, y1), slice(x0, x1))
            cell_v = v[sl]
            cell_s = s[sl]
            cell_blue = blue[sl]
            cell_glare = glare[sl]
            cell_structure = structure[sl]
            cell_base = ~cell_glare

            blue_frac = float(cell_blue.mean())
            v_median = float(np.median(cell_v))
            is_panel = blue_frac > 0.22 and v_median < 0.68
            grid[row, col] = is_panel

            denom = max(1, int(cell_base.sum()))
            # Dust veil: surface pixels that lost saturation without getting
            # brighter (bright wet reflections are excluded by the value cap).
            desat = (
                cell_base
                & (b[sl] > r[sl] + 0.02)
                & (cell_s > 0.05)
                & (cell_v < 0.8)
                & (cell_v < ref_v * 1.06)
                & (cell_s < 0.86 * ref_s)
            )
            dirt = cell_base & ((brown[sl] & ~cell_blue) | desat)
            dirt_frac = float(dirt.sum()) / denom
            brown_frac = float((brown[sl] & ~cell_blue & ~cell_glare).sum()) / denom
            clump_frac = float((dark_clump[sl] & ~cell_glare).sum()) / denom
            bright_frac = float((bright_blobs[sl] & ~cell_glare).sum()) / denom
            glare_frac = float(cell_glare.mean())

            gray = cell_v
            contrast = float(gray.std()) if gray.size else 0.0
            cells.append(
                _CellStats(
                    panel=is_panel,
                    dirt=dirt_frac,
                    brown=brown_frac,
                    clump=clump_frac,
                    bright=bright_frac,
                    glare=glare_frac,
                    contrast=contrast,
                )
            )

    # Dirt clumps can hide the blue cells underneath, so fill small holes in
    # the panel mask (a clump spanning a cell must still count as panel area).
    filled = _close(grid, passes=1)
    for idx, cell in enumerate(cells):
        row, col = divmod(idx, GRID_COLS)
        if filled[row, col] and not cell.panel:
            if cell.dirt > 0.35 or cell.bright > 0.45:
                cell.panel = True

    if not any(c.panel for c in cells):
        # Fallback: no blue panel found (washed-out photo). Analyse the central
        # area so the user still gets a result, and warn about it upstream.
        cx0, cx1 = int(w * 0.1), int(w * 0.9)
        cy0, cy1 = int(h * 0.1), int(h * 0.9)
        for row in range(GRID_ROWS):
            for col in range(GRID_COLS):
                x0, x1 = int(xs[col]), int(xs[col + 1])
                y0, y1 = int(ys[row]), int(ys[row + 1])
                centre_x = (x0 + x1) / 2
                centre_y = (y0 + y1) / 2
                if cx0 <= centre_x <= cx1 and cy0 <= centre_y <= cy1:
                    cells[row * GRID_COLS + col].panel = True

    return cells, float(blue.mean()), float(glare.mean()), ref_s


def _heatmap(cells: list[_CellStats], size: tuple[int, int]) -> np.ndarray:
    grid = np.zeros((GRID_ROWS, GRID_COLS), dtype=np.float32)
    for idx, cell in enumerate(cells):
        row, col = divmod(idx, GRID_COLS)
        if cell.panel:
            value = max(0.0, min(1.0, cell.dirt * 1.6 + cell.clump * 1.2))
            grid[row, col] = value
    img = Image.fromarray((grid * 255).astype(np.uint8), mode="L")
    img = img.resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(max(2, size[0] // 60)))
    return np.asarray(img, dtype=np.float32) / 255.0


def analyse_soiling(image: Image.Image) -> InferenceResult:
    """Run the classical CV analyser and return a measured (non-demo) result."""
    start = time.perf_counter()
    report = PanelSoilingClassifier.check_quality(image)
    cells, blue_frac, glare_frac, ref_s = _analyse_cells(image)

    panel_cells = [c for c in cells if c.panel]
    panel_count = max(1, len(panel_cells))
    coverage = 100.0 * sum(c.dirt for c in panel_cells) / panel_count
    coverage = float(max(0.0, min(100.0, coverage)))
    clump_frac = sum(c.clump for c in panel_cells) / panel_count
    brown_frac = sum(c.brown for c in panel_cells) / panel_count
    sharpness = float(np.mean([c.contrast for c in panel_cells]))

    # Compact bright blobs concentrated in one area indicate droppings; wet
    # sheen or droplets spread bright pixels across many cells instead.
    bright_grid = np.zeros((GRID_ROWS, GRID_COLS), dtype=np.float32)
    for idx, cell in enumerate(cells):
        row, col = divmod(idx, GRID_COLS)
        if cell.panel:
            bright_grid[row, col] = cell.bright
    max_block = 0.0
    for row in range(GRID_ROWS - 1):
        for col in range(GRID_COLS - 1):
            block = bright_grid[row : row + 2, col : col + 2]
            max_block = max(max_block, float(block.mean()))
    bright_area = float(bright_grid.mean())
    spread = float((bright_grid > 0.08).mean())

    bird_score = 0.0
    localized = (
        0.0006 < bright_area < 0.05
        and max_block > 0.03
        and spread < 0.08
        and coverage < 15.0
        and brown_frac < 0.03
        and clump_frac < 0.01
    )
    if localized:
        bird_score = min(1.0, 0.6 + (max_block - 0.03) * 2.0 + bright_area * 2.0)

    # Class logits: proximity of the measured coverage to each class centre,
    # plus a separate, evidence-gated bird-dropping logit. Centres were
    # calibrated on real phone photos and synthetic renders.
    logits = {
        "clean": -(abs(coverage - 1.0) / 1.6),
        "lightly_dusty": -(abs(coverage - 8.0) / 5.0),
        "heavily_dusty": -(abs(coverage - 27.0) / 11.0),
        "bird_dropping": (-4.0 + 6.5 * bird_score) if bird_score > 0.25 else -4.5,
    }
    probabilities = {k: round(v, 5) for k, v in _softmax(logits).items()}
    predicted = max(probabilities, key=probabilities.get)
    confidence = float(probabilities[predicted])

    warnings = list(report.warnings)
    if blue_frac < 0.08:
        warnings.append(
            "The blue panel surface was not clearly detected; point the camera squarely at the panel for "
            "reliable coverage numbers."
        )
    if glare_frac > 0.25:
        warnings.append("Large specular reflection excluded from the measurement; fill the frame with the panel and avoid direct sun glare.")

    severity = (
        "clean"
        if predicted == "clean"
        else "light soiling"
        if predicted == "lightly_dusty"
        else "heavy soiling"
        if predicted == "heavily_dusty"
        else "localized contamination"
    )
    message = (
        f"Measured {coverage:.1f}% dirt coverage on the detected panel surface ({severity}). "
        "Computed by the built-in computer-vision analyser (panel segmentation, glare masking, "
        "dirt-coverage statistics, blob detection). This is a real image measurement, not a trained "
        "neural network; use expert confirmation to label samples and improve calibration."
    )

    gradcam = _heatmap(cells, image.size)
    elapsed = (time.perf_counter() - start) * 1000.0
    metrics = {
        "dust_coverage_pct": round(coverage, 2),
        "clump_coverage_pct": round(clump_frac * 100.0, 2),
        "brown_coverage_pct": round(brown_frac * 100.0, 2),
        "bright_blob_area_pct": round(bright_area * 100.0, 2),
        "max_blob_density": round(max_block, 3),
        "bright_spread": round(spread, 3),
        "panel_area_pct": round(blue_frac * 100.0, 2),
        "glare_area_pct": round(glare_frac * 100.0, 2),
        "panel_sharpness": round(sharpness, 4),
        "reference_saturation": round(ref_s, 3),
    }

    return InferenceResult(
        predicted_class=predicted,
        confidence=confidence,
        probabilities=probabilities,
        model_name="SoilingGuard VisionAnalyzer",
        model_version="cv-1.0",
        inference_ms=round(elapsed, 2),
        available=True,
        demo=False,
        message=message,
        gradcam=gradcam,
        warnings=warnings,
        metrics=metrics,
    )


VISION_INFO = {
    "available": True,
    "name": "SoilingGuard VisionAnalyzer",
    "version": "cv-1.0",
    "framework": "numpy/PIL classical CV",
    "classes": list(CLASS_LABELS.keys()),
    "input_size": (ANALYSIS_SIZE, ANALYSIS_SIZE),
    "trained_for_four_class": False,
    "trained_on": None,
    "notes": (
        "No trained CNN weights are loaded. Captured frames are measured with a deterministic "
        "computer-vision pipeline (PV-cell segmentation, glare masking, dirt-coverage statistics and "
        "blob detection). It is a real analysis of the image, not a neural network, and its accuracy "
        "depends on framing and lighting."
    ),
}

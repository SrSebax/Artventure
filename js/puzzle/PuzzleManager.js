export class PuzzleManager {
  constructor(game) {
    this.game = game;

    this.screen = document.getElementById("puzzleScreen");

    // 🔥 Mover la jerarquía al body para escapar de las restricciones de 960px y ser verdaderamente "Tamaño Completo"
    if (this.screen && this.screen.parentElement !== document.body) {
        document.body.appendChild(this.screen);
    }

    this.board = document.getElementById("puzzleBoard");
    this.piecesTray = document.getElementById("puzzlePieces");

    this.continueBtn = document.getElementById("puzzleContinue");
    this.retryBtn = document.getElementById("puzzleRetry");
    this.menuBtn = document.getElementById("puzzleMenu");

    this.columns = 4;
    this.rows = 3;

    this.totalPieces = this.columns * this.rows;

    this.cellWidth = 0;
    this.cellHeight = 0;

    this.placedCount = 0;

    this.draggedPiece = null;
    this.offset = { x: 0, y: 0 };

    this._initEvents();
  }

  _initEvents() {
    document.addEventListener("mousedown", (e) => this._onStart(e));
    document.addEventListener("mousemove", (e) => this._onMove(e));
    document.addEventListener("mouseup", () => this._onEnd());

    this.continueBtn.addEventListener("click", () => {
      if (this.continueBtn.classList.contains("enabled")) {
        this.screen.style.display = "none";
        this.game.nextLevel();
      }
    });

    this.retryBtn.addEventListener("click", () => {
      if (confirm("¿Reintentar nivel? Perderás este puzzle.")) {
        this.screen.style.display = "none";
        this.game.start(this.game.currentLevelIdx);
      }
    });

    this.menuBtn.addEventListener("click", () => {
      if (confirm("¿Volver al menú principal?")) {
        location.reload();
      }
    });
  }

  async setup(artwork, collectedIndices) {
    this.collectedIndices = collectedIndices || [];

    this.screen.style.display = "flex";
    this.continueBtn.classList.remove("enabled");
    this.continueBtn.textContent = "ESPERANDO PIEZAS...";

    document.getElementById("artTitle").textContent =
      artwork.nombre || "Título Desconocido";
    document.getElementById("artAuthor").textContent =
      artwork.autor || "Anónimo";
    document.getElementById("artYear").textContent = artwork.año || "????";
    document.getElementById("artLink").href = artwork.link || "#";

    this.board.innerHTML = "";
    this.piecesTray.innerHTML = "";

    this.placedCount = 0;

    const img = new Image();

    img.src = `assets/${artwork.folder}/completa.jpeg`;

    img.onload = () => {
      this._prepareBoard(img);

      this._createPieces(img);
    };
  }

  _prepareBoard(img) {
    const ratio = img.naturalHeight / img.naturalWidth;

    // 🔥 Calcular espacio máximizado dinámico del "Tamaño Completo" de la pantalla
    const availableW = window.innerWidth - 280 /*InfoPanel*/ - 260 /*Tray*/ - 80 /*Padding*/;
    const availableH = window.innerHeight - 80 /*Padding*/;

    let baseWidth = availableW;
    let baseHeight = baseWidth * ratio;

    // Si la altura calculada excede el espacio vertical, escalar a la inversa
    if (baseHeight > availableH) {
        baseHeight = availableH;
        baseWidth = baseHeight / ratio;
    }

    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.cellWidth = baseWidth / this.columns;

    this.cellHeight = baseHeight / this.rows;

    // 🔥 tamaño pestaña unificado
    this.P = Math.min(this.cellWidth, this.cellHeight) * 0.3;

    // 🔥 EXPANDIR tablero
    this.boardW = baseWidth + this.P * 2;

    this.boardH = baseHeight + this.P * 2;

    this.board.style.width = `${this.boardW}px`;

    this.board.style.height = `${this.boardH}px`;

    this.board.innerHTML = `
        <img 
            id="puzzleGuide"
            src="${img.src}"
            style="
                position:absolute;
                left:${this.P}px;
                top:${this.P}px;
                width:${baseWidth}px;
                height:${baseHeight}px;
            "
        />
    `;
  }

  _createPieces(img) {
    const imgSrc = img.src;

    this.hTabs = [];
    for (let r = 0; r < this.rows - 1; r++) {
      this.hTabs[r] = [];
      for (let c = 0; c < this.columns; c++) {
        this.hTabs[r][c] = Math.random() > 0.5 ? 1 : -1;
      }
    }

    this.vTabs = [];
    for (let r = 0; r < this.rows; r++) {
      this.vTabs[r] = [];
      for (let c = 0; c < this.columns - 1; c++) {
        this.vTabs[r][c] = Math.random() > 0.5 ? 1 : -1;
      }
    }

    const allGeneratedPieces = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        const idx = r * this.columns + c;

        if (!this.collectedIndices.includes(idx)) {
          continue; // Pieza no fue recolectada, no la ponemos en la bandeja
        }

        const piece = document.createElement("div");

        piece.classList.add("puzzle-piece", "in-tray");

        const correctX = c * this.cellWidth;

        const correctY = r * this.cellHeight;

        piece.dataset.correctX = correctX;

        piece.dataset.correctY = correctY;

        const totalW = this.cellWidth + 2 * this.P;
        const totalH = this.cellHeight + 2 * this.P;

        piece.style.width = `${totalW}px`;

        piece.style.height = `${totalH}px`;

        const svgContent = this._generatePieceSVG(
          r,
          c,
          this.cellWidth,
          this.cellHeight,
          this.P,
          imgSrc,
          this.baseWidth,
          this.baseHeight
        );

        piece.appendChild(svgContent);

        allGeneratedPieces.push(piece);
      }
    }

    // 🔥 Desordenar visualmente las fichas del tray aleatoriamente
    allGeneratedPieces.sort(() => Math.random() - 0.5).forEach(p => {
        this.piecesTray.appendChild(p);
    });
  }

  _generatePieceSVG(r, c, cw, ch, P, imgSrc, boardW, boardH) {
    const topTab = r === 0 ? 0 : -this.hTabs[r - 1][c];
    const bottomTab = r === this.rows - 1 ? 0 : this.hTabs[r][c];
    const leftTab = c === 0 ? 0 : -this.vTabs[r][c - 1];
    const rightTab = c === this.columns - 1 ? 0 : this.vTabs[r][c];

    function drawEdge(x1, y1, x2, y2, tabDir) {
      if (tabDir === 0) return `L ${x2},${y2} `;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);

      const minDim = Math.min(cw, ch);
      const tabNeck = minDim * 0.2;
      const R = minDim * 0.15;

      const ux = dx / len;
      const uy = dy / len;

      const centerX = x1 + dx * 0.5;
      const centerY = y1 + dy * 0.5;

      const p1x = centerX - ux * (tabNeck / 2);
      const p1y = centerY - uy * (tabNeck / 2);

      const p2x = centerX + ux * (tabNeck / 2);
      const p2y = centerY + uy * (tabNeck / 2);

      const sweep = tabDir === 1 ? 1 : 0;

      return `L ${p1x},${p1y} A ${R} ${R} 0 1 ${sweep} ${p2x},${p2y} L ${x2},${y2} `;
    }

    let path = `M ${P},${P} `;
    path += drawEdge(P, P, cw + P, P, topTab);
    path += drawEdge(cw + P, P, cw + P, ch + P, rightTab);
    path += drawEdge(cw + P, ch + P, P, ch + P, bottomTab);
    path += drawEdge(P, ch + P, P, P, leftTab);
    path += "Z";

    const totalW = cw + 2 * P;
    const totalH = ch + 2 * P;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`);
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";

    const defs = document.createElementNS(svgNS, "defs");
    const clipPath = document.createElementNS(svgNS, "clipPath");
    const clipId = `clip-${r}-${c}-${Math.random().toString(36).substr(2, 6)}`;
    clipPath.setAttribute("id", clipId);

    const pathEl = document.createElementNS(svgNS, "path");
    pathEl.setAttribute("d", path);
    clipPath.appendChild(pathEl);
    defs.appendChild(clipPath);
    svg.appendChild(defs);

    const image = document.createElementNS(svgNS, "image");
    image.setAttribute("href", imgSrc);
    image.setAttribute("width", boardW); // baseWidth
    image.setAttribute("height", boardH); // baseHeight
    image.setAttribute("x", P - c * cw);
    image.setAttribute("y", P - r * ch);
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("clip-path", `url(#${clipId})`);

    const borderEl = document.createElementNS(svgNS, "path");
    borderEl.setAttribute("d", path);
    borderEl.setAttribute("fill", "none");
    borderEl.setAttribute("stroke", "rgba(255,255,255,0.4)");
    borderEl.setAttribute("stroke-width", "2");

    svg.appendChild(image);
    svg.appendChild(borderEl);

    return svg;
  }

  _onStart(e) {
    const target = e.target.closest(".puzzle-piece");

    if (!target) return;

    this.draggedPiece = target;

    const rect = target.getBoundingClientRect();

    this.offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (target.classList.contains("in-tray")) {
      target.classList.remove("in-tray");

      this.board.appendChild(target);

      target.style.left = `${
        Math.random() * (this.board.clientWidth - target.offsetWidth)
      }px`;

      target.style.top = `${
        Math.random() * (this.board.clientHeight - target.offsetHeight)
      }px`;
    }
  }

  _onMove(e) {
    if (!this.draggedPiece) return;

    const boardRect = this.board.getBoundingClientRect();

    let x = e.clientX - boardRect.left - this.offset.x;

    let y = e.clientY - boardRect.top - this.offset.y;

    this.draggedPiece.style.left = `${x}px`;

    this.draggedPiece.style.top = `${y}px`;
  }

  _onEnd() {
    if (!this.draggedPiece) return;

    const piece = this.draggedPiece;

    this.draggedPiece = null;

    const x = parseFloat(piece.style.left);

    const y = parseFloat(piece.style.top);

    const correctX = parseFloat(piece.dataset.correctX);

    const correctY = parseFloat(piece.dataset.correctY);

    const dx = x - correctX;
    const dy = y - correctY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 40) {
      piece.style.left = `${correctX}px`;

      piece.style.top = `${correctY}px`;

      piece.dataset.placed = true;

      piece.style.pointerEvents = "none";

      this.placedCount++;

      this._checkCompletion();
    }
  }

  _checkCompletion() {
    if (this.placedCount === this.totalPieces) {
      this.continueBtn.classList.add("enabled");
      this.continueBtn.textContent = "CONTINUAR";
    } else if (this.placedCount === this.collectedIndices.length) {
      // Faltan piezas, no se puede continuar
      this.continueBtn.textContent = "FALTAN PIEZAS...";
    }
  }
}

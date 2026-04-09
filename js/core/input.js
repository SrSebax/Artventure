export class Input {
    constructor() {
        this.keys = {};
        this.touch = {
            left: false,
            right: false,
            jump: false
        };

        this._initKeyboard();
        this._initTouch();
    }

    _initKeyboard() {
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            // Prevent scrolling with arrows/space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
    }

    _initTouch() {
        const setupBtn = (id, property) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('touchstart', e => {
                this.touch[property] = true;
                e.preventDefault();
            }, { passive: false });
            el.addEventListener('touchend', e => {
                this.touch[property] = false;
                e.preventDefault();
            }, { passive: false });
        };

        setupBtn('btnLeft', 'left');
        setupBtn('btnRight', 'right');
        setupBtn('btnJump', 'jump');
    }

    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touch.left;
    }

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touch.right;
    }

    isJump() {
        return this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'] || this.keys['KeyZ'] || this.touch.jump;
    }
}

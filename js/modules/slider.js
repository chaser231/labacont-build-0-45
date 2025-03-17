export class Slider {
    constructor(elementId, options = {}) {
        this.state = {
            isDown: false,
            startX: null,
            scrollLeft: null,
            scrollAmount: options.scrollAmount || 385
        };

        this.slider = document.getElementById(elementId);
        if (this.slider) {
            this.init();
        }
    }

    init() {
        // Десктопные события
        this.slider.addEventListener('mousedown', (e) => this.startDragging(e));
        this.slider.addEventListener('mouseleave', () => this.stopDragging());
        this.slider.addEventListener('mouseup', () => this.stopDragging());
        this.slider.addEventListener('mousemove', (e) => this.drag(e));

        // Мобильные события
        this.slider.addEventListener('touchstart', (e) => this.startTouchDragging(e), { passive: true });
        this.slider.addEventListener('touchend', () => this.stopDragging(), { passive: true });
        this.slider.addEventListener('touchmove', (e) => this.touchDrag(e), { passive: true });
    }

    startDragging(e) {
        this.state.isDown = true;
        this.slider.style.cursor = 'grabbing';
        this.state.startX = e.pageX - this.slider.offsetLeft;
        this.state.scrollLeft = this.slider.scrollLeft;
    }

    stopDragging() {
        this.state.isDown = false;
        this.slider.style.cursor = 'grab';
    }

    drag(e) {
        if (!this.state.isDown) return;
        e.preventDefault();
        const x = e.pageX - this.slider.offsetLeft;
        const walk = (x - this.state.startX) * 2;
        this.slider.scrollLeft = this.state.scrollLeft - walk;
    }

    startTouchDragging(e) {
        this.state.isDown = true;
        this.state.startX = e.touches[0].pageX - this.slider.offsetLeft;
        this.state.scrollLeft = this.slider.scrollLeft;
    }

    touchDrag(e) {
        if (!this.state.isDown) return;
        const x = e.touches[0].pageX - this.slider.offsetLeft;
        const walk = (x - this.state.startX) * 2;
        this.slider.scrollLeft = this.state.scrollLeft - walk;
    }
} 
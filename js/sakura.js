// Sakura Petals Effect - gentle falling cherry blossom petals
(function () {
    'use strict';

    var CONFIG = {
        petalCount: 20,
        minSize: 10,
        maxSize: 18,
        minDuration: 8,
        maxDuration: 20,
        minDelay: 0,
        maxDelay: 10,
        colors: {
            light: ['#fce4ec', '#f8bbd0', '#fce4ec', '#ffcdd2', '#fff0f5'],
            medium: ['#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60']
        },
        opacityMin: 0.35,
        opacityMax: 0.7
    };

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function createSakuraEffect() {
        var container = document.createElement('div');
        container.className = 'sakura-container';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);

        for (var i = 0; i < CONFIG.petalCount; i++) {
            var petal = document.createElement('div');
            petal.className = 'sakura-petal';

            var size = randomBetween(CONFIG.minSize, CONFIG.maxSize);
            var height = size * randomBetween(1.2, 1.6);
            var duration = randomBetween(CONFIG.minDuration, CONFIG.maxDuration);
            var delay = randomBetween(CONFIG.minDelay, CONFIG.maxDelay);
            var left = randomBetween(2, 98);
            var opacity = randomBetween(CONFIG.opacityMin, CONFIG.opacityMax);
            var color = randomBetween(0, 1) > 0.5
                ? pickRandom(CONFIG.colors.light)
                : pickRandom(CONFIG.colors.medium);

            var driftX = randomBetween(-80, 80);
            var driftX2 = randomBetween(-120, 120);
            var driftX3 = randomBetween(-60, 60);

            var keyframesName = 'sakuraFall_' + i;

            var keyframes = [
                '@keyframes ' + keyframesName + ' {',
                '0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }',
                '5% { opacity: ' + opacity + '; }',
                '25% { transform: translateY(25vh) translateX(' + (driftX) + 'px) rotate(' + randomBetween(-120, 120) + 'deg); }',
                '50% { transform: translateY(50vh) translateX(' + (driftX2) + 'px) rotate(' + randomBetween(-240, 240) + 'deg); }',
                '75% { transform: translateY(75vh) translateX(' + (driftX3) + 'px) rotate(' + randomBetween(-360, 360) + 'deg); opacity: ' + (opacity * 0.7) + '; }',
                '100% { transform: translateY(105vh) translateX(' + (driftX3 + 30) + 'px) rotate(' + randomBetween(-480, 480) + 'deg); opacity: 0; }',
                '}'
            ].join('\n');

            var styleSheet = document.createElement('style');
            styleSheet.textContent = keyframes;
            document.head.appendChild(styleSheet);

            // Sakura petal shape: rounded blob with a notch
            petal.style.cssText = [
                'left: ' + left + '%;',
                'width: ' + size + 'px;',
                'height: ' + height + 'px;',
                'background: ' + color + ';',
                'border-radius: 50% 0 50% 50%;',
                'animation-name: ' + keyframesName + ';',
                'animation-duration: ' + duration + 's;',
                'animation-delay: ' + delay + 's;',
                'animation-iteration-count: infinite;',
                'opacity: ' + opacity + ';',
                'transform: rotate(' + randomBetween(0, 360) + 'deg);'
            ].join('\n');

            container.appendChild(petal);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSakuraEffect);
    } else {
        createSakuraEffect();
    }
})();

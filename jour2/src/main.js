import './style.css';
import { initSphereDemo, disposeSphereDemo } from './demos/sphere.js';
import { initSuzanneDemo, disposeSuzanneDemo } from './demos/suzanne.js';
import { initExercise, disposeExercise } from './demos/exercise.js';
import { initExerciseCorrection, disposeExerciseCorrection } from './demos/exercise-correction.js';
import { initExerciseSimplified, disposeExerciseSimplified } from './demos/exercise-simplified.js';

let currentDispose = null;

const demos = {
    sphere: {
        init: initSphereDemo,
        dispose: disposeSphereDemo
    },
    suzanne: {
        init: initSuzanneDemo,
        dispose: disposeSuzanneDemo
    },
    exercise: {
        init: initExercise,
        dispose: disposeExercise
    },
    correction: {
        init: initExerciseCorrection,
        dispose: disposeExerciseCorrection
    },
    simplified: {
        init: initExerciseSimplified,
        dispose: disposeExerciseSimplified
    }
};

function switchDemo(demoName) {
    if (currentDispose) {
        currentDispose();
        currentDispose = null;
    }

    const demo = demos[demoName];
    if (demo) {
        const { cleanup } = demo.init();
        currentDispose = () => {
            cleanup();
            if (demo.dispose) demo.dispose();
        };

        document.querySelectorAll('#nav button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.demo === demoName);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#nav button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchDemo(btn.dataset.demo);
        });
    });

    const hash = window.location.hash.slice(1) || 'sphere';
    switchDemo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'sphere';
    switchDemo(hash);
});
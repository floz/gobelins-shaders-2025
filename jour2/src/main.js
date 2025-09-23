import './style.css';
import { initHelloWorldDemo, disposeHelloWorldDemo } from './demos/hello-world.js';
import { initHelloWorldExercise, disposeHelloWorldExercise } from './exercises/hello-world/index.js';
import { initSphereDemo, disposeSphereDemo } from './demos/sphere.js';
import { initSuzanneDemo, disposeSuzanneDemo } from './demos/suzanne.js';
import { initExercise, disposeExercise } from './demos/exercise.js';
import { initExerciseCorrection, disposeExerciseCorrection } from './demos/exercise-correction.js';
import { initExerciseSimplified, disposeExerciseSimplified } from './demos/exercise-simplified.js';

let currentDispose = null;

const demos = {
    'hello-world': {
        init: initHelloWorldDemo,
        dispose: disposeHelloWorldDemo
    },
    'hello-world-exercise': {
        init: initHelloWorldExercise,
        dispose: disposeHelloWorldExercise
    },
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

    const hash = window.location.hash.slice(1) || 'hello-world';
    switchDemo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'hello-world';
    switchDemo(hash);
});
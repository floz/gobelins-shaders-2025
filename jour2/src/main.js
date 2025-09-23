import './style.css';
import { initHelloWorldDemo, disposeHelloWorldDemo } from './demos/hello-world.js';
import { initHelloWorldExercise, disposeHelloWorldExercise } from './exercises/hello-world/index.js';
import { initSphereDemo, disposeSphereDemo } from './demos/sphere.js';
import { initSphereExercise, disposeSphereExercise } from './exercises/sphere/index.js';
import { initSuzanneDemo, disposeSuzanneDemo } from './demos/suzanne.js';
import { initExercise, disposeExercise } from './demos/exercise.js';
import { initSuzanneExercise, disposeSuzanneExercise } from './exercises/suzanne/index.js';
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
    sphereExercise: {
        init: initSphereExercise,
        dispose: disposeSphereExercise
    },
    suzanne: {
        init: initSuzanneDemo,
        dispose: disposeSuzanneDemo
    },
    exercise: {
        init: initSuzanneExercise,
        dispose: disposeSuzanneExercise
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

function switchDemo(demoName, updateUrl = true) {
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

        // Update URL without reloading the page
        if (updateUrl) {
            const url = new URL(window.location);
            url.searchParams.set('demo', demoName);
            window.history.pushState({ demo: demoName }, '', url);
        }
    }
}

// Helper function to get demo from URL
function getDemoFromUrl() {
    const url = new URL(window.location);
    return url.searchParams.get('demo') || 'hello-world';
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#nav button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchDemo(btn.dataset.demo);
        });
    });

    // Load initial demo from URL params
    const currentDemo = getDemoFromUrl();
    switchDemo(currentDemo, false); // Don't update URL on initial load
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    const demo = event.state?.demo || getDemoFromUrl();
    switchDemo(demo, false); // Don't update URL when navigating history
});
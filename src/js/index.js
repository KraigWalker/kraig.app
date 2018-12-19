if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(process.env.SW_PATH).then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        })
    })
}

/**
 * Enable a button inviting the user to preload the article.
 * check caches for 
 */
function addPreloadHint() {
    const btns = document.querySelectorAll('button[data-pre-status]');
    
    btns.forEach((element, key, parent) => {
        switch(element.dataset.preload) {
            case 1: {
                // preload available
                element.classList.add('pr-on');
                // add click handler
                element.addEventListener('click', handleUserPreloadRequest.bind(element));
            }
            case 2: {
                // preloaded by user
                element.classList.add('pr-done');
            }
            case 0:
            default: {
                // preload disabled
                element.classList.add('pr-off');
            }
        }
    });
}

/**
 * When the user taps the preload button, instruct the ServiceWorker to precache relevant resources
 */
function handleUserPreloadRequest() {

    navigator.serviceWorker.controller.postMessage()

    // fetch the data-preload-url,
    // if response is json:
        // parse and fetch all subresources
    // else
    // add response (text/html) to cache
    // When done, signal completion to the page
}
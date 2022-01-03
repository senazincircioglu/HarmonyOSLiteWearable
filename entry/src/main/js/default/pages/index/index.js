import router from '@system.router'
import app from '@system.app'

export default {
    data: {
        title: 'Step Speed Calculator'
    },
    start() {
        router.replace({
            uri: 'pages/calculateSpeed/calculateSpeed'
        });
    },
    touchMove(e) { // Handle the swipe event.
        if (e.direction == "right") // Swipe right to exit.
        {
            this.appExit();
        }
    },
    appExit() { // Exit the application.
        app.terminate();
    }
}

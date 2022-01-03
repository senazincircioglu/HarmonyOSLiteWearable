import router from '@system.router'

export default {
    backToHome(){
        router.replace({
            uri: 'pages/index/index'
        });
    },
}
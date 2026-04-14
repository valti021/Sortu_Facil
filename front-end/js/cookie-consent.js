(function(){
    function getCookie(name){
        const v = document.cookie.match('(^|;)\\s*'+name+'\\s*=\\s*([^;]+)');
        return v ? v.pop() : null;
    }

    function setCookie(name,value,days){
        let expires = "";
        if(days){
            const d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + d.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function postConsent(value){
        fetch('../php/salvar-consentimento-cookie.php',{
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:'consent='+encodeURIComponent(value),
            credentials:'same-origin'
        }).catch(function(err){
            console.warn('Erro ao enviar consentimento ao servidor',err);
        });
    }

    document.addEventListener('DOMContentLoaded',function(){
        const banner = document.getElementById('cookie-consent');
        if(!banner) return;
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');
        const laterBtn = document.getElementById('cookie-later');

        const existing = getCookie('cookie_consent');
        if(existing){
            banner.style.display = 'none';
            return;
        }

        // show banner
        banner.style.display = 'flex';

        acceptBtn.addEventListener('click', function(){
            setCookie('cookie_consent','accepted',365);
            postConsent('accepted');
            banner.style.display = 'none';
        });

        declineBtn.addEventListener('click', function(){
            setCookie('cookie_consent','declined',365);
            postConsent('declined');
            banner.style.display = 'none';
        });

        laterBtn.addEventListener('click', function(){
            setCookie('cookie_consent','later',7);
            postConsent('later');
            banner.style.display = 'none';
        });
    });
})();

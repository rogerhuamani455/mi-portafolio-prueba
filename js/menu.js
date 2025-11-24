document.addEvenListener('DOMContentLoaded', function() {
    
    const toggleButton = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('main-nav');

    toggleButton.addEventListener('click', function () {

        navMenu.classList.toggle('active');

        const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !isExpanded);
    })
})
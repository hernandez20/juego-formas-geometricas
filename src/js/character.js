const hand = document.querySelector('.hand');
const character = document.querySelector('.validArea');

const radius = 10;

function moveHand(e) {
    const characterRect = character.getBoundingClientRect();

    const posX = e.touches ? e.touches[0].clientX : e.clientX;
    const posY = e.touches ? e.touches[0].clientY : e.clientY;

    const centerX = characterRect.left + characterRect.width / 2;
    const centerY = characterRect.top + characterRect.height / 2;

    const deltaX = posX - centerX;
    const deltaY = posY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const angle = Math.atan2(deltaY, deltaX);
    const limitedX = distance > radius ? centerX + radius * Math.cos(angle) : posX;
    const limitedY = distance > radius ? centerY + radius * Math.sin(angle) : posY;

    hand.style.left = `${limitedX - characterRect.left - hand.offsetWidth / 2}px`;
    hand.style.top = `${limitedY - characterRect.top - hand.offsetHeight / 2}px`;
}

function initializeHandPosition() {
    const characterRect = character.getBoundingClientRect();
    
    hand.style.left = `${-20}px`;
    hand.style.top = `${-10}px`;
}

document.addEventListener('mousemove', moveHand);
document.addEventListener('touchmove', moveHand);

initializeHandPosition();

const debugEl = document.getElementById('debug'),
    iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"],
    icon_width = 79,
    icon_height = 79,
    num_icons = 9,
    time_per_icon = 100,
    indexes = [0, 0, 0];

const roll = (reel, offset = 0) => {
    const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);
    return new Promise((resolve, reject) => {

        const style = getComputedStyle(reel),
            backgroundPositionY = parseFloat(style["background-position-y"]),
            targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
            normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

        setTimeout(() => {
            reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
            reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
        }, offset * 150);

        setTimeout(() => {
            reel.style.transition = `none`;
            reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
            resolve(delta % num_icons);
        }, (8 + 1 * delta) * time_per_icon + offset * 150);

    });
};

const rollButton = document.getElementById('rollButton');
rollButton.addEventListener('click', rollAll);

const coinBalanceElement = document.getElementById('coinBalance');
let coinBalance = 50;
const spinCost = 5;

const updateCoinBalance = () => {
    document.getElementById('coinBalance').textContent = `Coins: ${coinBalance}`;
};

function rollAll() {
    if (coinBalance < spinCost) {
        alert('Not enough coins to spin!');
        return;
    }

    coinBalance -= spinCost;
    updateCoinBalance();
    debugEl.textContent = 'rolling...';

    rollButton.disabled = true; // Disable the button

    const reelsList = document.querySelectorAll('.slots > .reel');

    Promise

        .all([...reelsList].map((reel, i) => roll(reel, i)))

        .then((deltas) => {
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
            debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');

            // Win conditions
            if (indexes[0] == indexes[1] || indexes[1] == indexes[2] || indexes[0] == indexes[2]) {
                const winCls = (indexes[0] == indexes[1] && indexes[1] == indexes[2]) ? "win2" : "win1";
                document.querySelector(".slots").classList.add(winCls);
                setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 2000)
            
                if (indexes[0] == indexes[1] && indexes[1] == indexes[2]) {
                    coinBalance += 50; // Three matching images
                    const winPopup = document.getElementById('winPopup');
                    winPopup.textContent = `You won 50 coins!`;
                    winPopup.style.display = 'block';
                    setTimeout(() => {
                        winPopup.style.display = 'none';
                    }, 2000);
                } else if (indexes[0] == indexes[1] || indexes[1] == indexes[2] || indexes[0] == indexes[2]) {
                    coinBalance += 5; // Two matching images
                    const winPopup = document.getElementById('winPopup');
                    winPopup.textContent = `You won 5 coins!`;
                    winPopup.style.display = 'block';
                    setTimeout(() => {
                        winPopup.style.display = 'none';
                    }, 2000);
                }
                updateCoinBalance();
            
            }
            rollButton.disabled = false; // Re-enable the button after the spin is complete
        });
}

document.getElementById('rollButton').addEventListener('click', rollAll);
updateCoinBalance();
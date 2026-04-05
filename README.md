# Mushroom Hunter 2D Game

An engaging 2D platformer game where you take on the role of a Mushroom Hunter. Collect coins, throw stones, and take down elite enemies in a dynamic, evolving environment.

## Features

*   **Platformer Mechanics**: Smooth movement, jumping controls, and native Gamepad support.
*   **Dynamic Scoring**: Points for stomping mushrooms, hitting targets, and defeating legendary Elites. Beat your high score and a heroic fanfare plays!
*   **Resource Management**: Collect coins to purchase stones (10 🪨 for 25 🪙) and throw them at enemies.
*   **Shield System**: Complete **all three** milestones (**Stomper**, **Treasure Seeker**, and **Stone Slinger**) to earn a 🛡️ Shield — absorbs one enemy body hit that would otherwise end the game (max 1 at a time).
*   **Progression System**: 
    *   **Stomper**: Every 25 stomps.
    *   **Treasure Seeker**: Every 200 coins.
    *   **Stone Slinger**: Every 50 stones thrown.
    *   **Reward**: Every milestone grants 50 coins and a notification banner. A 🛡️ Shield is granted only when all three categories have been reached at least once.
*   **Elite Hunt**: Stomp 20 regular mushrooms to summon a legendary Elite enemy for double points.
*   **Dynamic Environments**: The world color palette shifts every 50 enemies stomped.
*   **Game Settings**: Customize music volume, haptic feedback, and dynamic UI settings.
*   **In-Game HUD**: Real-time progress bars for milestones, Elite hunting, and environment shifts.

## How to Play

### Controls
*   **Keyboard**: 
    *   Jump: `SPACE` or `↑`
    *   Buy Stones: `B`
    *   Throw Stones: `Z` or `X`
    *   Full Screen: `F` | Toggle Log: `P` | Rules: `R`
*   **Gamepad**: Native support for controller buttons (Jump: Cross, Buy: Triangle, Throw: Square).

## AI-Assisted Development

This project was developed with the AI assistance of:
 - gemini-3-flash via gemini-cli 
 - gemini 3.1 pro via Antigravity IDE
 - claude code (sonnet 4.6) via web

## Technology Stack

*   **Frontend**: Pure HTML5, CSS3, and modern JavaScript (ES Modules).
*   **Rendering**: HTML5 Canvas.
*   **Development**: Built with `five-server` for local development.

## Setup & Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/GrishaAngelovGH/mushroom-hunter-2d-game.git
    cd mushroom-hunter-2d-game
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the game**:
    ```bash
    npm start
    ```
    This will open the game in your default browser.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
